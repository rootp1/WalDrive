import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Menu } from 'lucide-react';

function Header({ toggleSidebar }) {
  const currentAccount = useCurrentAccount();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text">
            WalDrive
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm">
              <span className="text-gray-400">Storage:</span>
              <span className="text-white font-medium">
                {formatStorage(user.storageUsed)} / {formatStorage(user.storageLimit)}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/drive/activity')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Activity Log"
          >
            <Activity className="w-5 h-5" />
          </button>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">
              {formatAddress(currentAccount?.address)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="p-2 hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header;
