
import Navbar from './components/Navbar';
import { Routes, Route, Navigate} from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  // Check authentication status on mount and periodically
  useEffect(() => {
    console.log("App: Initial auth check");
    checkAuth();
    
    // Set up periodic auth check (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log("App: Periodic auth check");
      checkAuth();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [checkAuth]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;