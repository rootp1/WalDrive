import { ConnectButton } from '@mysten/dapp-kit';
import { HardDrive, Lock, Share2, Folder, Activity, Download } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center animate-fadeIn">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text">
            WalDrive
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Decentralized Storage Powered by Walrus
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Store your files securely on the Walrus network. A Google Drive-like interface for decentralized storage on Sui blockchain.
          </p>

          <div className="flex justify-center">
            <ConnectButton className="!bg-primary-600 hover:!bg-primary-700 !text-white !px-8 !py-4 !text-lg !rounded-lg !font-semibold transition-all transform hover:scale-105" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <FeatureCard
            icon={<HardDrive className="w-8 h-8" />}
            title="Decentralized Storage"
            description="Files stored on Walrus network, ensuring permanence and security"
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Public & Private"
            description="Control file visibility with public/private toggle"
          />
          <FeatureCard
            icon={<Share2 className="w-8 h-8" />}
            title="Easy Sharing"
            description="Generate shareable links for your files and folders"
          />
          <FeatureCard
            icon={<Folder className="w-8 h-8" />}
            title="Organized Folders"
            description="Create folder structures just like Google Drive"
          />
          <FeatureCard
            icon={<Download className="w-8 h-8" />}
            title="Fast Preview & Download"
            description="Preview files instantly and download when needed"
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="Activity Tracking"
            description="Monitor all your file operations and activities"
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600 text-sm">
          <p>Built for Walrus Haulout Hackathon 2025</p>
          <p className="mt-2">Powered by Walrus, Sui, and DeepSurge</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-primary-600 hover:shadow-lg hover:shadow-primary-600/20 transition-all duration-300 hover:-translate-y-1">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

export default Landing;
