import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Toast, CloseButton } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const NavBar = ({ user, onLogout, justLoggedIn }) => {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(justLoggedIn !== false);
  
  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show welcome message when user logs in
  useEffect(() => {
    if (justLoggedIn) {
      setShowWelcome(true);
    }
  }, [justLoggedIn]);

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  // Check if the current route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <Navbar bg="black" variant="dark" expand="lg" className="mb-4 navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/applications" className="fw-bold">
          <i className="bi bi-briefcase-fill me-2 text-success"></i>
          Job Applications
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/applications"
              className={`nav-link-custom ${isActive('/applications') ? 'active' : ''}`}
            >
              <i className="bi bi-file-earmark-text me-1"></i> Applications
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/projects"
              className={`nav-link-custom ${isActive('/projects') ? 'active' : ''}`}
            >
              <i className="bi bi-kanban me-1"></i> Projects
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/"
              className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-check2-square me-1"></i> Tasks
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link 
              as={Link} 
              to="/settings"
              className={`nav-link-custom me-3 ${isActive('/settings') ? 'active' : ''}`}
              title="Settings"
            >
              <i className="bi bi-gear"></i>
              <span className="d-none d-lg-inline ms-2">Settings</span>
            </Nav.Link>
            <Navbar.Text className="me-3 user-info">
              <i className="bi bi-person-circle me-2 text-success"></i>
              <span className="text-light">{user?.email}</span>
              {user?.isAdmin && <span className="ms-2 badge bg-danger">Admin</span>}
              {user?.isManager && !user?.isAdmin && <span className="ms-2 badge bg-success">Manager</span>}
              {!user?.isAdmin && !user?.isManager && <span className="ms-2 badge bg-secondary">User</span>}
            </Navbar.Text>
            <Button variant="success" size="sm" onClick={handleLogout} className="logout-btn">
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
      {showWelcome && (
        <div className="welcome-message-container">
          <Toast show={showWelcome} onClose={() => setShowWelcome(false)} className="bg-success">
            <Toast.Body className="text-white">
              Welcome back, {user?.email?.split('@')[0] || 'User'}!
              <CloseButton variant="white" onClick={() => setShowWelcome(false)} />
            </Toast.Body>
          </Toast>
        </div>
      )}
    </Navbar>
  );
};

export default NavBar; 