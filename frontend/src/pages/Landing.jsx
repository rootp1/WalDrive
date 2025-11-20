import { ConnectButton } from '@mysten/dapp-kit';
import { HardDrive, Lock, Share2, Folder, Activity, Download, Sparkles } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/5 via-transparent to-primary-800/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-700/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-5xl mx-auto text-center animate-fadeIn relative z-10">
        {}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/10 border border-primary-600/20 rounded-full mb-8 animate-slideUp">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">Powered by Walrus Network</span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 text-transparent bg-clip-text tracking-tight">
            WalDrive
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-6 font-light">
            Decentralized Storage, Simplified
          </p>
          <p className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Store your files securely on the Walrus network with a familiar Google Drive-like interface. Built on Sui blockchain for true decentralization.
          </p>
          <div className="flex justify-center">
            <ConnectButton className="!bg-primary-600 hover:!bg-primary-700 !text-white !px-10 !py-4 !text-base !rounded-xl !font-medium transition-all transform hover:scale-105 !shadow-lg !shadow-primary-600/20" />
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<HardDrive className="w-7 h-7" />}
            title="Decentralized Storage"
            description="Files stored on Walrus network, ensuring permanence and security"
          />
          <FeatureCard
            icon={<Lock className="w-7 h-7" />}
            title="Public & Private"
            description="Control file visibility with public/private toggle"
          />
          <FeatureCard
            icon={<Share2 className="w-7 h-7" />}
            title="Easy Sharing"
            description="Generate shareable links for your files and folders"
          />
          <FeatureCard
            icon={<Folder className="w-7 h-7" />}
            title="Organized Folders"
            description="Create folder structures just like Google Drive"
          />
          <FeatureCard
            icon={<Download className="w-7 h-7" />}
            title="Fast Preview & Download"
            description="Preview files instantly and download when needed"
          />
          <FeatureCard
            icon={<Activity className="w-7 h-7" />}
            title="Activity Tracking"
            description="Monitor all your file operations and activities"
          />
        </div>
        
        {}
        <div className="mt-20 text-center text-gray-600 text-xs">
          <p className="mb-1">Built for Walrus Haulout Hackathon 2025</p>
          <p className="text-gray-700">Powered by Walrus, Sui, and DeepSurge</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="drive-card p-6 hover:border-primary-600/50 hover:shadow-xl hover:shadow-primary-600/10 transition-all duration-300 hover:-translate-y-1 group">
      <div className="text-primary-500 mb-4 group-hover:text-primary-400 transition-colors">{icon}</div>
      <h3 className="text-base font-medium mb-2 text-gray-100">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
export default Landing;
