import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';

const UserSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    projectUpdates: true,
    taskUpdates: true,
    weeklyDigest: false,
    dailySummary: false
  });

  const [integrations, setIntegrations] = useState({
    slack: false,
    slackWorkspace: '',
    github: false,
    githubRepo: '',
    linkedin: false,
    linkedinProfile: '',
    calendar: true,
    calendarType: 'google'
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    compactView: false,
    showAvatar: true,
    accentColor: 'green'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  const handleIntegrationChange = (event) => {
    const { name, value, type, checked } = event.target;
    setIntegrations({
      ...integrations,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAppearanceChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAppearance({
      ...appearance,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real application, this would save to the backend
    setSaveSuccess(true);
    setSaveError(null);

    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-success">
        <i className="bi bi-gear-fill fs-2 me-3 text-success"></i>
        <h2 className="text-light m-0 fw-bold">
          <span className="text-success">User Settings</span> 
        </h2>
      </div>

      {saveSuccess && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSaveSuccess(false)}>
          <i className="bi bi-check-circle me-2"></i>
          Your settings have been saved successfully!
        </Alert>
      )}

      {saveError && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setSaveError(null)}>
          <i className="bi bi-exclamation-circle me-2"></i>
          {saveError}
        </Alert>
      )}

      <Tabs
        defaultActiveKey="notifications"
        className="mb-4 custom-tabs"
        fill
      >
        <Tab eventKey="notifications" title={<><i className="bi bi-bell me-2"></i>Notifications</>}>
          <Card className="border-0 bg-dark text-light shadow">
            <Card.Body className="p-4">
              <h5 className="mb-4 border-bottom pb-2 text-success">Email Notifications</h5>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="emailNotifications"
                        name="emailNotifications"
                        label={<span className="text-light">Email Notifications</span>}
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="custom-switch"
                      />
                      <Form.Text className="text-light opacity-75">
                        Receive email notifications for important updates
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="applicationUpdates"
                        name="applicationUpdates"
                        label={<span className="text-light">Job Application Updates</span>}
                        checked={notificationSettings.applicationUpdates}
                        onChange={handleNotificationChange}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <Form.Text className="text-light opacity-75">
                        Notifications for status changes on your job applications
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="projectUpdates"
                        name="projectUpdates"
                        label={<span className="text-light">Project Updates</span>}
                        checked={notificationSettings.projectUpdates}
                        onChange={handleNotificationChange}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <Form.Text className="text-light opacity-75">
                        Notifications for updates on projects you're involved with
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="taskUpdates"
                        name="taskUpdates"
                        label={<span className="text-light">Task Updates</span>}
                        checked={notificationSettings.taskUpdates}
                        onChange={handleNotificationChange}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <Form.Text className="text-light opacity-75">
                        Notifications for changes to your assigned tasks
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="weeklyDigest"
                        name="weeklyDigest"
                        label={<span className="text-light">Weekly Digest</span>}
                        checked={notificationSettings.weeklyDigest}
                        onChange={handleNotificationChange}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <Form.Text className="text-light opacity-75">
                        Receive a weekly summary of all your activities
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="dailySummary"
                        name="dailySummary"
                        label={<span className="text-light">Daily Summary</span>}
                        checked={notificationSettings.dailySummary}
                        onChange={handleNotificationChange}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <Form.Text className="text-light opacity-75">
                        Get a daily summary of your upcoming tasks and deadlines
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end mt-4">
                  <Button variant="success" type="submit">
                    <i className="bi bi-save me-2"></i>
                    Save Notification Settings
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="integrations" title={<><i className="bi bi-link-45deg me-2"></i>Integrations</>}>
          <Card className="border-0 bg-dark text-light shadow">
            <Card.Body className="p-4">
              <h5 className="mb-4 border-bottom pb-2 text-success">External Service Integrations</h5>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Card className="mb-3 bg-dark border border-secondary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 text-info">
                            <i className="bi bi-slack me-2"></i>
                            Slack Integration
                          </h6>
                          <Form.Check 
                            type="switch"
                            id="slack"
                            name="slack"
                            checked={integrations.slack}
                            onChange={handleIntegrationChange}
                            className="custom-switch"
                          />
                        </div>
                        {integrations.slack && (
                          <Form.Group className="mb-2">
                            <Form.Label className="text-light">Slack Workspace URL</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="slackWorkspace"
                              value={integrations.slackWorkspace}
                              onChange={handleIntegrationChange}
                              placeholder="your-workspace.slack.com"
                              className="bg-dark text-light border-secondary"
                            />
                          </Form.Group>
                        )}
                        <p className="small text-light opacity-75 mb-0">
                          Receive notifications in your Slack workspace
                        </p>
                      </Card.Body>
                    </Card>

                    <Card className="mb-3 bg-dark border border-secondary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 text-light">
                            <i className="bi bi-github me-2"></i>
                            GitHub Integration
                          </h6>
                          <Form.Check 
                            type="switch"
                            id="github"
                            name="github"
                            checked={integrations.github}
                            onChange={handleIntegrationChange}
                            className="custom-switch"
                          />
                        </div>
                        {integrations.github && (
                          <Form.Group className="mb-2">
                            <Form.Label className="text-light">GitHub Repository</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="githubRepo"
                              value={integrations.githubRepo}
                              onChange={handleIntegrationChange}
                              placeholder="username/repository"
                              className="bg-dark text-light border-secondary"
                            />
                          </Form.Group>
                        )}
                        <p className="small text-light opacity-75 mb-0">
                          Link tasks to GitHub issues and track progress
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="mb-3 bg-dark border border-secondary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 text-primary">
                            <i className="bi bi-linkedin me-2"></i>
                            LinkedIn Integration
                          </h6>
                          <Form.Check 
                            type="switch"
                            id="linkedin"
                            name="linkedin"
                            checked={integrations.linkedin}
                            onChange={handleIntegrationChange}
                            className="custom-switch"
                          />
                        </div>
                        {integrations.linkedin && (
                          <Form.Group className="mb-2">
                            <Form.Label className="text-light">LinkedIn Profile URL</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="linkedinProfile"
                              value={integrations.linkedinProfile}
                              onChange={handleIntegrationChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="bg-dark text-light border-secondary"
                            />
                          </Form.Group>
                        )}
                        <p className="small text-light opacity-75 mb-0">
                          Import profile data and share job application progress
                        </p>
                      </Card.Body>
                    </Card>

                    <Card className="mb-3 bg-dark border border-secondary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 text-success">
                            <i className="bi bi-calendar-date me-2"></i>
                            Calendar Integration
                          </h6>
                          <Form.Check 
                            type="switch"
                            id="calendar"
                            name="calendar"
                            checked={integrations.calendar}
                            onChange={handleIntegrationChange}
                            className="custom-switch"
                          />
                        </div>
                        {integrations.calendar && (
                          <Form.Group className="mb-2">
                            <Form.Label className="text-light">Calendar Type</Form.Label>
                            <Form.Select 
                              name="calendarType"
                              value={integrations.calendarType}
                              onChange={handleIntegrationChange}
                              className="bg-dark text-light border-secondary"
                            >
                              <option value="google">Google Calendar</option>
                              <option value="outlook">Outlook Calendar</option>
                              <option value="apple">Apple Calendar</option>
                            </Form.Select>
                          </Form.Group>
                        )}
                        <p className="small text-light opacity-75 mb-0">
                          Sync interviews and deadlines with your calendar
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="text-end mt-4">
                  <Button variant="success" type="submit">
                    <i className="bi bi-save me-2"></i>
                    Save Integration Settings
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="appearance" title={<><i className="bi bi-palette me-2"></i>Appearance</>}>
          <Card className="border-0 bg-dark text-light shadow">
            <Card.Body className="p-4">
              <h5 className="mb-4 border-bottom pb-2 text-success">Appearance Settings</h5>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="text-light">Theme</Form.Label>
                      <Form.Select 
                        name="theme"
                        value={appearance.theme}
                        onChange={handleAppearanceChange}
                        className="bg-dark text-light border-secondary"
                      >
                        <option value="dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                        <option value="system">System Default</option>
                      </Form.Select>
                      <Form.Text className="text-light opacity-75">
                        Choose your preferred color theme
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-light">Accent Color</Form.Label>
                      <Form.Select 
                        name="accentColor"
                        value={appearance.accentColor}
                        onChange={handleAppearanceChange}
                        className="bg-dark text-light border-secondary"
                      >
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                      </Form.Select>
                      <Form.Text className="text-light opacity-75">
                        Select accent color for buttons and highlights
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Check 
                        type="switch"
                        id="compactView"
                        name="compactView"
                        label={<span className="text-light">Compact View</span>}
                        checked={appearance.compactView}
                        onChange={handleAppearanceChange}
                        className="custom-switch"
                      />
                      <Form.Text className="text-light opacity-75">
                        Reduce spacing for more content on screen
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check 
                        type="switch"
                        id="showAvatar"
                        name="showAvatar"
                        label={<span className="text-light">Show Profile Avatar</span>}
                        checked={appearance.showAvatar}
                        onChange={handleAppearanceChange}
                        className="custom-switch"
                      />
                      <Form.Text className="text-light opacity-75">
                        Display your profile picture in the navigation bar
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end mt-4">
                  <Button variant="success" type="submit">
                    <i className="bi bi-save me-2"></i>
                    Save Appearance Settings
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default UserSettings; 