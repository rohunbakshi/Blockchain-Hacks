import { useState } from 'react';
import { useRouter } from '../components/Router';
import { Wallet, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { GeminiWallet } from '@gemini-wallet/core';

// Initialize Gemini Wallet instance
let geminiWalletInstance: GeminiWallet | null = null;

async function connectGeminiWallet(): Promise<{ address: string; network: string } | null> {
  try {
    // Initialize Gemini Wallet if not already initialized
    // Default to Ethereum mainnet (chain id: 1)
    if (!geminiWalletInstance) {
      geminiWalletInstance = new GeminiWallet({
        appMetadata: {
          name: 'Credential Hub',
          description: 'Blockchain-verified credential management platform',
          url: window.location.origin,
          icon: `${window.location.origin}/favicon.ico`,
        },
        chain: {
          id: 1, // Ethereum Mainnet - can be changed to other supported chains
        },
      });
    }

    // Check if already connected (has accounts)
    if (geminiWalletInstance.accounts && geminiWalletInstance.accounts.length > 0) {
      const address = geminiWalletInstance.accounts[0];
      const chainId = geminiWalletInstance.chain.id;
      
      const networkMap: { [key: number]: string } = {
        1: 'mainnet', // Ethereum Mainnet
        42161: 'arbitrum', // Arbitrum
        8453: 'base', // Base
        137: 'polygon', // Polygon
        10: 'optimism', // Optimism
      };
      const network = networkMap[chainId] || 'mainnet';

      return {
        address,
        network,
      };
    }

    // Connect using Gemini Wallet SDK
    // This will open a popup for the user to connect their wallet
    const accounts = await geminiWalletInstance.connect();

    // Get address and network after connection
    if (!accounts || accounts.length === 0) {
      throw new Error('Failed to get wallet address after connection');
    }

    const address = accounts[0];
    const chainId = geminiWalletInstance.chain.id;
    
    const networkMap: { [key: number]: string } = {
      1: 'mainnet',
      42161: 'arbitrum',
      8453: 'base',
      137: 'polygon',
      10: 'optimism',
    };
    const network = networkMap[chainId] || 'mainnet';

    return {
      address,
      network,
    };
  } catch (error: any) {
    console.error('Gemini Wallet connection error:', error);
    
    // Handle specific error cases
    if (error.code === 'USER_REJECTED' || error.message?.includes('User rejected') || error.message?.includes('rejected')) {
      throw new Error('Connection was cancelled by user');
    }
    
    if (error.message?.includes('not detected') || error.message?.includes('not available') || error.message?.includes('not found')) {
      throw new Error('Gemini Wallet not detected. Please install the Gemini Wallet extension or visit gemini.com/wallet');
    }

    throw new Error(error.message || 'Failed to connect to Gemini Wallet. Please try again.');
  }
}

export function WalletConnectPage() {
  const { navigateTo, setUserData } = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGeminiWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Connect with Gemini SDK - this will only return if successful
      const result = await connectGeminiWallet();
      
      // Only show success notification if we actually got a result (connection succeeded)
      if (result && result.address) {
        setUserData({ 
          walletAddress: result.address,
          walletType: 'Gemini Wallet',
          network: result.network
        });
        
        // Show success notification only when connection is actually successful
        toast.success('Gemini Wallet connected successfully!', {
          position: 'top-right',
        });
        
        // Navigate to profile setup after short delay
        setTimeout(() => {
          navigateTo('profile-setup');
        }, 1000);
      } else {
        // This shouldn't happen, but handle it just in case
        throw new Error('Connection failed: No address received');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Only show error notification - success notification is only shown above
      toast.error(error.message || 'Failed to connect Gemini Wallet. Please try again.', {
        position: 'top-right',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-10 rounded-3xl shadow-2xl shadow-teal-500/10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl text-slate-900 mb-3">Connect Your Wallet</h2>
            <p className="text-slate-600">Connect with Gemini Wallet to continue</p>
          </div>

          {/* Gemini Wallet Option */}
          <div className="space-y-4">
            <button
              onClick={handleConnectGeminiWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300/50 px-6 py-5 rounded-2xl hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Wallet className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-lg text-slate-900">
                    {isConnecting ? 'Connecting...' : 'Connect with Gemini Wallet'}
                  </span>
                </div>
                {!isConnecting && (
                  <ArrowRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Secure connection powered by blockchain technology</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigateTo('landing')}
            className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}