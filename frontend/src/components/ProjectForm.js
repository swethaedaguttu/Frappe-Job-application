import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject } from '../services/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Planning',
    start_date: '',
    end_date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has permission to edit/create
      if (!parsedUser.isAdmin && !parsedUser.isManager) {
        setError('You do not have permission to create or edit projects');
        setTimeout(() => {
          navigate('/projects');
        }, 2000);
        return;
      }
    }
    
    if (isEditMode) {
      fetchProjectDetails();
    }
  }, [id, navigate]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await getProjects();
      if (response.success) {
        const projectData = response.data.find(project => project.name === id);
        
        if (projectData) {
          setFormData({
            name: projectData.name,
            title: projectData.title || '',
            description: projectData.description || '',
            status: projectData.status || 'Planning',
            start_date: projectData.start_date || '',
            end_date: projectData.end_date || ''
          });
        } else {
          setError('Project not found');
        }
      } else {
        setError(response.message || 'Failed to fetch project details');
      }
    } catch (err) {
      setError('An error occurred while fetching project details');
      console.error('Error fetching project details:', err);
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
      setError('You do not have permission to create or edit projects');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = isEditMode
        ? await updateProject({ ...formData, name: id })
        : await createProject(formData);

      if (response.success) {
        setSuccess(isEditMode ? 'Project updated successfully' : 'Project created successfully');
        
        // Redirect to projects dashboard after successful operation with a short delay
        setTimeout(() => {
          navigate('/projects');
        }, 1500);
      } else {
        setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
      }
    } catch (err) {
      setError(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the project`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, err);
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have permission, don't render the form
  if (user && !user.isAdmin && !user.isManager) {
    return (
      <Container className="form-container">
        <Alert variant="danger">
          You do not have permission to {isEditMode ? 'edit' : 'create'} projects.
          Redirecting to projects dashboard...
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="form-container">
      <h2 className="mb-4">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="projectTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter project title"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="projectDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter project description"
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="projectStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3" controlId="projectStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3" controlId="projectEndDate">
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

        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ProjectForm; 