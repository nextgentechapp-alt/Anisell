import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AppRouter } from '@/routes';
import './App.css';

/**
 * Root Application Component.
 * Orchestrates global providers (Auth, Theme, Query) and initializes the routing engine.
 */
const App: React.FC = () => {
  console.log('App Rendering Start');
  return (
    <AuthProvider>
       <AppRouter />
    </AuthProvider>
  );
};

export default App;
