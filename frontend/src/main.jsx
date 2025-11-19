import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { networkConfig } from './config/sui.js';
import App from './App.jsx';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';
const queryClient = new QueryClient();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SuiProviders } from './config/SuiProvider'
import '@mysten/dapp-kit/dist/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SuiProviders>
      <App />
    </SuiProviders>
  </StrictMode>,
);
