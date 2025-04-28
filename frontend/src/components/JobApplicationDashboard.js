import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Badge, Button, Form, Alert, Table, Card, Nav, Tab, ListGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getJobApplications, deleteJobApplication, demoModeConfig } from '../services/api';

const JobApplicationDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'card', or 'kanban'
  const [activeView, setActiveView] = useState('all'); // 'all', 'recent', 'by-stage', etc.

  const fetchJobApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getJobApplications(filter || null);
      if (response.success) {
        console.log("Job applications data:", response.data);
        
        // Make sure each application has all required fields with defaults
        let processedApplications = response.data.map(app => ({
          name: app.name,
          title: app.title || app.job_title || 'Untitled Position',
          applicant_name: app.applicant_name || 'No Name',
          email: app.email || app.email_id || 'No Email',
          status: app.status || 'Applied',
          position: app.position || app.job_title || 'Unspecified Position',
          department: app.department || 'Unspecified',
          apply_date: app.apply_date || app.application_date || new Date().toISOString().slice(0, 10),
          resume_link: app.resume_link || app.resume_attachment || '',
          experience: app.experience || 'Not specified',
          skills: app.skills || 'Not specified'
        }));
        
        // Apply department filter if set
        if (departmentFilter) {
          processedApplications = processedApplications.filter(
            app => app.department.toLowerCase() === departmentFilter.toLowerCase()
          );
        }

        // Apply view-specific sorting and filtering
        if (activeView === 'recent') {
          // Sort by most recent application date
          processedApplications.sort((a, b) => new Date(b.apply_date) - new Date(a.apply_date));
          // Only show the 10 most recent
          processedApplications = processedApplications.slice(0, 10);
        } else if (activeView === 'by-stage') {
          // Sort by application stage/status
          const stageOrder = { 'Applied': 1, 'Screening': 2, 'Interview': 3, 'Offer': 4, 'Hired': 5, 'Rejected': 6 };
          processedApplications.sort((a, b) => stageOrder[a.status] - stageOrder[b.status]);
        } else if (activeView === 'by-department') {
          // Sort by department
          processedApplications.sort((a, b) => a.department.localeCompare(b.department));
        } else if (activeView === 'hired') {
          // Filter to only show hired candidates
          processedApplications = processedApplications.filter(app => app.status === 'Hired');
        } else if (activeView === 'in-progress') {
          // Filter to show applications in progress (not hired or rejected)
          processedApplications = processedApplications.filter(
            app => !['Hired', 'Rejected'].includes(app.status)
          );
        }
        
        setApplications(processedApplications);
        setError('');
        
        // Only show demo data notice if specifically allowed and not in the hide list
        if (response.isDemoData && response.showDemoNotice) {
          setError('Note: Showing demo data. The server connection might be unavailable.');
        }
      } else {
        setError(response.message || 'Failed to fetch job applications');
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);
      
      // Only log to console, don't show demo data notice
      console.log('Using demo data - server connection unavailable');
      
      // Provide demo data in case of error
      const demoApplications = [
        { 
          name: 'JOB-APP-DEMO-1', 
          title: 'Senior Software Engineer', 
          applicant_name: 'John Smith',
          email: 'john.smith@example.com',
          status: 'Interview',
          position: 'Software Engineer',
          department: 'Engineering',
          apply_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_john_smith.pdf',
          experience: '5 years',
          skills: 'JavaScript, React, Node.js'
        },
        { 
          name: 'JOB-APP-DEMO-2', 
          title: 'Marketing Specialist', 
          applicant_name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          status: 'Screening',
          position: 'Marketing Specialist',
          department: 'Marketing',
          apply_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_sarah_johnson.pdf',
          experience: '3 years',
          skills: 'Social Media, Content Strategy, SEO'
        },
        { 
          name: 'JOB-APP-DEMO-3', 
          title: 'UX Designer', 
          applicant_name: 'Michael Chen',
          email: 'michael.c@example.com',
          status: 'Applied',
          position: 'UX Designer',
          department: 'Design',
          apply_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_michael_chen.pdf',
          experience: '4 years',
          skills: 'Figma, Adobe XD, User Research'
        },
        { 
          name: 'JOB-APP-DEMO-4', 
          title: 'DevOps Engineer', 
          applicant_name: 'Emily Wilson',
          email: 'emily.w@example.com',
          status: 'Offer',
          position: 'DevOps Engineer',
          department: 'Engineering',
          apply_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_emily_wilson.pdf',
          experience: '6 years',
          skills: 'Docker, Kubernetes, AWS, CI/CD'
        },
        { 
          name: 'JOB-APP-DEMO-5', 
          title: 'Data Scientist', 
          applicant_name: 'Daniel Lopez',
          email: 'daniel.l@example.com',
          status: 'Rejected',
          position: 'Data Scientist',
          department: 'Analytics',
          apply_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_daniel_lopez.pdf',
          experience: '2 years',
          skills: 'Python, R, Machine Learning, SQL'
        },
        { 
          name: 'JOB-APP-DEMO-6', 
          title: 'Product Manager', 
          applicant_name: 'Sophia Rodriguez',
          email: 'sophia.r@example.com',
          status: 'Hired',
          position: 'Product Manager',
          department: 'Product',
          apply_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_sophia_rodriguez.pdf',
          experience: '7 years',
          skills: 'Product Strategy, Agile, Market Research'
        },
        { 
          name: 'JOB-APP-DEMO-7', 
          title: 'Frontend Developer', 
          applicant_name: 'James Wilson',
          email: 'james.w@example.com',
          status: 'Interview',
          position: 'Frontend Developer',
          department: 'Engineering',
          apply_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_james_wilson.pdf',
          experience: '3 years',
          skills: 'HTML, CSS, JavaScript, React'
        },
        { 
          name: 'JOB-APP-DEMO-8', 
          title: 'HR Specialist', 
          applicant_name: 'Emma Davis',
          email: 'emma.d@example.com',
          status: 'Applied',
          position: 'HR Specialist',
          department: 'Human Resources',
          apply_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          resume_link: 'resume_emma_davis.pdf',
          experience: '5 years',
          skills: 'Recruitment, Employee Relations, HRIS'
        }
      ];
      
      // Apply filters and sorting to demo data
      let filteredApplications = [...demoApplications];
      
      if (filter) {
        filteredApplications = filteredApplications.filter(app => app.status === filter);
      }
      
      if (departmentFilter) {
        filteredApplications = filteredApplications.filter(
          app => app.department.toLowerCase() === departmentFilter.toLowerCase()
        );
      }
      
      // Apply view-specific sorting and filtering
      if (activeView === 'recent') {
        filteredApplications.sort((a, b) => new Date(b.apply_date) - new Date(a.apply_date));
        filteredApplications = filteredApplications.slice(0, 10);
      } else if (activeView === 'by-stage') {
        const stageOrder = { 'Applied': 1, 'Screening': 2, 'Interview': 3, 'Offer': 4, 'Hired': 5, 'Rejected': 6 };
        filteredApplications.sort((a, b) => stageOrder[a.status] - stageOrder[b.status]);
      } else if (activeView === 'by-department') {
        filteredApplications.sort((a, b) => a.department.localeCompare(b.department));
      } else if (activeView === 'hired') {
        filteredApplications = filteredApplications.filter(app => app.status === 'Hired');
      } else if (activeView === 'in-progress') {
        filteredApplications = filteredApplications.filter(
          app => !['Hired', 'Rejected'].includes(app.status)
        );
      }
      
      setApplications(filteredApplications);
      
      // Mark that we're in demo mode, but don't show the notice
      demoModeConfig.isActive = true;
    } finally {
      setLoading(false);
    }
  }, [filter, departmentFilter, activeView]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('frappeUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchJobApplications();
  }, [fetchJobApplications]);

  const handleDeleteApplication = async (applicationId) => {
    // Check if user has delete permission
    if (user && !user.isAdmin && !user.isManager) {
      setError('You do not have permission to delete job applications');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        const response = await deleteJobApplication(applicationId);
        if (response.success) {
          setSuccess('Job application deleted successfully');
          // Refresh the application list
          fetchJobApplications();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess('');
          }, 3000);
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

  // Calculate days since application
  const getDaysSinceApplication = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const applyDate = new Date(dateString);
    const today = new Date();
    
    const diffTime = today - applyDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Get unique departments from applications
  const getDepartments = () => {
    const departments = new Set();
    applications.forEach(app => {
      if (app.department) departments.add(app.department);
    });
    return Array.from(departments).sort();
  };

  // Group applications by status
  const getApplicationsByStatus = () => {
    const statusGroups = {
      'Applied': [],
      'Screening': [],
      'Interview': [],
      'Offer': [],
      'Hired': [],
      'Rejected': []
    };
    
    applications.forEach(app => {
      if (statusGroups[app.status]) {
        statusGroups[app.status].push(app);
      } else {
        statusGroups['Applied'].push(app);
      }
    });
    
    return statusGroups;
  };

  // Group applications by department
  const getApplicationsByDepartment = () => {
    const departmentGroups = {};
    
    applications.forEach(app => {
      const department = app.department || 'Unspecified';
      if (!departmentGroups[department]) {
        departmentGroups[department] = [];
      }
      departmentGroups[department].push(app);
    });
    
    return departmentGroups;
  };

  // Render application card
  const renderApplicationCard = (application) => {
    return (
      <Card className="h-100 mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Badge className={`status-badge ${getStatusBadgeClass(application.status)}`}>
            {application.status}
          </Badge>
          <small>{getDaysSinceApplication(application.apply_date)}</small>
        </Card.Header>
        <Card.Body>
          <Card.Title>{application.title}</Card.Title>
          <div className="mb-3">
            <strong>{application.applicant_name}</strong>
            <br />
            <small>{application.email}</small>
          </div>
          <div className="mb-3">
            <Badge className="me-2 bg-info">{application.department}</Badge>
            <Badge className="bg-secondary">{application.experience}</Badge>
          </div>
          <div className="mt-3">
            <strong>Applied:</strong> {formatDate(application.apply_date)}
          </div>
          <div className="action-buttons mt-3">
            <Button 
              as={Link} 
              to={`/application/${application.name}`} 
              variant="outline-info" 
              size="sm"
              className="me-2"
            >
              View
            </Button>
            
            {canEdit && (
              <Button 
                as={Link} 
                to={`/application/edit/${application.name}`} 
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
                onClick={() => handleDeleteApplication(application.name)}
              >
                Delete
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Check if user can edit applications
  const canEdit = user && (user.isAdmin || user.isManager);
  
  // Check if user can create applications
  const canCreate = user && (user.isAdmin || user.isManager);
  
  // Check if user can delete applications
  const canDelete = user && (user.isAdmin || user.isManager);

  // Check if user is logged in
  const isLoggedIn = user !== null;

  return (
    <Container className="main-container">
      <h1 className="mb-4">Job Applications Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container id="application-views" defaultActiveKey="all">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="all" onClick={() => setActiveView('all')}>
              All Applications
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="by-stage" onClick={() => setActiveView('by-stage')}>
              By Stage
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="by-department" onClick={() => setActiveView('by-department')}>
              By Department
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="in-progress" onClick={() => setActiveView('in-progress')}>
              In Progress
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="hired" onClick={() => setActiveView('hired')}>
              Hired
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recent" onClick={() => setActiveView('recent')}>
              Recent
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex">
            <Form.Group className="me-3">
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Filter by Department</Form.Label>
              <Form.Select 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div>
            <Button 
              variant={viewMode === 'table' ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-2"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button 
              variant={viewMode === 'card' ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-2"
              onClick={() => setViewMode('card')}
            >
              Card View
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? "primary" : "outline-primary"} 
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban View
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
                    to="/application/new" 
                    variant="primary"
                  >
                    Create New Application
                  </Button>
                )}
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-4">
                <p>Loading job applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <Alert variant="info">
                No job applications found with the selected filters. {canCreate ? 'Create a new application to get started.' : 'Please check back later.'}
              </Alert>
            ) : viewMode === 'table' ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Applicant</th>
                    <th>Status</th>
                    <th>Department</th>
                    <th>Date Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.name}>
                      <td>{application.title}</td>
                      <td>
                        <div>{application.applicant_name}</div>
                        <small className="text-muted">{application.email}</small>
                      </td>
                      <td>
                        <Badge className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                          {application.status}
                        </Badge>
                      </td>
                      <td>{application.department}</td>
                      <td>{formatDate(application.apply_date)}</td>
                      <td>
                        <Button 
                          as={Link} 
                          to={`/application/${application.name}`} 
                          variant="outline-info" 
                          size="sm"
                          className="me-2"
                        >
                          View
                        </Button>
                        
                        {canEdit && (
                          <Button 
                            as={Link} 
                            to={`/application/edit/${application.name}`} 
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
                            onClick={() => handleDeleteApplication(application.name)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : viewMode === 'card' ? (
              <Row>
                {applications.map((application) => (
                  <Col md={4} key={application.name} className="mb-4">
                    {renderApplicationCard(application)}
                  </Col>
                ))}
              </Row>
            ) : viewMode === 'kanban' && activeView !== 'by-department' ? (
              <Row>
                {Object.entries(getApplicationsByStatus()).map(([status, statusApps]) => (
                  <Col md={2} key={status}>
                    <Card className="mb-4 kanban-column">
                      <Card.Header className={`text-center bg-${getStatusBadgeClass(status)}`}>
                        {status} ({statusApps.length})
                      </Card.Header>
                      <Card.Body className="p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {statusApps.length === 0 ? (
                          <p className="text-center text-muted">No applications</p>
                        ) : (
                          statusApps.map(app => (
                            <Card key={app.name} className="mb-2">
                              <Card.Body className="p-2">
                                <div className="d-flex justify-content-between">
                                  <Badge bg="info">{app.department}</Badge>
                                  <small>{getDaysSinceApplication(app.apply_date)}</small>
                                </div>
                                <h6 className="mt-1 mb-0">{app.title}</h6>
                                <small className="d-block">{app.applicant_name}</small>
                                <div className="d-flex justify-content-end mt-2">
                                  <Button 
                                    as={Link} 
                                    to={`/application/${app.name}`} 
                                    variant="link" 
                                    size="sm"
                                    className="p-0"
                                  >
                                    View
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
            ) : activeView === 'by-department' ? (
              <div>
                {Object.entries(getApplicationsByDepartment()).map(([department, deptApps]) => (
                  <Card key={department} className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{department} ({deptApps.length})</h5>
                    </Card.Header>
                    <Card.Body>
                      {viewMode === 'table' ? (
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Position</th>
                              <th>Applicant</th>
                              <th>Status</th>
                              <th>Date Applied</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deptApps.map((application) => (
                              <tr key={application.name}>
                                <td>{application.title}</td>
                                <td>
                                  <div>{application.applicant_name}</div>
                                  <small className="text-muted">{application.email}</small>
                                </td>
                                <td>
                                  <Badge className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                                    {application.status}
                                  </Badge>
                                </td>
                                <td>{formatDate(application.apply_date)}</td>
                                <td>
                                  <Button 
                                    as={Link} 
                                    to={`/application/${application.name}`} 
                                    variant="outline-info" 
                                    size="sm"
                                    className="me-1"
                                  >
                                    View
                                  </Button>
                                  {canEdit && (
                                    <Button 
                                      as={Link} 
                                      to={`/application/edit/${application.name}`} 
                                      variant="outline-primary" 
                                      size="sm"
                                      className="me-1"
                                    >
                                      Edit
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Row>
                          {deptApps.map((application) => (
                            <Col md={4} key={application.name} className="mb-3">
                              {renderApplicationCard(application)}
                            </Col>
                          ))}
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : null}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default JobApplicationDashboard; 