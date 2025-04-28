import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, ProgressBar, Table, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProjects, getTasks, addTaskToProject, removeTaskFromProject, demoModeConfig } from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      // Fetch project
      const projectResponse = await getProjects();
      if (projectResponse.success) {
        const projectData = projectResponse.data.find(p => p.name === id);
        
        if (projectData) {
          // Ensure all required fields have values
          const processedProject = {
            ...projectData,
            title: projectData.title || 'Untitled Project',
            description: projectData.description || '',
            status: projectData.status || 'Planning',
            priority: projectData.priority || 'Medium',
            start_date: projectData.start_date || '',
            end_date: projectData.end_date || '',
            task_count: projectData.task_count || 0,
            progress: projectData.progress || 0
          };
          
          setProject(processedProject);
          
          // Fetch project tasks
          const tasksResponse = await getTasks(null, id);
          if (tasksResponse.success) {
            setTasks(tasksResponse.data);
            
            // Fetch available tasks (not assigned to this project)
            const allTasksResponse = await getTasks();
            if (allTasksResponse.success) {
              // Filter out tasks already in this project
              const projectTaskIds = tasksResponse.data.map(task => task.name);
              const availableTasks = allTasksResponse.data.filter(
                task => !projectTaskIds.includes(task.name) && !task.project
              );
              setAvailableTasks(availableTasks);
            }
          }
        } else {
          setError('Project not found');
          setTimeout(() => navigate('/projects'), 2000);
        }
      } else {
        setError(projectResponse.message || 'Failed to fetch project details');
      }
    } catch (err) {
      setError('An error occurred while fetching project details');
      console.error('Error fetching project details:', err);
      
      // If project details fetch fails (possible on demo id), create dummy project
      if (id.includes('DEMO')) {
        // Use demo data for this project
        const demoProject = {
          name: id,
          title: 'Demo Project',
          description: 'This is a demo project with sample data.',
          status: 'Active',
          priority: 'High',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          task_count: 5,
          progress: 40
        };
        setProject(demoProject);
        
        // Create demo tasks
        const demoTasks = [
          {
            name: 'TASK-DEMO-1',
            title: 'Research Requirements',
            description: 'Gather and analyze project requirements',
            status: 'Completed',
            priority: 'High',
            start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            project: id
          },
          {
            name: 'TASK-DEMO-2',
            title: 'Design System Architecture',
            description: 'Create system architecture and component diagram',
            status: 'In Progress',
            priority: 'High',
            start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            project: id
          },
          {
            name: 'TASK-DEMO-3',
            title: 'Develop Core Components',
            description: 'Implement core system components',
            status: 'Open',
            priority: 'Medium',
            start_date: new Date(Date.now()).toISOString().slice(0, 10),
            end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            project: id
          }
        ];
        setTasks(demoTasks);
        
        // Set available tasks
        const demoAvailableTasks = [
          {
            name: 'TASK-DEMO-4',
            title: 'User Testing',
            status: 'Open',
            priority: 'Medium'
          },
          {
            name: 'TASK-DEMO-5',
            title: 'Documentation',
            status: 'Open',
            priority: 'Low'
          }
        ];
        setAvailableTasks(demoAvailableTasks);
        
        demoModeConfig.isActive = true;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!selectedTask) {
      setError('Please select a task to add');
      return;
    }
    
    try {
      // Make sure we're passing IDs, not objects
      const projectId = typeof id === 'object' ? id.name : id;
      const taskId = typeof selectedTask === 'object' ? selectedTask.name : selectedTask;
      
      const response = await addTaskToProject(projectId, taskId);
      if (response.success) {
        setSuccess('Task added to project successfully');
        setSelectedTask('');
        fetchProjectDetails(); // Refresh data
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to add task to project');
      }
    } catch (err) {
      setError('An error occurred while adding task to project');
      console.error('Error adding task:', err);
    }
  };

  const handleRemoveTask = async (taskId) => {
    if (window.confirm('Are you sure you want to remove this task from the project?')) {
      try {
        // Make sure we're passing IDs, not objects
        const projectId = typeof id === 'object' ? id.name : id;
        const taskIdStr = typeof taskId === 'object' ? taskId.name : taskId;
        
        const response = await removeTaskFromProject(projectId, taskIdStr);
        if (response.success) {
          setSuccess('Task removed from project successfully');
          fetchProjectDetails(); // Refresh data
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        } else {
          setError(response.message || 'Failed to remove task from project');
        }
      } catch (err) {
        setError('An error occurred while removing task from project');
        console.error('Error removing task:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Planning':
      case 'Open':
        return 'status-planning';
      case 'Active':
      case 'In Progress':
        return 'status-active';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate project progress
  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    return (completedTasks / tasks.length) * 100;
  };

  // Check if user can edit tasks
  const canEditTasks = user && (user.isAdmin || user.isManager);
  
  // Check if user can edit projects
  const canEditProject = user && (user.isAdmin || user.isManager);

  if (loading) {
    return (
      <Container className="main-container">
        <p>Loading project details...</p>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="main-container">
        <Alert variant="danger">Project not found. Redirecting to Projects Dashboard...</Alert>
      </Container>
    );
  }

  return (
    <Container className="main-container">
      <Row className="mb-4">
        <Col>
          <Button as={Link} to="/projects" variant="outline-secondary" className="mb-3">
            ← Back to Projects
          </Button>
          <h1>{project.title}</h1>
          <div className="mb-3 d-flex align-items-center">
            <Badge className={`me-2 status-badge ${getStatusBadgeClass(project.status)}`}>
              {project.status}
            </Badge>
            <Badge className={`me-3 priority-badge ${getPriorityBadgeClass(project.priority)}`}>
              {project.priority}
            </Badge>
            
            {canEditProject && (
              <Button 
                as={Link} 
                to={`/project/edit/${project.name}`} 
                variant="outline-primary" 
                size="sm"
                className="ms-3"
              >
                Edit Project
              </Button>
            )}
          </div>
          
          {error && !error.includes("demo data") && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Project Details</Card.Title>
              
              <Table className="mt-3" bordered>
                <tbody>
                  <tr>
                    <th width="30%">Title</th>
                    <td>{project.title}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <Badge className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>Priority</th>
                    <td>
                      <Badge className={`priority-badge ${getPriorityBadgeClass(project.priority)}`}>
                        {project.priority}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>Start Date</th>
                    <td>{formatDate(project.start_date)}</td>
                  </tr>
                  <tr>
                    <th>End Date</th>
                    <td>{formatDate(project.end_date)}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{project.description || 'No description provided.'}</td>
                  </tr>
                </tbody>
              </Table>
              
              <div className="mt-4">
                <h5>Actions</h5>
                <div className="d-flex">
                  <Button 
                    as={Link} 
                    to="/projects" 
                    variant="outline-secondary" 
                    size="sm"
                    className="me-2"
                  >
                    Back to Projects
                  </Button>
                  
                  {canEditProject && (
                    <Button 
                      as={Link} 
                      to={`/project/edit/${project.name}`} 
                      variant="outline-primary" 
                      size="sm"
                      className="me-2"
                    >
                      Edit Project
                    </Button>
                  )}
                  
                  {user && user.isAdmin && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          navigate('/projects');
                        }
                      }}
                    >
                      Delete Project
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Project Progress</Card.Title>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Completion:</span>
                  <span>{Math.round(calculateProgress())}%</span>
                </div>
                <ProgressBar 
                  now={calculateProgress()} 
                  variant={calculateProgress() >= 100 ? "success" : "primary"} 
                />
              </div>
              <div className="mt-3">
                <p><strong>Tasks:</strong> {tasks.length}</p>
                <p><strong>Completed:</strong> {tasks.filter(task => task.status === 'Completed').length}</p>
                <p><strong>In Progress:</strong> {tasks.filter(task => task.status === 'In Progress').length}</p>
                <p><strong>Open:</strong> {tasks.filter(task => task.status === 'Open').length}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Project Tasks</Card.Title>
              
              {canEditTasks && (
                <Row className="mb-3 mt-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Add Task to Project</Form.Label>
                      <Form.Select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                      >
                        <option value="">Select a task to add</option>
                        {availableTasks.map(task => (
                          <option key={task.name} value={task.name}>{task.title}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button
                      variant="primary"
                      onClick={handleAddTask}
                      className="mt-4"
                    >
                      Add Task
                    </Button>
                  </Col>
                </Row>
              )}
              
              {tasks.length === 0 ? (
                <Alert variant="info">No tasks assigned to this project yet.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.name}>
                        <td>{task.title}</td>
                        <td>
                          <Badge className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge className={`priority-badge ${getPriorityBadgeClass(task.priority || 'Medium')}`}>
                            {task.priority || 'Medium'}
                          </Badge>
                        </td>
                        <td>{formatDate(task.start_date)}</td>
                        <td>{formatDate(task.end_date)}</td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/task/${task.name}`} 
                            variant="outline-info" 
                            size="sm"
                            className="me-2"
                          >
                            View
                          </Button>
                          {canEditTasks && (
                            <>
                              <Button 
                                as={Link} 
                                to={`/task/edit/${task.name}`} 
                                variant="outline-primary" 
                                size="sm"
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveTask(task.name)}
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetails; 