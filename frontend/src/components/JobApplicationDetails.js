import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobApplications, deleteJobApplication } from '../services/api';

const JobApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      const response = await getJobApplications();
      if (response.success && Array.isArray(response.data)) {
        const foundApplication = response.data.find(app => app.name === id);
        if (foundApplication) {
          console.log("Found application:", foundApplication);
          setApplication(foundApplication);
        } else {
          // Try making a direct API call to get the specific application
          try {
            const detailResponse = await fetch(`http://localhost:8000/api/resource/Job Application/${id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              credentials: 'include',
              mode: 'cors'
            });
            
            if (detailResponse.ok) {
              const data = await detailResponse.json();
              if (data && data.data) {
                // Convert Frappe format to our app format
                const app = data.data;
                const formattedApp = {
                  name: app.name,
                  title: app.job_title || app.title || 'Untitled Position',
                  applicant_name: app.applicant_name || 'No Name',
                  email: app.email_id || app.email || 'No Email',
                  status: app.status || 'Applied',
                  position: app.job_title || app.position || 'Unspecified Position',
                  department: app.department || 'Unspecified',
                  apply_date: app.application_date || app.apply_date || new Date().toISOString().slice(0, 10),
                  resume_link: app.resume_attachment || app.resume_link || '',
                  experience: app.experience || 'Not specified',
                  skills: app.skills || 'Not specified'
                };
                setApplication(formattedApp);
              } else {
                setError('Job application not found');
              }
            } else {
              setError('Job application not found');
            }
          } catch (detailErr) {
            console.error('Error fetching specific application:', detailErr);
            setError('Job application not found');
          }
        }
      } else {
        setError('Failed to fetch job application details');
      }
    } catch (err) {
      console.error('Error fetching job application details:', err);
      setError('An error occurred while fetching the job application details');
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
    
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleDelete = async () => {
    // Check if user has delete permission
    if (user && !user.isAdmin && !user.isManager) {
      setError('You do not have permission to delete job applications');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        const response = await deleteJobApplication(id);
        if (response.success) {
          setSuccess('Job application deleted successfully');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/applications');
          }, 2000);
        } else {
          setError(response.message || 'Failed to delete job application');
        }
      } catch (err) {
        setError('An error occurred while deleting the job application');
        console.error('Error deleting job application:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Applied':
        return 'status-applied';
      case 'Screening':
        return 'status-screening';
      case 'Interview':
        return 'status-interview';
      case 'Offer':
        return 'status-offer';
      case 'Hired':
        return 'status-hired';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if user can edit applications
  const canEdit = user && (user.isAdmin || user.isManager);
  
  // Check if user can delete applications
  const canDelete = user && (user.isAdmin || user.isManager);

  if (loading) {
    return (
      <Container className="main-container">
        <p>Loading job application details...</p>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container className="main-container">
        <Alert variant="danger">
          Job application not found. <Link to="/applications">Return to Applications</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="main-container">
      <Row className="mb-4">
        <Col>
          <h1>Job Application Details</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">{application.title}</Card.Title>
                <Badge className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  {application.status}
                </Badge>
              </div>
              
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Applicant:</strong> {application.applicant_name}</p>
                  <p className="mb-1"><strong>Email:</strong> {application.email}</p>
                  <p className="mb-1"><strong>Position:</strong> {application.position}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Department:</strong> {application.department}</p>
                  <p className="mb-1"><strong>Application Date:</strong> {formatDate(application.apply_date)}</p>
                  <p className="mb-1"><strong>Experience:</strong> {application.experience || 'Not specified'}</p>
                </Col>
              </Row>
              
              <div className="mb-3">
                <h5>Skills</h5>
                <p>{application.skills || 'No skills listed'}</p>
              </div>
              
              {application.resume_link && (
                <div className="mb-3">
                  <h5>Resume</h5>
                  <p>{application.resume_link}</p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-between">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/applications')}
            >
              Back to Applications
            </Button>
            
            <div>
              {canEdit && (
                <Button 
                  as={Link} 
                  to={`/application/edit/${application.name}`} 
                  variant="primary" 
                  className="me-2"
                >
                  Edit Application
                </Button>
              )}
              
              {canDelete && (
                <Button 
                  variant="danger" 
                  onClick={handleDelete}
                >
                  Delete Application
                </Button>
              )}
            </div>
          </div>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Application Timeline</Card.Title>
              <div className="timeline mt-3">
                <div className={`timeline-item ${application.status === 'Applied' || application.status === 'Screening' || application.status === 'Interview' || application.status === 'Offer' || application.status === 'Hired' ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Applied</h6>
                    <p className="text-muted">{formatDate(application.apply_date)}</p>
                  </div>
                </div>
                
                <div className={`timeline-item ${application.status === 'Screening' || application.status === 'Interview' || application.status === 'Offer' || application.status === 'Hired' ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Screening</h6>
                  </div>
                </div>
                
                <div className={`timeline-item ${application.status === 'Interview' || application.status === 'Offer' || application.status === 'Hired' ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Interview</h6>
                  </div>
                </div>
                
                <div className={`timeline-item ${application.status === 'Offer' || application.status === 'Hired' ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Offer</h6>
                  </div>
                </div>
                
                <div className={`timeline-item ${application.status === 'Hired' ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Hired</h6>
                  </div>
                </div>
                
                {application.status === 'Rejected' && (
                  <div className="timeline-item rejected">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6>Rejected</h6>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JobApplicationDetails; 