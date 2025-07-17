import React from 'react';
import { RefreshCw, WifiOff, Database, Server } from 'lucide-react';

interface LoadingScreenProps {
  error: string | null;
  isOfflineMode: boolean;
  onRetry: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, isOfflineMode, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <Database className="w-12 h-12 text-blue-400 mr-4" />
            <h1 className="text-2xl font-bold text-white">AccounTech Pro</h1>
          </div>
        </div>
        
        <div className="p-6">
          {!error ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-lg font-medium">Loading application...</p>
              <p className="text-gray-400 text-sm mt-2">Connecting to database and initializing components</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-start">
                  <Server className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400 mb-2">Connection Error</p>
                    <p className="text-gray-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
              
              {isOfflineMode && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <WifiOff className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-400 mb-2">Offline Mode Active</p>
                      <p className="text-gray-300 text-sm">
                        The application is running in offline mode with sample data. 
                        Your changes will be saved locally but not synchronized with the database.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <button
                  onClick={onRetry}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  You can continue in offline mode. The application will function normally with sample data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;