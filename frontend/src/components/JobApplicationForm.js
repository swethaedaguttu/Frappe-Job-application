import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { createJobApplication, updateJobApplication, getJobApplications } from '../services/api';

const JobApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    applicant_name: '',
    email: '',
    status: 'Applied',
    position: '',
    department: '',
    apply_date: new Date().toISOString().slice(0, 10),
    resume_link: '',
    experience: '',
    skills: ''
  });
  
  const fetchApplicationData = useCallback(async () => {
    try {
      // Get all applications and find the one we want to edit
      const response = await getJobApplications();
      if (response.success && Array.isArray(response.data)) {
        const application = response.data.find(app => app.name === id);
        if (application) {
          setFormData({
            title: application.title || '',
            applicant_name: application.applicant_name || '',
            email: application.email || '',
            status: application.status || 'Applied',
            position: application.position || '',
            department: application.department || '',
            apply_date: application.apply_date || new Date().toISOString().slice(0, 10),
            resume_link: application.resume_link || '',
            experience: application.experience || '',
            skills: application.skills || ''
          });
        } else {
          setError('Application not found');
        }
      } else {
        setError('Failed to fetch application data');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('An error occurred while fetching the application data');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // If in edit mode, fetch the application data
    if (isEditMode) {
      fetchApplicationData();
    }
  }, [isEditMode, fetchApplicationData]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission
    if (user && !user.isAdmin && !user.isManager) {
      setError('You do not have permission to perform this action');
      return;
    }
    
    try {
      // Validate form data
      if (!formData.title || !formData.applicant_name || !formData.email || !formData.status) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Show loading state
      setSuccess('Processing...');
      
      // Prepare data to send to API
      const apiData = { ...formData };
      if (isEditMode) {
        apiData.name = id;
      }
      
      const response = isEditMode
        ? await updateJobApplication(apiData)
        : await createJobApplication(apiData);
      
      if (response.success) {
        setError(''); // Clear any previous errors
        setSuccess(
          isEditMode 
            ? 'Job application updated successfully' 
            : 'Job application created successfully'
        );
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/applications');
        }, 2000);
      } else {
        setError(response.message || 'Failed to save job application');
      }
    } catch (err) {
      console.error('Error saving application:', err);
      setError('An error occurred while saving the job application');
    }
  };
  
  if (loading) {
    return (
      <Container className="main-container">
        <p>Loading application data...</p>
      </Container>
    );
  }
  
  return (
    <Container className="main-container">
      <h1 className="mb-4">{isEditMode ? 'Edit Job Application' : 'Create Job Application'}</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="jobTitle">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Software Engineer"
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3" controlId="position">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g. Software Engineer"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="applicantName">
              <Form.Label>Applicant Name</Form.Label>
              <Form.Control
                type="text"
                name="applicant_name"
                value={formData.applicant_name}
                onChange={handleChange}
                required
                placeholder="Full name of the applicant"
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="department">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g. Engineering, Marketing, etc."
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="applyDate">
              <Form.Label>Application Date</Form.Label>
              <Form.Control
                type="date"
                name="apply_date"
                value={formData.apply_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3" controlId="experience">
              <Form.Label>Experience</Form.Label>
              <Form.Control
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5 years"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3" controlId="skills">
          <Form.Label>Skills</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="List the applicant's key skills"
          />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="resumeLink">
          <Form.Label>Resume Link or File Name</Form.Label>
          <Form.Control
            type="text"
            name="resume_link"
            value={formData.resume_link}
            onChange={handleChange}
            placeholder="Link to resume or file name"
          />
        </Form.Group>
        
        <div className="d-flex justify-content-between mt-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/applications')}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
          >
            {isEditMode ? 'Update Application' : 'Create Application'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default JobApplicationForm; 