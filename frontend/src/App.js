import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import TaskForm from './components/TaskForm';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectForm from './components/ProjectForm';
import ProjectDetails from './components/ProjectDetails';
import JobApplicationDashboard from './components/JobApplicationDashboard';
import JobApplicationForm from './components/JobApplicationForm';
import JobApplicationDetails from './components/JobApplicationDetails';
import UserSettings from './components/UserSettings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('frappeToken');
    const userData = JSON.parse(localStorage.getItem('frappeUser'));
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setJustLoggedIn(true);
    localStorage.setItem('frappeUser', JSON.stringify(userData));
    
    // Reset justLoggedIn flag after some time to avoid showing welcome message on page refresh
    setTimeout(() => {
      setJustLoggedIn(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('frappeToken');
    localStorage.removeItem('frappeUser');
  };
  
  // Route protection based on user role
  const ProtectedRoute = ({ element, requiredRole }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    // If no specific role is required, just check authentication
    if (!requiredRole) {
      return element;
    }
    
    // Check if user has required role
    const hasPermission = 
      requiredRole === 'admin' ? (user?.isAdmin === true) :
      requiredRole === 'manager' ? (user?.isManager === true || user?.isAdmin === true) :
      true; // User role or no specific role required
      
    return hasPermission ? element : <Navigate to="/applications" />;
  };

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <NavBar user={user} onLogout={handleLogout} justLoggedIn={justLoggedIn} />}
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/applications" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={<ProtectedRoute element={<Dashboard />} />} 
          />
          <Route 
            path="/task/new" 
            element={<ProtectedRoute element={<TaskForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/task/edit/:id" 
            element={<ProtectedRoute element={<TaskForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/projects" 
            element={<ProtectedRoute element={<ProjectDashboard />} />} 
          />
          <Route 
            path="/project/new" 
            element={<ProtectedRoute element={<ProjectForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/project/edit/:id" 
            element={<ProtectedRoute element={<ProjectForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/project/:id" 
            element={<ProtectedRoute element={<ProjectDetails />} />} 
          />
          
          {/* Job Applications Routes */}
          <Route 
            path="/applications" 
            element={<ProtectedRoute element={<JobApplicationDashboard />} />} 
          />
          <Route 
            path="/application/new" 
            element={<ProtectedRoute element={<JobApplicationForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/application/edit/:id" 
            element={<ProtectedRoute element={<JobApplicationForm />} requiredRole="manager" />} 
          />
          <Route 
            path="/application/:id" 
            element={<ProtectedRoute element={<JobApplicationDetails />} />} 
          />
          
          {/* User Settings Route */}
          <Route 
            path="/settings" 
            element={<ProtectedRoute element={<UserSettings />} />} 
          />
          
          <Route path="*" element={<Navigate to="/applications" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 