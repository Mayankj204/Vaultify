import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Folder, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PublicSharePage = () => {
    const { token } = useParams();
    const [node, setNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSharedNode = async () => {
            if (!token) {
                setError('No share token provided.');
                setLoading(false);
                return;
            }
            try {
                // This calls our new public backend endpoint
                const response = await axios.get(`http://localhost:3001/api/shares/public/${token}`);
                setNode(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Could not load the shared item.');
            } finally {
                setLoading(false);
            }
        };
        fetchSharedNode();
    }, [token]);

    const handleDownload = () => {
        if (!node || node.is_folder || !node.path) {
            toast.error("This item cannot be downloaded.");
            return;
        }
        try {
            // This creates a public URL directly from your Supabase storage bucket
            const publicURL = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/user-files/${node.path}`;
            window.open(publicURL, '_blank');
        } catch (error) {
            toast.error("Could not generate download link.");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading shared file...</div>;
    }

    if (error || !node) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error || 'Shared item not found.'}</div>;
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
                    <div className="flex items-center gap-4 mb-6">
                        {node.is_folder ? (
                            <Folder className="h-12 w-12 text-primary flex-shrink-0" />
                        ) : (
                            <FileText className="h-12 w-12 text-gray-500 flex-shrink-0" />
                        )}
                        <h1 className="text-2xl font-semibold truncate" title={node.name}>{node.name}</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">You have been granted access to view this item.</p>
                    
                    {!node.is_folder && (
                        <button 
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 mt-6 bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            <span>Download ({ (node.size_bytes / (1024*1024)).toFixed(2) } MB)</span>
                        </button>
                    )}
                </div>
                <footer className="mt-8 text-sm text-gray-400">
                    <p>© 2025 My Drive Clone</p>
                </footer>
            </div>
        </>
    );
};

export default PublicSharePage;