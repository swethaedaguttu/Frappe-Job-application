import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, getProjects } from '../services/api';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    start_date: '',
    end_date: '',
    details: '',
    project: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has permission to edit/create
      if (!parsedUser.isAdmin && !parsedUser.isManager) {
        setError('You do not have permission to create or edit tasks');
        setTimeout(() => {
          navigate('/');
        }, 2000);
        return;
      }
    }
    
    // Load projects
    fetchProjects();
    
    if (isEditMode) {
      fetchTaskDetails();
    }
  }, [id, navigate]);

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

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      if (response.success) {
        const taskData = response.data.find(task => task.name === id);
        
        if (taskData) {
          setFormData({
            name: taskData.name,
            title: taskData.title || '',
            description: taskData.description || '',
            status: taskData.status || 'Open',
            priority: taskData.priority || 'Medium',
            start_date: taskData.start_date || '',
            end_date: taskData.end_date || '',
            details: taskData.details || '',
            project: taskData.project || ''
          });
        } else {
          setError('Task not found');
        }
      } else {
        setError(response.message || 'Failed to fetch task details');
      }
    } catch (err) {
      setError('An error occurred while fetching task details');
      console.error('Error fetching task details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission
    if (user && !user.isAdmin && !user.isManager) {
      setError('You do not have permission to create or edit tasks');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = isEditMode
        ? await updateTask({ ...formData, name: id })
        : await createTask(formData);

      if (response.success) {
        setSuccess(isEditMode ? 'Task updated successfully' : 'Task created successfully');
        
        // Redirect to dashboard after successful operation with a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} task`);
      }
    } catch (err) {
      setError(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the task`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, err);
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have permission, don't render the form
  if (user && !user.isAdmin && !user.isManager) {
    return (
      <Container className="form-container">
        <Alert variant="danger">
          You do not have permission to {isEditMode ? 'edit' : 'create'} tasks.
          Redirecting to dashboard...
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="form-container">
      <h2 className="mb-4">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="taskTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="taskDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="taskStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="taskPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="taskStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="taskEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="taskProject">
          <Form.Label>Project</Form.Label>
          <Form.Select
            name="project"
            value={formData.project || ''}
            onChange={handleChange}
          >
            <option value="">None (No Project)</option>
            {projects.map(project => (
              <option key={project.name} value={project.name}>
                {project.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="taskDetails">
          <Form.Label>Additional Details</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Enter any additional details"
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default TaskForm; 