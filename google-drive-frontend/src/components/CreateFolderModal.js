// src/components/CreateFolderModal.js

import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

// The component now accepts 'currentFolderId' as a prop
const CreateFolderModal = ({ isOpen, onClose, onFolderCreated, currentFolderId }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error('Folder name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      // Use the new endpoint and send the correct payload
      await apiClient.post('/files', {
        name: folderName,
        parentId: currentFolderId, // Pass the ID of the current folder
        is_folder: true,
      });
      toast.success(`Folder "${folderName}" created successfully!`);
      onFolderCreated(); // This will trigger a refetch of the file list
      handleClose();
    } catch (error) {
      toast.error('Failed to create folder.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <form onSubmit={handleCreate}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-text-primary">New Folder</h3>
            <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6 text-text-secondary" />
            </button>
          </div>
          
          <div>
            <input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Untitled folder"
              className="block w-full px-3 py-2 bg-white border border-border rounded-md text-sm shadow-sm focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;