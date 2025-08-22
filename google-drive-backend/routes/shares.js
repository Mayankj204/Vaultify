const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('../authMiddleware');
const router = express.Router();
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- NEW PUBLIC ROUTE ---
// This route is PUBLIC and does not use the 'protect' middleware.
// It allows anyone with a valid token to view the shared file's data.
router.get('/public/:token', async (req, res) => {
    const { token } = req.params;
    try {
        // Step 1: Find the link_share record by its token
        const { data: linkShare, error: linkError } = await supabase
            .from('link_shares')
            .select('resource_id')
            .eq('token', token)
            .single();

        if (linkError || !linkShare) {
            return res.status(404).json({ error: 'Share link not found or has expired.' });
        }

        // Step 2: Use the resource_id to fetch the actual file/folder node
        const { data: node, error: nodeError } = await supabase
            .from('nodes')
            .select('*')
            .eq('id', linkShare.resource_id)
            .single();
        
        if (nodeError || !node) {
            return res.status(404).json({ error: 'The shared file or folder does not exist.' });
        }
        
        // Return the file/folder data
        res.status(200).json(node);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- PROTECTED ROUTES FOR LOGGED-IN USERS ---

// Get a list of users a resource is shared with
router.get('/:resourceId', protect, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { data: shares, error: sharesError } = await supabase.from('shares').select('id, role, grantee_user_id').eq('resource_id', resourceId).eq('created_by', req.user.id);
    if (sharesError) throw sharesError;
    if (!shares || shares.length === 0) return res.status(200).json([]);
    const populatedShares = await Promise.all(shares.map(async (share) => {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(share.grantee_user_id);
      if (userError || !user) return null;
      return { id: share.id, role: share.role, grantee: { id: user.id, email: user.email } };
    }));
    res.status(200).json(populatedShares.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share with a specific user
router.post('/', protect, async (req, res) => {
  const { resourceId, granteeEmail, role } = req.body;
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ email: granteeEmail });
    if (listError) throw listError;
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User with that email not found.' });
    }
    const grantee = users[0];
    const { data, error } = await supabase.from('shares').insert({ resource_id: resourceId, grantee_user_id: grantee.id, role, created_by: req.user.id }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a public shareable link
router.post('/link', protect, async (req, res) => {
    const { resourceId } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const { data, error } = await supabase.from('link_shares').insert({ resource_id: resourceId, token, created_by: req.user.id }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// Get an existing public link for a resource
router.get('/link/:resourceId', protect, async (req, res) => {
    const { resourceId } = req.params;
    const { data, error } = await supabase.from('link_shares').select('*').eq('resource_id', resourceId).eq('created_by', req.user.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// Delete a public link
router.delete('/link/:linkId', protect, async (req, res) => {
    const { linkId } = req.params;
    const { error } = await supabase.from('link_shares').delete().eq('id', linkId).eq('created_by', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Link deleted' });
});

// Revoke access from a specific user
router.delete('/:shareId', protect, async (req, res) => {
  const { shareId } = req.params;
  const { error } = await supabase.from('shares').delete().eq('id', shareId).eq('created_by', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Access revoked.' });
});

module.exports = router;