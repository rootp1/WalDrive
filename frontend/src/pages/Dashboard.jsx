import { useState, useEffect } from 'react';
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
    if (!currentAccount) {
      navigate('/');
    }
  }, [currentAccount, navigate]);

  const handleFolderOpen = (folder) => {
    setCurrentFolder(folder);
  };

  const handleFolderBack = () => {
    setCurrentFolder(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
