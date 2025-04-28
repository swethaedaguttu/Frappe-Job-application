import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Nav, Tab, ListGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask, getProjects } from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card', 'list', or 'kanban'
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTasks(filter || null, projectFilter || null);
      if (response.success) {
        let filteredTasks = [...response.data];
        
        // Apply priority filter if set
        if (priorityFilter) {
          filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        // Apply date filters
        if (dateFilter === 'custom' && startDate && endDate) {
          filteredTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.start_date);
            const taskEnd = new Date(task.end_date);
            const filterStart = new Date(startDate);
            const filterEnd = new Date(endDate);
            
            // Tasks that overlap with the selected date range
            return (taskStart <= filterEnd && taskEnd >= filterStart);
          });
        } else if (dateFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          filteredTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.start_date);
            const taskEnd = new Date(task.end_date);
            return (taskStart <= tomorrow && taskEnd >= today);
          });
        } else if (dateFilter === 'week') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekLater = new Date(today);
          weekLater.setDate(weekLater.getDate() + 7);
          
          filteredTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.start_date);
            const taskEnd = new Date(task.end_date);
            return (taskStart <= weekLater && taskEnd >= today);
          });
        } else if (dateFilter === 'overdue') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          filteredTasks = filteredTasks.filter(task => {
            const taskEnd = new Date(task.end_date);
            return (taskEnd < today && task.status !== 'Completed' && task.status !== 'Cancelled');
          });
        }
        
        // Apply active view filter
        if (activeView === 'recent') {
          // Sort by most recently updated
          filteredTasks.sort((a, b) => new Date(b.modified || b.end_date) - new Date(a.modified || a.end_date));
          filteredTasks = filteredTasks.slice(0, 5); // Only show top 5
        } else if (activeView === 'priority') {
          // Sort by priority (High, Medium, Low)
          const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
          filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (activeView === 'upcoming') {
          // Sort by upcoming start dates that haven't started yet
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          filteredTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.start_date);
            return taskStart >= today && task.status !== 'Completed' && task.status !== 'Cancelled';
          });
          
          filteredTasks.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        } else if (activeView === 'category') {
          // Sort by project name
          filteredTasks.sort((a, b) => {
            if (!a.project && !b.project) return 0;
            if (!a.project) return 1;
            if (!b.project) return -1;
            return a.project.localeCompare(b.project);
          });
        }
        
        setTasks(filteredTasks);
        setError('');
      } else {
        setError(response.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('An error occurred while fetching tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, projectFilter, priorityFilter, dateFilter, startDate, endDate, activeView]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchProjects();
    fetchTasks();
  }, [fetchTasks]);

  const handleDeleteTask = async (taskId) => {
    // Check if user has delete permission
    if (user && !user.isAdmin && !user.isManager) {
      setError('You do not have permission to delete tasks');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await deleteTask(taskId);
        if (response.success) {
          setSuccess('Task deleted successfully');
          // Refresh the task list
          fetchTasks();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        } else {
          setError(response.message || 'Failed to delete task');
        }
      } catch (err) {
        setError('An error occurred while deleting the task');
        console.error('Error deleting task:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
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

  const getProjectLink = (projectId) => {
    if (!projectId) return null;
    
    const project = projects.find(p => p.name === projectId);
    return project ? (
      <Link to={`/project/${projectId}`} className="project-link">
        {project.title}
      </Link>
    ) : projectId;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const resetFilters = () => {
    setFilter('');
    setProjectFilter('');
    setPriorityFilter('');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Check if user can edit tasks
  const canEdit = user && (user.isAdmin || user.isManager);
  
  // Check if user can create tasks
  const canCreate = user && (user.isAdmin || user.isManager);
  
  // Check if user can delete tasks
  const canDelete = user && (user.isAdmin || user.isManager);

  // Calculate task completion percentage
  const calculateProgress = (task) => {
    switch (task.status) {
      case 'Completed':
        return 100;
      case 'In Progress':
        return 50;
      case 'Open':
        return 10;
      case 'Cancelled':
        return 0;
      default:
        return 0;
    }
  };

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

  // Estimate task complexity
  const getTaskComplexity = (task) => {
    // Enhanced complexity estimation
    const priority = task.priority || 'Medium';
    const startDate = task.start_date ? new Date(task.start_date) : null;
    const endDate = task.end_date ? new Date(task.end_date) : null;
    
    if (!startDate || !endDate) return 'Unknown';
    
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (priority === 'High' && durationDays > 7) {
      return 'Complex';
    } else if ((priority === 'High' && durationDays <= 7) || 
               (priority === 'Medium' && durationDays > 10)) {
      return 'Moderate';
    } else if (priority === 'Medium' && durationDays <= 10) {
      return 'Standard';
    } else if (priority === 'Low' && durationDays > 14) {
      return 'Standard';
    } else {
      return 'Simple';
    }
  };

  // Calculate task duration in days
  const getTaskDuration = (task) => {
    if (!task || !task.start_date || !task.end_date) return 'Unknown duration';
    
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Unknown duration';
    }
    
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days`;
  };

  // Get estimated hours based on complexity and duration
  const getEstimatedHours = (task) => {
    if (!task || !task.start_date || !task.end_date) return 'Unknown';
    
    const complexity = getTaskComplexity(task);
    const startDate = task.start_date ? new Date(task.start_date) : null;
    const endDate = task.end_date ? new Date(task.end_date) : null;
    
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Unknown';
    }
    
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (durationDays <= 0) return 'Unknown';
    
    let hoursPerDay;
    switch (complexity) {
      case 'Complex':
        hoursPerDay = 6;
        break;
      case 'Moderate':
        hoursPerDay = 4;
        break;
      case 'Standard':
        hoursPerDay = 3;
        break;
      case 'Simple':
        hoursPerDay = 2;
        break;
      default:
        hoursPerDay = 2;
    }
    
    return `~${durationDays * hoursPerDay} hours`;
  };

  // Group tasks by project
  const getTasksByProject = () => {
    const taskGroups = {};
    
    // Group by project
    tasks.forEach(task => {
      const projectId = task.project || 'No Project';
      if (!taskGroups[projectId]) {
        taskGroups[projectId] = [];
      }
      taskGroups[projectId].push(task);
    });
    
    return taskGroups;
  };

  // Group tasks by status for Kanban view
  const getTasksByStatus = () => {
    const statusGroups = {
      'Open': [],
      'In Progress': [],
      'Completed': [],
      'Cancelled': []
    };
    
    tasks.forEach(task => {
      if (statusGroups[task.status]) {
        statusGroups[task.status].push(task);
      } else {
        statusGroups['Open'].push(task);
      }
    });
    
    return statusGroups;
  };

  // Group tasks by priority
  const getTasksByPriority = () => {
    const priorityGroups = {
      'High': [],
      'Medium': [],
      'Low': []
    };
    
    tasks.forEach(task => {
      if (priorityGroups[task.priority]) {
        priorityGroups[task.priority].push(task);
      } else {
        priorityGroups['Medium'].push(task);
      }
    });
    
    return priorityGroups;
  };

  // Filter tasks by upcoming deadlines (next 7 days)
  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.end_date) return false;
      const taskEnd = new Date(task.end_date);
      return taskEnd >= today && taskEnd <= nextWeek && task.status !== 'Completed' && task.status !== 'Cancelled';
    }).sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
  };

  // Get recently updated tasks
  const getRecentlyUpdatedTasks = () => {
    // In a real app, we would sort by a 'modified' timestamp
    // Here we'll simulate by sorting by end_date as a proxy
    return [...tasks]
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
      .slice(0, 10);
  };

  // Get tasks with detailed status information
  const getDetailedStatusTasks = () => {
    return tasks.map(task => {
      const progress = calculateProgress(task);
      const daysRemaining = getDaysRemaining(task.end_date);
      const isOverdue = daysRemaining.includes('overdue');
      
      let statusDetail;
      if (task.status === 'Completed') {
        statusDetail = 'Completed';
      } else if (isOverdue) {
        statusDetail = `Overdue (${daysRemaining})`;
      } else if (task.status === 'In Progress') {
        statusDetail = `In Progress (${progress}%)`;
      } else if (task.status === 'Open') {
        const startDate = task.start_date ? new Date(task.start_date) : null;
        const today = new Date();
        if (startDate && startDate > today) {
          statusDetail = `Not Started (Starts in ${Math.ceil((startDate - today) / (1000 * 60 * 60 * 24))} days)`;
        } else {
          statusDetail = 'Ready to Start';
        }
      } else {
        statusDetail = task.status;
      }
      
      return {
        ...task,
        statusDetail,
        progress,
        daysRemaining
      };
    });
  };

  const renderEnhancedTaskCard = (task) => {
    if (!task) return null;
    
    const detailedTask = {
      ...task,
      progress: calculateProgress(task),
      daysRemaining: getDaysRemaining(task.end_date),
      complexity: getTaskComplexity(task),
      duration: getTaskDuration(task),
      estimatedHours: getEstimatedHours(task)
    };
    
    const isOverdue = detailedTask.daysRemaining && detailedTask.daysRemaining.includes('overdue');
    
    return (
      <Card className={`task-card h-100 mb-3 ${isOverdue ? 'border-danger' : ''}`}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Badge className={`status-badge ${getStatusBadgeClass(task.status || 'Open')}`}>
            {task.status || 'Open'}
          </Badge>
          <Badge className={`status-badge ${getPriorityBadgeClass(task.priority || 'Medium')}`}>
            {task.priority || 'Medium'} Priority
          </Badge>
        </Card.Header>
        <Card.Body>
          <Card.Title>{task.title || 'Untitled Task'}</Card.Title>
          {task.description && (
            <Card.Text className="text-muted description-preview mb-3">
              {task.description.replace(/<[^>]*>/g, '').substring(0, 100)}
              {task.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
            </Card.Text>
          )}
          
          <div className="task-details mb-3">
            <Row>
              <Col md={6}>
                <strong>Start Date:</strong> {formatDate(task.start_date)}
              </Col>
              <Col md={6}>
                <strong>End Date:</strong> {formatDate(task.end_date)}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={6}>
                <strong>Duration:</strong> {detailedTask.duration}
              </Col>
              <Col md={6}>
                <strong>Est. Effort:</strong> {detailedTask.estimatedHours}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={6}>
                <strong>Timeline:</strong> <span className={isOverdue ? 'text-danger' : ''}>{detailedTask.daysRemaining}</span>
              </Col>
              <Col md={6}>
                <strong>Complexity:</strong> {detailedTask.complexity}
              </Col>
            </Row>
            {task.project && (
              <Row className="mt-2">
                <Col md={12}>
                  <strong>Project:</strong> {getProjectLink(task.project)}
                </Col>
              </Row>
            )}
          </div>
          
          <div className="progress-section mt-3 mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Progress:</span>
              <span>{detailedTask.progress}%</span>
            </div>
            <ProgressBar 
              now={detailedTask.progress} 
              variant={
                detailedTask.progress === 100 ? "success" : 
                detailedTask.progress > 50 ? "info" : 
                detailedTask.progress > 0 ? "warning" : 
                isOverdue ? "danger" : "secondary"
              }
            />
          </div>
          
          <div className="action-buttons mt-3">
            {canEdit && (
              <Button 
                as={Link} 
                to={`/task/edit/${task.name}`} 
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
                onClick={() => handleDeleteTask(task.name)}
              >
                Delete
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render a compact task card for the "By Priority" view
  const renderCompactTaskCard = (task) => {
    if (!task) return null;
    
    const daysRemaining = getDaysRemaining(task.end_date);
    const isOverdue = daysRemaining && daysRemaining.includes('overdue');
    
    return (
      <Card className="compact-task-card mb-2">
        <Card.Body className="p-2">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="mb-1">{task.title || 'Untitled Task'}</h6>
              <Badge className={`me-2 status-badge ${getStatusBadgeClass(task.status || 'Open')}`}>
                {task.status || 'Open'}
              </Badge>
              {task.project && (
                <small className="text-muted">{getProjectLink(task.project)}</small>
              )}
            </div>
            <div className="text-end">
              <small className={isOverdue ? 'text-danger' : ''}>{daysRemaining}</small>
              <ProgressBar 
                now={calculateProgress(task)} 
                variant={
                  calculateProgress(task) === 100 ? "success" : 
                  calculateProgress(task) > 50 ? "info" : 
                  calculateProgress(task) > 0 ? "warning" : 
                  "secondary"
                }
                style={{ height: '5px', width: '60px' }}
                className="mt-1"
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="main-container">
      <h1 className="mb-4">Tasks Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container id="task-views" defaultActiveKey="all">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="all" onClick={() => setActiveView('all')}>
              All Tasks
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="priority" onClick={() => setActiveView('priority')}>
              By Priority
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="upcoming" onClick={() => setActiveView('upcoming')}>
              Upcoming
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recent" onClick={() => setActiveView('recent')}>
              Recently Updated
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="by-project" onClick={() => setActiveView('by-project')}>
              By Project
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Row className="mb-3">
          <Col md={9}>
            <div className="d-flex flex-wrap">
              <Form.Group className="me-3 mb-2">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="me-3 mb-2">
                <Form.Label>Project</Form.Label>
                <Form.Select 
                  value={projectFilter} 
                  onChange={(e) => setProjectFilter(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.name} value={project.name}>{project.title}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="me-3 mb-2">
                <Form.Label>Priority</Form.Label>
                <Form.Select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="me-3 mb-2">
                <Form.Label>Date Range</Form.Label>
                <Form.Select 
                  value={dateFilter} 
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="overdue">Overdue</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
              </Form.Group>
              
              {dateFilter === 'custom' && (
                <>
                  <Form.Group className="me-3 mb-2">
                    <Form.Label>From</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>To</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </Form.Group>
                </>
              )}
            </div>
            
            {(filter || projectFilter || priorityFilter || dateFilter) && (
              <Button 
                variant="link" 
                onClick={resetFilters} 
                className="mt-1 p-0"
              >
                Clear Filters
              </Button>
            )}
          </Col>
          
          <Col md={3} className="d-flex justify-content-end align-items-end">
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
                variant={viewMode === 'kanban' ? "primary" : "outline-primary"} 
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
            </div>
          </Col>
        </Row>
        
        <Tab.Content>
          <Tab.Pane eventKey={activeView}>
            <Row className="mb-4">
              <Col className="d-flex justify-content-end">
                {canCreate && (
                  <Button 
                    as={Link} 
                    to="/task/new" 
                    variant="primary"
                  >
                    Create New Task
                  </Button>
                )}
              </Col>
            </Row>

            <Row>
              {loading ? (
                <Col>
                  <p>Loading tasks...</p>
                </Col>
              ) : tasks.length === 0 ? (
                <Col>
                  <Alert variant="info">
                    No tasks found with the selected filters. {canCreate ? 'Create a new task to get started.' : 'Please check back later for tasks.'}
                  </Alert>
                </Col>
              ) : activeView === 'all' && viewMode === 'card' ? (
                <Row>
                  {tasks.map((task) => (
                    <Col md={6} lg={4} key={task.name} className="mb-4">
                      {renderEnhancedTaskCard(task)}
                    </Col>
                  ))}
                </Row>
              ) : activeView === 'all' && viewMode === 'list' ? (
                <ListGroup>
                  <ListGroup.Item className="bg-light font-weight-bold">
                    <Row>
                      <Col md={5}>Task</Col>
                      <Col md={3}>Status & Priority</Col>
                      <Col md={2}>Due Date</Col>
                      <Col md={2}></Col>
                    </Row>
                  </ListGroup.Item>
                  {tasks.map(renderEnhancedTaskCard)}
                </ListGroup>
              ) : activeView === 'all' && viewMode === 'kanban' ? (
                <Row>
                  {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                    <Col md={3} key={status}>
                      <Card className="mb-4 kanban-column">
                        <Card.Header className={`text-center bg-${getStatusBadgeClass(status)}`}>
                          {status} ({statusTasks.length})
                        </Card.Header>
                        <Card.Body className="p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                          {statusTasks.length === 0 ? (
                            <p className="text-center text-muted small">No tasks</p>
                          ) : (
                            statusTasks.map(task => (
                              <Card key={task.name} className="mb-2">
                                <Card.Body className="p-2">
                                  <div className="d-flex justify-content-between">
                                    <Badge className={`status-badge ${getPriorityBadgeClass(task.priority)}`}>
                                      {task.priority}
                                    </Badge>
                                    <small>{formatDate(task.end_date)}</small>
                                  </div>
                                  <Card.Title className="fs-6 mt-1">{task.title}</Card.Title>
                                  {task.project && (
                                    <small className="d-block text-muted">
                                      {getProjectLink(task.project)}
                                    </small>
                                  )}
                                  <div className="d-flex justify-content-end mt-2">
                                    <Button 
                                      as={Link} 
                                      to={`/task/edit/${task.name}`} 
                                      variant="link" 
                                      size="sm"
                                      className="p-0 me-2"
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : activeView === 'priority' ? (
                <div>
                  {Object.entries(getTasksByPriority()).map(([priority, priorityTasks]) => (
                    <Card key={priority} className="mb-4">
                      <Card.Header className={`bg-${getPriorityBadgeClass(priority)}`}>
                        <h5 className="mb-0">{priority} Priority Tasks ({priorityTasks.length})</h5>
                      </Card.Header>
                      <Card.Body>
                        {priorityTasks.length === 0 ? (
                          <p className="text-center text-muted">No tasks with this priority</p>
                        ) : viewMode === 'card' ? (
                          <Row>
                            {priorityTasks.map(task => (
                              <Col md={6} lg={4} key={task.name} className="mb-3">
                                {renderEnhancedTaskCard(task)}
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <ListGroup>
                            {priorityTasks.map(task => renderCompactTaskCard(task))}
                          </ListGroup>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : activeView === 'upcoming' ? (
                <div>
                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Upcoming Tasks (Next 7 Days)</h5>
                    </Card.Header>
                    <Card.Body>
                      {getUpcomingTasks().length === 0 ? (
                        <p className="text-center text-muted">No upcoming tasks in the next 7 days</p>
                      ) : viewMode === 'card' ? (
                        <Row>
                          {getUpcomingTasks().map(task => (
                            <Col md={6} lg={4} key={task.name} className="mb-3">
                              {renderEnhancedTaskCard(task)}
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <ListGroup>
                          {getUpcomingTasks().map(task => (
                            <ListGroup.Item key={task.name} className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">{task.title}</h6>
                                <small>
                                  <Badge className={`me-2 status-badge ${getStatusBadgeClass(task.status)}`}>
                                    {task.status}
                                  </Badge>
                                  <Badge className={`status-badge ${getPriorityBadgeClass(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                  {task.project && (
                                    <span className="ms-2">
                                      Project: {getProjectLink(task.project)}
                                    </span>
                                  )}
                                </small>
                              </div>
                              <div className="text-end">
                                <div>Due: {formatDate(task.end_date)}</div>
                                <small>{getDaysRemaining(task.end_date)}</small>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ) : activeView === 'recent' ? (
                <div>
                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Recently Updated Tasks</h5>
                    </Card.Header>
                    <Card.Body>
                      {getRecentlyUpdatedTasks().length === 0 ? (
                        <p className="text-center text-muted">No recently updated tasks</p>
                      ) : viewMode === 'card' ? (
                        <Row>
                          {getRecentlyUpdatedTasks().map(task => (
                            <Col md={6} lg={4} key={task.name} className="mb-3">
                              {renderEnhancedTaskCard(task)}
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <ListGroup>
                          {getRecentlyUpdatedTasks().map(task => (
                            <ListGroup.Item key={task.name} className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">{task.title}</h6>
                                <small>
                                  <Badge className={`me-2 status-badge ${getStatusBadgeClass(task.status)}`}>
                                    {task.status}
                                  </Badge>
                                  <Badge className={`status-badge ${getPriorityBadgeClass(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                </small>
                              </div>
                              <div className="text-end">
                                <div>{formatDate(task.end_date)}</div>
                                <small>{getDaysRemaining(task.end_date)}</small>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ) : activeView === 'by-project' ? (
                <div>
                  {Object.entries(getTasksByProject()).map(([projectId, projectTasks]) => (
                    <Card key={projectId} className="mb-4">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0">
                          {projectId === 'No Project' ? 'Unassigned Tasks' : (
                            projects.find(p => p.name === projectId)?.title || projectId
                          )} ({projectTasks.length})
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          {viewMode === 'card' ? (
                            projectTasks.map(task => (
                              <Col md={6} lg={4} key={task.name} className="mb-3">
                                {renderEnhancedTaskCard(task)}
                              </Col>
                            ))
                          ) : (
                            <Col md={12}>
                              <ListGroup>
                                {projectTasks.map(renderEnhancedTaskCard)}
                              </ListGroup>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : null}
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default Dashboard; 