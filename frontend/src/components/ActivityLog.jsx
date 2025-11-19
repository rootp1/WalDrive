import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, Share2, FolderPlus, Eye, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activityAPI } from '../services/api';
import { Clock, Upload, Download, Trash2, FolderPlus, Edit } from 'lucide-react';

function ActivityLog() {
  const loading = false;
  const activities = [];
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    loadActivities();
    loadStats();
  }, []);
  const loadActivities = async () => {
    try {
      setLoading(true);
      const { data } = await activityAPI.getAll({ limit: 50 });
      setActivities(data.activities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadStats = async () => {
    try {
      const { data } = await activityAPI.getStats({ days: 7 });
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  const getActionIcon = (action) => {
    switch (action) {
      case 'upload':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'download':
        return <Download className="w-5 h-5 text-green-500" />;
      case 'delete':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'delete_folder':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      case 'create_folder':
        return <FolderPlus className="w-5 h-5 text-yellow-500" />;
      case 'view':
        return <Eye className="w-5 h-5 text-gray-400" />;
      case 'update':
        return <Edit className="w-5 h-5 text-orange-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-400" />;
    }
  };
  const getActionText = (action) => {
    const actions = {
      upload: 'uploaded',
      download: 'downloaded',
      delete: 'deleted',
      delete_folder: 'deleted folder',
      share: 'shared',
      create_folder: 'created folder',
      view: 'viewed',
      update: 'updated',
    };
    return actions[action] || action;
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };
  return (
    <div className="p-6">
      {}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/drive')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Log</h2>
          <p className="text-gray-400 text-sm mt-1">
            Track all your file operations and activities
          </p>
        </div>
      </div>
      {}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {stats.byAction.map((stat) => (
            <div
              key={stat._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                {getActionIcon(stat._id)}
                <span className="text-sm text-gray-400 capitalize">
                  {getActionText(stat._id)}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.count}</p>
            </div>
          ))}
        </div>
      )}
      {}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Eye className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No activities yet</h3>
          <p className="text-gray-500">Your file operations will appear here</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="p-4 hover:bg-gray-850 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white">
                      <span className="font-medium">You</span>{' '}
                      <span className="text-gray-400">{getActionText(activity.action)}</span>{' '}
                      <span className="font-medium">{activity.resourceName}</span>
                    </p>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.details.size && `Size: ${(activity.details.size / 1024).toFixed(1)} KB`}
                        {activity.details.filesDeleted && ` • ${activity.details.filesDeleted} files deleted`}
                        {activity.details.subfoldersDeleted && ` • ${activity.details.subfoldersDeleted} folders deleted`}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default ActivityLog;
