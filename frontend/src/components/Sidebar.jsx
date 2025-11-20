import { Home, FileText, Activity, Users, Star, Trash2, Cloud } from 'lucide-react';

function Sidebar({ isOpen, currentFolder, onFolderBack, view, setView }) {
  if (!isOpen) return null;
  
  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-gray-800/50 flex flex-col fixed h-full top-[57px] pt-4 custom-scrollbar overflow-y-auto">
      <div className="px-3 space-y-1">
        {currentFolder && (
          <button
            onClick={onFolderBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 hover:bg-gray-800/60 text-gray-300 mb-2"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Back to My Drive</span>
          </button>
        )}
        
        <button
          onClick={() => setView('files')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 ${
            view === 'files'
              ? 'bg-primary-600/20 text-primary-400'
              : 'hover:bg-gray-800/60 text-gray-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">My Drive</span>
        </button>
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 hover:bg-gray-800/60 text-gray-300"
        >
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Shared with me</span>
        </button>
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 hover:bg-gray-800/60 text-gray-300"
        >
          <Star className="w-5 h-5" />
          <span className="text-sm font-medium">Starred</span>
        </button>
        
        <button
          onClick={() => setView('activity')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 ${
            view === 'activity'
              ? 'bg-primary-600/20 text-primary-400'
              : 'hover:bg-gray-800/60 text-gray-300'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Recent</span>
        </button>
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-150 hover:bg-gray-800/60 text-gray-300"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Trash</span>
        </button>
      </div>

      {}
      <div className="mt-auto p-4">
        <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-gray-400">Storage</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 h-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xxs text-gray-500">
              4.5 GB of 10 GB used
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
