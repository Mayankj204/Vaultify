import React, { useState } from 'react';
import FileItem from './FileItem';
import { ChevronRight, FolderPlus, ArrowDownUp, Check } from 'lucide-react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';

// Renamed component and text to "Vaultify"
const VaultifyBreadcrumb = ({ onBreadcrumbClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'root-droppable',
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onBreadcrumbClick(null, -1)}
      className={`cursor-pointer hover:underline p-1 rounded-md ${isOver ? 'bg-blue-100' : ''}`}
    >
      Vaultify
    </div>
  );
};

const FileList = ({ files, onMove, sortBy, setSortBy, sortOrder, setSortOrder, ...props }) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'updated_at', label: 'Last Modified' },
    { key: 'size_bytes', label: 'Size' },
  ];

  const handleSortChange = (key) => {
    setSortBy(key);
    setIsSortMenuOpen(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (over.id === 'root-droppable') {
      onMove(active.id, null);
      return;
    }
    if (active.id !== over.id) {
        const targetFolder = over.data.current;
        if (targetFolder && targetFolder.is_folder) {
            onMove(active.id, over.id);
        }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="p-4">
        <div className="flex items-center text-sm text-text-secondary mb-4">
          { props.currentView === 'drive' && (
            <>
              <VaultifyBreadcrumb onBreadcrumbClick={props.onBreadcrumbClick} />
              {props.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="h-4 w-4 mx-1" />
                  <span onClick={() => props.onBreadcrumbClick(crumb.id, index)} className="cursor-pointer hover:underline text-text-primary font-medium">{crumb.name}</span>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          {/* Updated "Drive" to "My Files" for clarity */}
          <h2 className="text-xl font-semibold text-text-primary capitalize">{props.currentView === 'drive' ? 'My Files' : props.currentView}</h2>
          
          {props.currentView === 'drive' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  <span>Sort by: {sortOptions.find(opt => opt.key === sortBy)?.label}</span>
                </button>
                {isSortMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    {sortOptions.map(opt => (
                      <div key={opt.key} onClick={() => handleSortChange(opt.key)} className="flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                        <span>{opt.label}</span>
                        {sortBy === opt.key && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownUp className={`h-5 w-5 text-text-secondary transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
              </button>
              <button 
                onClick={props.onCreateFolderClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                <FolderPlus className="h-5 w-5 text-text-secondary" />
                <span>New Folder</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {files.length > 0 ? (
            files.map((item) => (
              <FileItem 
                key={item.id} 
                item={item} 
                {...props}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-text-secondary">This folder is empty</p>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
export default FileList;