import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FileManager from '../components/FileManager';
import ActivityLog from '../components/ActivityLog';
import { filesAPI, foldersAPI, authAPI } from '../services/api';
function Dashboard() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex flex-col h-screen bg-black">
      <Header
        user={user}
        onRefresh={handleRefresh}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          folders={folders}
          currentFolder={currentFolder}
          onFolderSelect={handleFolderSelect}
          onRefresh={loadFolders}
        />
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Routes>
            <Route
              path="/"
              element={
                <FileManager
                  files={files}
                  folders={folders}
                  currentFolder={currentFolder}
                  loading={loading}
                  onRefresh={handleRefresh}
                  onFolderOpen={handleFolderSelect}
                />
              }
            />
            <Route path="/activity" element={<ActivityLog />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
export default Dashboard;
