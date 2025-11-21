import { Download, Trash2, Share2, Eye, Info, Star, FolderInput, Edit3, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';

function ContextMenu({ x, y, file, onClose, onAction, isStarred, isTrashed }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = isTrashed ? [
    { icon: RotateCcw, label: 'Restore', action: 'restore', color: 'text-green-400' },
    { icon: Trash2, label: 'Delete forever', action: 'permanentDelete', color: 'text-red-400', divider: true },
  ] : [
    { icon: Eye, label: 'Preview', action: 'preview', shortcut: '' },
    { icon: Download, label: 'Download', action: 'download', shortcut: '', divider: true },
    { icon: Star, label: isStarred ? 'Unstar' : 'Add to starred', action: 'star', color: isStarred ? 'text-yellow-500' : '' },
    { icon: Edit3, label: 'Rename', action: 'rename', shortcut: 'Ctrl+Alt+E' },
    { icon: Share2, label: 'Share', action: 'share', shortcut: '' },
    { icon: FolderInput, label: 'Organize', action: 'organize', shortcut: '', divider: true },
    { icon: Info, label: 'File information', action: 'info', shortcut: '' },
    { icon: Trash2, label: 'Move to trash', action: 'trash', shortcut: 'Delete', color: 'text-gray-400' },
  ];

  // Adjust position if menu would go off screen
  const adjustedX = x;
  const adjustedY = y;

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#2d2d2d] border border-gray-700/50 rounded-lg shadow-2xl py-1.5 z-[9999] min-w-[280px] animate-scaleIn"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
    >
      {menuItems.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => {
              onAction(item.action, file);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3a3a3a] transition-colors text-left group"
          >
            <item.icon className={`w-4 h-4 ${item.color || 'text-gray-400'} group-hover:text-gray-200 transition-colors`} />
            <span className={`flex-1 text-sm ${item.color || 'text-gray-200'} group-hover:text-white font-normal`}>
              {item.label}
            </span>
            {item.shortcut && (
              <span className="text-xs text-gray-500 group-hover:text-gray-400">
                {item.shortcut}
              </span>
            )}
          </button>
          {item.divider && <div className="border-t border-gray-700/50 my-1.5" />}
        </div>
      ))}
    </div>
  );
}

export default ContextMenu;
