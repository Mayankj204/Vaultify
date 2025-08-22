// src/components/UploadModal.js
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import axios from 'axios';

const UploadModal = ({ isOpen, onClose, onUploadComplete, currentFolderId }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    const uploadPromises = files.map(async file => {
      try {
        const signedUrlResponse = await apiClient.post('/files/signed-url', {
          fileName: file.name,
          contentType: file.type,
        });
        const { signedUrl, path } = signedUrlResponse.data;

        await axios.put(signedUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
          },
        });

        await apiClient.post('/files/metadata', {
          name: file.name,
          path: path,
          mime_type: file.type,
          size: file.size,
          parentId: currentFolderId,
        });

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.success('All files uploaded successfully!', { id: toastId });
      onUploadComplete();
      handleClose();
    } catch (error) {
      toast.error('Some files failed to upload.', { id: toastId });
    }
  };

  const handleClose = () => {
    setFiles([]);
    setUploadProgress({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-text-primary">Upload Files</h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-text-secondary" />
          </button>
        </div>

        <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-purple-50' : 'border-border'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-text-secondary">
            {isDragActive ? 'Drop the files here...' : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            <h4 className="font-semibold">Selected Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                <FileIcon className="h-5 w-5 text-text-secondary" />
                <span className="text-sm truncate flex-1">{file.name}</span>
                {uploadProgress[file.name] !== undefined && (
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress[file.name]}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleUpload} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;