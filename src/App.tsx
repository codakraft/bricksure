import React from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/UI/Toast';
import { Router } from './components/Router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;