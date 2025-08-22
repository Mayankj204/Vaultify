import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FileList from '../components/FileList';
import Footer from '../components/Footer';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';
import CreateFolderModal from '../components/CreateFolderModal';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { supabase } from '../supabaseClient';

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [currentView, setCurrentView] = useState('drive');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  useEffect(() => {
    const sessionString = localStorage.getItem('supabaseSession');
    if (sessionString) {
      const session = JSON.parse(sessionString);
      setUserEmail(session.user?.email || '');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingFiles(true);
    let url = '/files';
    const params = new URLSearchParams();
    params.append('_', new Date().getTime()); // Cache-busting

    if (debouncedSearchQuery) {
      setIsSearching(true);
      setBreadcrumbs([]);
      url = `/search?q=${debouncedSearchQuery}&${params.toString()}`;
    } else {
      setIsSearching(false);
      switch (currentView) {
        case 'starred': 
          url = `/meta/starred?${params.toString()}`; 
          break;
        case 'recent': 
          url = `/meta/recent?${params.toString()}`; 
          break;
        case 'trash': 
          params.append('view', 'trash'); 
          url = `/files?${params.toString()}`; 
          break;
        default: // 'drive'
          params.append('view', 'drive');
          if (currentFolderId) {
            params.append('parentId', currentFolderId);
          }
          params.append('sortBy', sortBy);
          params.append('sortOrder', sortOrder);
          url = `/files?${params.toString()}`;
      }
    }

    try {
      const response = await apiClient.get(url);
      const processedFiles = currentView === 'starred' 
        ? response.data.map(file => ({ ...file, is_starred: true })) 
        : response.data;
      setFiles(processedFiles);
    } catch (error) {
      toast.error("Could not load files. Please try refreshing.");
    } finally {
      setLoadingFiles(false);
      setIsSearching(false);
    }
  }, [currentView, currentFolderId, debouncedSearchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentView !== 'drive') {
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    }
    setSearchQuery('');
  }, [currentView]);

  const handleStar = async (nodeId, isCurrentlyStarred) => {
    try {
      if (isCurrentlyStarred) {
        await apiClient.delete(`/meta/stars/${nodeId}`);
        toast.success("Unstarred item.");
      } else {
        await apiClient.post('/meta/stars', { nodeId });
        toast.success("Starred item.");
      }
      fetchData();
    } catch (error) {
      toast.error("Could not update star status.");
    }
  };

  const handleDownload = async (file) => {
    if (file.is_folder) return;
    try {
      const toastId = toast.loading("Preparing file...");
      const response = await apiClient.get(`/files/${file.id}/download`);
      const { downloadUrl } = response.data;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Opening file...", { id: toastId });
    } catch (error) {
      toast.error("Could not open file.");
    }
  };
  
  const handleMove = async (draggedId, targetFolderId) => {
    if (draggedId === targetFolderId) return;
    try {
      await apiClient.patch(`/files/${draggedId}/move`, { newParentId: targetFolderId });
      toast.success("Item moved successfully.");
      fetchData();
    } catch (error) {
      toast.error("Failed to move item.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabaseSession');
    window.location.href = '/login';
    toast.success("You've been logged out.");
  };

  const handleRename = async (fileId, newName) => {
    try {
      await apiClient.patch(`/files/${fileId}/rename`, { newName });
      toast.success('Item renamed successfully.');
      fetchData();
    } catch (error) {
      toast.error('Failed to rename item.');
    } finally {
      setRenamingId(null);
    }
  };
  
  const handleShareClick = (file) => {
    setSelectedFile(file);
    setIsShareModalOpen(true);
  };
  
  const handleTrash = async (fileId) => {
    try {
      await apiClient.patch(`/files/${fileId}/trash`);
      toast.success('Item moved to trash.');
      fetchData();
    } catch (error) {
      toast.error('Failed to move item to trash.');
    }
  };

  const handleRestore = async (fileId) => {
    try {
      await apiClient.patch(`/files/${fileId}/restore`);
      toast.success('Item restored successfully.');
      fetchData();
    } catch (error) {
      toast.error('Failed to restore item.');
    }
  };
  
  const handleDeleteForever = async (fileId) => {
    if (window.confirm('Are you sure you want to permanently delete this? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/files/${fileId}`);
        toast.success('Item permanently deleted.');
        fetchData();
      } catch (error) {
        toast.error('Failed to permanently delete item.');
      }
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentView('drive');
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, {id: folder.id, name: folder.name}]);
  };

  const handleBreadcrumbClick = (folderId, index) => {
    setCurrentView('drive');
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setBreadcrumbs([]);
    } else {
      setBreadcrumbs(prev => prev.slice(0, index + 1));
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto">
          {(loadingFiles || isSearching) ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
            <FileList 
              files={files}
              currentView={currentView}
              breadcrumbs={breadcrumbs}
              renamingId={renamingId}
              setRenamingId={setRenamingId}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onRename={handleRename}
              onShareClick={handleShareClick}
              onTrash={handleTrash}
              onRestore={handleRestore}
              onDeleteForever={handleDeleteForever}
              onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
              onFolderClick={handleFolderClick}
              onBreadcrumbClick={handleBreadcrumbClick}
              onFileClick={handleDownload}
              onMove={handleMove}
              onStar={handleStar}
            />
          )}
        </main>
        <Footer />
      </div>
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={fetchData}
        currentFolderId={currentFolderId}
      />
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        file={selectedFile}
      />
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onFolderCreated={fetchData}
        currentFolderId={currentFolderId}
      />
    </div>
  );
};
export default DashboardPage;