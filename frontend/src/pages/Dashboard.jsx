import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FileManager from '../components/FileManager';
import ActivityLog from '../components/ActivityLog';

function Dashboard() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  const [currentFolder, setCurrentFolder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('files');
  useEffect(() => {
    loadUserData();
    loadFolders();
    loadFiles();
  }, []);
  useEffect(() => {
    if (currentFolder) {
      loadFiles(currentFolder._id);
      loadFolders(currentFolder._id);
    } else {
      loadFiles(null);
      loadFolders(null);
    }
  }, [currentFolder]);
  const loadUserData = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };
  const loadFolders = async (parentId = null) => {
    try {
      const { data } = await foldersAPI.getAll({ parentId });
      setFolders(data.folders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };
  const loadFiles = async (folderId = null) => {
    try {
      setLoading(true);
      const { data } = await filesAPI.getAll({ folderId });
      setFiles(data.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleFolderSelect = (folder) => {
    setCurrentFolder(folder);
  };
  const handleRefresh = () => {
    loadFiles(currentFolder?._id);
    loadFolders(currentFolder?._id);
    loadUserData();
  };
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header 
        toggleSidebar={toggleSidebar}
      />
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentFolder={currentFolder}
          onFolderBack={handleFolderBack}
          view={view}
          setView={setView}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {view === 'files' ? (
            <FileManager
              currentFolder={currentFolder}
              onFolderOpen={handleFolderOpen}
            />
          ) : (
            <ActivityLog />
          )}
        </main>
      </div>
    </div>
  );
}
export default Dashboard;
