import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Menu, Search, Settings, HelpCircle } from 'lucide-react';

function Header({ toggleSidebar }) {
  const currentAccount = useCurrentAccount();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-gray-800/50 px-4 py-2.5 sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="icon-btn"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <h1 className="text-xl font-medium tracking-tight text-gray-100">
              WalDrive
            </h1>
          </div>
        </div>

        {}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search in Drive"
              className="w-full bg-[#1a1a1a] border border-gray-800/50 rounded-full pl-12 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-600/50 focus:bg-[#202020] transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="icon-btn hidden md:block" aria-label="Help">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button className="icon-btn hidden md:block" aria-label="Settings">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          {currentAccount && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800/50 rounded-full text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">
                {formatAddress(currentAccount.address)}
              </span>
            </div>
          )}
          <div className="ml-2">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
