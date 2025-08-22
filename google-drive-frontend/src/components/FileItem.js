import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, FileImage, FileArchive, FileAudio, FileVideo, Star, Share2, Trash2, Undo, CircleX, Pencil, MoreVertical, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const getFileIcon = (mimeType) => {
  if (!mimeType) return <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />;
  if (mimeType.startsWith('image/')) return <FileImage className="h-6 w-6 text-blue-500 flex-shrink-0" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="h-6 w-6 text-red-500 flex-shrink-0" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="h-6 w-6 text-green-500 flex-shrink-0" />;
  if (mimeType.includes('pdf')) return <FileText className="h-6 w-6 text-red-700 flex-shrink-0" />;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-6 w-6 text-yellow-600 flex-shrink-0" />;
  return <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />;
};

const FileItem = ({ item, isRenaming, setRenamingId, onRename, onFolderClick, onFileClick, onShareClick, onTrash, onRestore, onDeleteForever, onStar, currentView }) => {
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform } = useDraggable({ id: item.id, data: item });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({ id: item.id, data: item, disabled: !item.is_folder });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined;

  const setNodeRef = (node) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleItemClick = (e) => {
    if (e.target.closest('button') || e.target.closest('form') || isRenaming) return;
    if (item.is_folder) {
      onFolderClick(item);
    } else {
      onFileClick(item);
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newName.trim() && newName !== item.name) {
      onRename(item.id, newName.trim());
    } else {
      setRenamingId(null);
    }
  };
  
  const handleCancelRename = () => {
    setNewName(item.name);
    setRenamingId(null);
  };
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '---';
    }
    return date.toLocaleDateString();
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${isOver ? 'bg-blue-100 border-blue-400' : 'bg-white border-border hover:shadow-md hover:border-primary'}`}
    >
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className="flex-shrink-0 cursor-grab" {...listeners} {...attributes}>
            <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        <div onClick={handleItemClick} className={`flex items-center gap-4 flex-grow min-w-0 ${item.is_folder ? 'cursor-pointer' : 'cursor-pointer'}`}>
            {item.is_folder ? <Folder className="h-6 w-6 text-primary flex-shrink-0" /> : getFileIcon(item.mime_type)}
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} className="flex-grow">
                <input ref={inputRef} type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleRenameSubmit} onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()} className="text-sm font-medium bg-white border border-primary rounded px-1 py-0.5 w-full"/>
              </form>
            ) : (
              <span className="text-sm font-medium text-text-primary truncate">{item.name}</span>
            )}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-4 text-sm text-text-secondary">
        <span className="hidden sm:inline w-24 text-right">
          {getFormattedDate(item.updated_at)}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentView === 'trash' ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); onRestore(item.id); }} title="Restore" className="p-2 rounded-full hover:bg-gray-100"><Undo className="h-5 w-5 text-green-600" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteForever(item.id); }} title="Delete Forever" className="p-2 rounded-full hover:bg-gray-100"><CircleX className="h-5 w-5 text-red-600" /></button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); onStar(item.id, item.is_starred); }} title={item.is_starred ? "Unstar" : "Star"} className="p-2 rounded-full hover:bg-gray-100">
                <Star className={`h-5 w-5 ${item.is_starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setRenamingId(item.id); }} title="Rename" className="p-2 rounded-full hover:bg-gray-100"><Pencil className="h-5 w-5" /></button>
              <button onClick={(e) => { e.stopPropagation(); onShareClick(item); }} title="Share" className="p-2 rounded-full hover:bg-gray-100"><Share2 className="h-5 w-5" /></button>
              <button onClick={(e) => { e.stopPropagation(); onTrash(item.id); }} title="Move to Trash" className="p-2 rounded-full hover:bg-gray-100"><Trash2 className="h-5 w-5" /></button>
            </>
          )}
        </div>
        <MoreVertical className="h-5 w-5 cursor-pointer sm:hidden" />
      </div>
    </div>
  );
};
export default FileItem;