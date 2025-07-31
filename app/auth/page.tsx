'use client';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoginWithKC = () => {
    setIsLoading(true);
    
    const kcLoginUrl = 'https://accounts.kingsch.at';
    const authClientId = '5f674d64-2b7e-4d20-96a2-1608e8613e75';
    const appUrl = 'http://localhost:3000';
    
    const loginUrl = `${kcLoginUrl}/?client_id=${authClientId}&post_redirect=true&scopes=["profile"]&redirect_uri=${appUrl}/api/auth/callback?next=/`;
    
    console.log('Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to EdenHub AI</h1>
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleLoginWithKC}
          disabled={isLoading}
        >
          {isLoading ? 'Redirecting...' : 'Continue with KingsChat'}
        </button>
      </div>
    </div>
  );
}