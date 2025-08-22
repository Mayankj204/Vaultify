import React, { useState, useEffect, useCallback } from 'react';
import { X, Link, UserPlus, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

const ShareModal = ({ isOpen, onClose, file }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [publicLink, setPublicLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchShareData = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const [collabRes, linkRes] = await Promise.all([
        apiClient.get(`/shares/${file.id}`),
        apiClient.get(`/shares/link/${file.id}`)
      ]);
      setCollaborators(collabRes.data);
      setPublicLink(linkRes.data);
    } catch (error) {
      toast.error("Could not load sharing information.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    if (isOpen) {
      fetchShareData();
    }
  }, [isOpen, fetchShareData]);

  const handleCreateLink = async () => {
    try {
        const response = await apiClient.post('/shares/link', { resourceId: file.id });
        setPublicLink(response.data);
        toast.success("Public link created!");
    } catch (error) {
        toast.error("Failed to create link.");
    }
  };

  const handleDeleteLink = async () => {
    if (!publicLink) return;
    try {
        await apiClient.delete(`/shares/link/${publicLink.id}`);
        setPublicLink(null);
        toast.success("Public link removed.");
    } catch (error) {
        toast.error("Failed to remove link.");
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}/share/${publicLink.token}`;
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter an email.");
    try {
      await apiClient.post('/shares', { resourceId: file.id, granteeEmail: email, role });
      toast.success(`Invitation sent to ${email}.`);
      setEmail('');
      fetchShareData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to invite user.");
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await apiClient.delete(`/shares/${shareId}`);
      toast.success("Access revoked.");
      fetchShareData();
    } catch (error) {
      toast.error("Failed to revoke access.");
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-text-primary truncate">Share "{file.name}"</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
        </div>
        
        <form onSubmit={handleInvite} className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-gray-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email to invite" className="flex-1 px-3 py-2 bg-white border border-border rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 bg-white border border-border rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-purple-700">Invite</button>
        </form>
        
        <div className="space-y-3 mb-6 max-h-32 overflow-y-auto">
          <h4 className="font-semibold">People with access</h4>
          {loading ? <p>Loading...</p> : collaborators.map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <p className="font-medium text-sm truncate">{c.grantee.email}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary capitalize">{c.role}</span>
                <button onClick={() => handleRevoke(c.id)} title="Revoke access"><Trash2 className="h-4 w-4 text-red-500"/></button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Get link</h4>
          {publicLink ? (
            <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-gray-50">
                    <Link className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <input type="text" readOnly value={`${window.location.origin}/share/${publicLink.token}`} className="text-sm text-text-secondary bg-transparent flex-1 outline-none"/>
                    <button onClick={handleCopyLink} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"><Copy className="h-4 w-4"/></button>
                </div>
                 <button onClick={handleDeleteLink} className="text-sm text-red-600 hover:underline">Delete link</button>
            </div>
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-border rounded-lg">
                <p className="text-sm text-text-secondary mb-2">Create a public link to share with anyone (view only).</p>
                <button onClick={handleCreateLink} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-purple-700">Create link</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;