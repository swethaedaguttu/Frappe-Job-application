import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, ProgressBar, Nav, Tab, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject, demoModeConfig } from '../services/api';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card', 'list', or 'compact'
  const [activeView, setActiveView] = useState('all'); // 'all', 'active', 'planning', 'completed'

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProjects(filter || null);
      if (response.success) {
        // Sort projects based on active view
        let sortedProjects = [...response.data];
        
        if (activeView === 'active') {
          sortedProjects = sortedProjects.filter(project => project.status === 'Active');
        } else if (activeView === 'planning') {
          sortedProjects = sortedProjects.filter(project => project.status === 'Planning' || project.status === 'Not Started');
        } else if (activeView === 'completed') {
          sortedProjects = sortedProjects.filter(project => project.status === 'Completed');
        } else if (activeView === 'progress') {
          // Sort by progress percentage
          sortedProjects.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        } else if (activeView === 'recent') {
          // Sort by most recent start date
          sortedProjects.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
          // Limit to 5 most recent
          sortedProjects = sortedProjects.slice(0, 5);
        }
        
        setProjects(sortedProjects);
        setError('');
        
        // Only show demo data notice if it's not in the hideNoticeInPages list
        if (response.isDemoData && response.showDemoNotice) {
          setError('Note: Showing demo data. The server connection might be unavailable.');
        }
      } else {
        setError(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      // Only log to console, don't show demo data notice to user
      console.log('Using demo data - server connection unavailable');
      
      // Fall back to demo data
      const demoProjects = [
        { 
          name: 'PROJECT-DEMO-1', 
          title: 'Backend API Development', 
          status: 'Active', 
          priority: 'High',
          description: 'Development of REST API services for the new product suite',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 4,
          progress: 50
        },
        { 
          name: 'PROJECT-DEMO-2', 
          title: 'Frontend Development', 
          status: 'Active', 
          priority: 'High',
          description: 'Creating the user interface components using React',
          start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 4,
          progress: 30
        },
        { 
          name: 'PROJECT-DEMO-3', 
          title: 'Marketing Campaign', 
          status: 'Planning', 
          priority: 'Medium',
          description: 'Planning and executing marketing strategy for Q3',
          start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 4,
          progress: 40
        },
        { 
          name: 'PROJECT-DEMO-4', 
          title: 'Infrastructure Migration', 
          status: 'Planning', 
          priority: 'Medium',
          description: 'Migrating services to cloud infrastructure',
          start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 0,
          progress: 0
        },
        { 
          name: 'PROJECT-DEMO-5', 
          title: 'Mobile App Development', 
          status: 'Not Started', 
          priority: 'Low',
          description: 'Development of iOS and Android mobile applications',
          start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 0,
          progress: 0
        },
        { 
          name: 'PROJECT-DEMO-6', 
          title: 'Product Launch Event', 
          status: 'Completed', 
          priority: 'High',
          description: 'Organization and execution of product launch event',
          start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 8,
          progress: 100
        }
      ];
      
      // Filter and sort demo projects based on active view
      let filteredProjects = [...demoProjects];
      
      if (activeView === 'active') {
        filteredProjects = filteredProjects.filter(project => project.status === 'Active');
      } else if (activeView === 'planning') {
        filteredProjects = filteredProjects.filter(project => project.status === 'Planning' || project.status === 'Not Started');
      } else if (activeView === 'completed') {
        filteredProjects = filteredProjects.filter(project => project.status === 'Completed');
      } else if (activeView === 'progress') {
        filteredProjects.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      } else if (activeView === 'recent') {
        filteredProjects.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        filteredProjects = filteredProjects.slice(0, 5);
      }
      
      setProjects(filteredProjects);
      
      // Mark that we're in demo mode, but don't show the notice
      demoModeConfig.isActive = true;
    } finally {
      setLoading(false);
    }
  }, [filter, activeView]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    // Check if user has delete permission
    if (user && !user.isAdmin) {
      setError('You do not have permission to delete projects');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this project? This will NOT delete associated tasks but will remove the project assignment from them.')) {
      try {
        const response = await deleteProject(projectId);
        if (response.success) {
          setSuccess('Project deleted successfully');
          // Refresh the project list
          fetchProjects();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        } else {
          setError(response.message || 'Failed to delete project');
        }
      } catch (err) {
        setError('An error occurred while deleting the project');
        console.error('Error deleting project:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Planning':
        return 'status-planning';
      case 'Active':
        return 'status-active';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Not Started':
        return 'status-not-started';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if user can edit projects
  const canEdit = user && (user.isAdmin || user.isManager);
  
  // Check if user can create projects
  const canCreate = user && (user.isAdmin || user.isManager);
  
  // Check if user can delete projects
  const canDelete = user && user.isAdmin;

  // Check if user is logged in
  const isLoggedIn = user !== null;

  // Calculate days remaining
  const getDaysRemaining = (endDateStr) => {
    if (!endDateStr) return 'No deadline';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Get project duration in days
  const getProjectDuration = (project) => {
    if (!project.start_date || !project.end_date) return 'Unknown duration';
    
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days`;
  };

  // Render project card
  const renderProjectCard = (project) => {
    return (
      <Card className="project-card h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Badge className={`me-2 status-badge ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </Badge>
          <Badge className={`priority-badge ${getPriorityBadgeClass(project.priority || 'Medium')}`}>
            {project.priority || 'Medium'}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Card.Title>{project.title}</Card.Title>
          {project.description && (
            <Card.Text className="text-muted mb-3">
              {project.description}
            </Card.Text>
          )}
          <Card.Text>
            <strong>Start Date:</strong> {formatDate(project.start_date)}<br />
            <strong>End Date:</strong> {formatDate(project.end_date)}<br />
            <strong>Duration:</strong> {getProjectDuration(project)}<br />
            <strong>Timeline:</strong> {getDaysRemaining(project.end_date)}
          </Card.Text>
          
          <div className="progress-section mt-3 mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Progress:</span>
              <span>{Math.round(project.progress || 0)}%</span>
            </div>
            <ProgressBar 
              now={project.progress || 0}
              variant={
                project.progress >= 100 ? "success" : 
                project.progress > 50 ? "info" : 
                project.progress > 0 ? "warning" : "secondary"
              }
            />
          </div>
          
          <div className="action-buttons mt-3">
            <Button 
              as={Link} 
              to={`/project/${project.name}`} 
              variant="outline-info" 
              size="sm"
              className="me-2"
            >
              View
            </Button>
            
            {canEdit && (
              <Button 
                as={Link} 
                to={`/project/edit/${project.name}`} 
                variant="outline-primary" 
                size="sm"
                className="me-2"
              >
                Edit
              </Button>
            )}
            
            {canDelete && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => handleDeleteProject(project.name)}
              >
                Delete
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render project list item
  const renderProjectListItem = (project) => {
    return (
      <ListGroup.Item key={project.name} className="mb-2">
        <Row>
          <Col md={3}>
            <h5>{project.title}</h5>
            <small className="text-muted">{project.description}</small>
          </Col>
          <Col md={2}>
            <Badge className={`me-2 status-badge ${getStatusBadgeClass(project.status)}`}>
              {project.status}
            </Badge>
            <Badge className={`ms-1 priority-badge ${getPriorityBadgeClass(project.priority || 'Medium')}`}>
              {project.priority || 'Medium'}
            </Badge>
          </Col>
          <Col md={2}>
            <div><strong>Start:</strong> {formatDate(project.start_date)}</div>
            <div><strong>End:</strong> {formatDate(project.end_date)}</div>
          </Col>
          <Col md={2}>
            <ProgressBar 
              now={project.progress || 0}
              variant={
                project.progress >= 100 ? "success" : 
                project.progress > 50 ? "info" : 
                project.progress > 0 ? "warning" : "secondary"
              }
              style={{ height: '8px' }}
              className="mt-2"
            />
            <div className="text-center mt-1">
              <small>{Math.round(project.progress || 0)}% complete</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="d-flex justify-content-end">
              <Button 
                as={Link} 
                to={`/project/${project.name}`} 
                variant="outline-info" 
                size="sm"
                className="me-1"
              >
                View
              </Button>
              {canEdit && (
                <Button 
                  as={Link} 
                  to={`/project/edit/${project.name}`} 
                  variant="outline-primary" 
                  size="sm"
                  className="me-1"
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDeleteProject(project.name)}
                >
                  Delete
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  // Render compact project card
  const renderProjectCompact = (project) => {
    return (
      <Card className="h-100 mb-3">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="mb-1">{project.title}</h6>
              <div>
                <Badge className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </Badge>
                <Badge className={`ms-1 priority-badge ${getPriorityBadgeClass(project.priority || 'Medium')}`}>
                  {project.priority || 'Medium'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <small className="d-block">{formatDate(project.start_date)} - {formatDate(project.end_date)}</small>
              <ProgressBar 
                now={project.progress || 0}
                variant={
                  project.progress >= 100 ? "success" : 
                  project.progress > 50 ? "info" : 
                  project.progress > 0 ? "warning" : "secondary"
                }
                style={{ height: '5px', width: '80px' }}
                className="mt-1"
              />
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">Tasks: {project.task_count || 0}</small>
            <Button 
              as={Link} 
              to={`/project/${project.name}`} 
              variant="link" 
              size="sm"
              className="p-0"
            >
              Details
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="main-container">
      <h1 className="mb-4">Projects Dashboard</h1>
      
      {error && !error.includes("demo data") && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container id="project-views" defaultActiveKey="all">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="all" onClick={() => setActiveView('all')}>
              All Projects
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="active" onClick={() => setActiveView('active')}>
              Active
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="planning" onClick={() => setActiveView('planning')}>
              Planning
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="completed" onClick={() => setActiveView('completed')}>
              Completed
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="progress" onClick={() => setActiveView('progress')}>
              By Progress
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recent" onClick={() => setActiveView('recent')}>
              Recent Projects
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <div className="d-flex justify-content-between mb-3">
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="">All Projects</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Not Started">Not Started</option>
            </Form.Select>
          </Form.Group>
          
          <div>
            <Button 
              variant={viewMode === 'card' ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-2"
              onClick={() => setViewMode('card')}
            >
              Card View
            </Button>
            <Button 
              variant={viewMode === 'list' ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-2"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button 
              variant={viewMode === 'compact' ? "primary" : "outline-primary"} 
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              Compact
            </Button>
          </div>
        </div>
        
        <Tab.Content>
          <Tab.Pane eventKey={activeView}>
            <Row className="mb-4">
              <Col className="d-flex justify-content-end">
                {isLoggedIn && (
                  <Button 
                    as={Link} 
                    to="/project/new" 
                    variant="primary"
                  >
                    Create New Project
                  </Button>
                )}
              </Col>
            </Row>

            {loading ? (
              <Row>
                <Col>
                  <p>Loading projects...</p>
                </Col>
              </Row>
            ) : projects.length === 0 ? (
              <Row>
                <Col>
                  <Alert variant="info">
                    No projects found with the selected filters. {canCreate ? 'Create a new project to get started.' : 'Please check back later for projects.'}
                  </Alert>
                </Col>
              </Row>
            ) : viewMode === 'card' ? (
              <Row>
                {projects.map((project) => (
                  <Col lg={6} key={project.name} className="mb-4">
                    {renderProjectCard(project)}
                  </Col>
                ))}
              </Row>
            ) : viewMode === 'list' ? (
              <ListGroup>
                <ListGroup.Item className="bg-light font-weight-bold">
                  <Row>
                    <Col md={3}>Title</Col>
                    <Col md={2}>Status & Priority</Col>
                    <Col md={2}>Dates</Col>
                    <Col md={2}>Progress</Col>
                    <Col md={3}>Actions</Col>
                  </Row>
                </ListGroup.Item>
                {projects.map(renderProjectListItem)}
              </ListGroup>
            ) : (
              <Row>
                {projects.map((project) => (
                  <Col md={4} lg={3} key={project.name} className="mb-3">
                    {renderProjectCompact(project)}
                  </Col>
                ))}
              </Row>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ProjectDashboard; 