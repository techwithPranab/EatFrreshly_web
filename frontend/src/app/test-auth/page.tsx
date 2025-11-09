'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

const TestAuthPage = () => {
  const { user, isAuthenticated, isLoading, token, login } = useAuth();

  const handleTestLogin = async () => {
    try {
      console.log('Testing login...');
      const result = await login({
        email: 'customer@example.com',
        password: 'customer123'
      });
      console.log('Login test result:', result);
    } catch (error) {
      console.error('Login test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
          </div>
          <div>
            <strong>Is Loading:</strong> {isLoading.toString()}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated.toString()}
          </div>
          <div>
            <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Token:</strong> {token ? token.substring(0, 50) + '...' : 'None'}
          </div>
          <div>
            <strong>User:</strong> 
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'None'}
            </pre>
          </div>
        </div>

        <div className="mt-8 space-x-4">
          <button
            onClick={handleTestLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Login
          </button>
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
          <a href="/profile" className="text-blue-600 hover:underline">
            Go to Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage;
