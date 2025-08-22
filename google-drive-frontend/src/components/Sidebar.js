import React from 'react';
import { HardDrive, Trash2, Plus, LogOut, Star, Clock } from 'lucide-react';

const Sidebar = ({ onUploadClick, currentView, setCurrentView, onLogout }) => {
  const getLinkClassName = (view) => `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${currentView === view ? 'bg-purple-100 text-primary font-semibold' : 'hover:bg-gray-100 text-text-secondary'}`;

  return (
    <aside className="w-64 bg-white p-4 border-r border-border flex flex-col">
      <div className="text-2xl font-bold text-primary mb-8">Vaultify</div>
      <button onClick={onUploadClick} className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors mb-8">
        <Plus className="h-5 w-5" />
        <span>New</span>
      </button>
      <nav className="flex flex-col gap-2 flex-grow">
        <div onClick={() => setCurrentView('drive')} className={getLinkClassName('drive')}><HardDrive className="h-5 w-5" /><span>My Files</span></div>
        <div onClick={() => setCurrentView('starred')} className={getLinkClassName('starred')}><Star className="h-5 w-5" /><span>Starred</span></div>
        <div onClick={() => setCurrentView('recent')} className={getLinkClassName('recent')}><Clock className="h-5 w-5" /><span>Recent</span></div>
        <div onClick={() => setCurrentView('trash')} className={getLinkClassName('trash')}><Trash2 className="h-5 w-5" /><span>Trash</span></div>
      </nav>
      <div onClick={onLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 text-text-secondary">
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </div>
    </aside>
  );
};
export default Sidebar;