import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { setWalletAddress, authAPI } from './services/api';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SharedFile from './pages/SharedFile';
import './App.css';
function App() {
  const currentAccount = useCurrentAccount();
  useEffect(() => {
    const loginUser = async () => {
      if (currentAccount?.address) {
        setWalletAddress(currentAccount.address);
        try {
          await authAPI.login(currentAccount.address);
        } catch (error) {
          console.error('Login failed:', error);
        }
      } else {
        setWalletAddress(null);
      }
    };
    loginUser();
  }, [currentAccount]);
  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={currentAccount ? <Navigate to="/drive" replace /> : <Landing />} />
        <Route path="/drive/*" element={currentAccount ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/share/:shareLink" element={<SharedFile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
export default App;
