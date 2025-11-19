import { Home, FileText, Activity } from 'lucide-react';

function Sidebar({ isOpen, currentFolder, onFolderBack, view, setView }) {
  if (!isOpen) return null;
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
      <div className="p-4 space-y-2">
        {currentFolder && (
          <button
            onClick={onFolderBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-300"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Back to My Drive</span>
          </button>
        )}
        
        <button
          onClick={() => setView('files')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            view === 'files'
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Files</span>
        </button>
        
        <button
          onClick={() => setView('activity')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            view === 'activity'
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Activity</span>
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
