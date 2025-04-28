import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { login } from '../services/api';

// Enhanced Logo Component
const Logo = () => (
  <div className="text-center mb-4">
    <div className="logo-container mb-3">
      <div className="logo-icon">
        <i className="bi bi-briefcase-fill fs-1 text-light"></i>
      </div>
    </div>
    <h2 className="fw-bold text-light mb-2">Job Application Portal</h2>
    <p className="text-light opacity-75">Your career journey starts here</p>
  </div>
);

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg login-card">
              <Card.Body className="p-4 p-md-5">
                <Logo />
                
                {error && (
                  <Alert variant="danger" className="mb-4 rounded-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="formUsername">
                    <Form.Label className="fw-medium text-light">Email/Username</Form.Label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-dark border-end-0 text-light border-secondary">
                        <i className="bi bi-person"></i>
                      </span>
                      <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your email"
                        className="py-2 border-start-0 bg-dark text-light border-secondary"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-medium text-light">Password</Form.Label>
                    <InputGroup size="lg">
                      <InputGroup.Text className="bg-dark border-end-0 text-light border-secondary">
                        <i className="bi bi-lock"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="py-2 border-start-0 border-end-0 bg-dark text-light border-secondary"
                        required
                      />
                      <InputGroup.Text 
                        className="bg-dark border-start-0 text-light border-secondary password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid gap-2 mt-4 mb-2">
                    <Button 
                      variant="success" 
                      type="submit" 
                      size="lg"
                      className="py-3 rounded-3 fw-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            <div className="text-center mt-4 text-light">
              <p className="small">&copy; {new Date().getFullYear()} Job Application Portal. All rights reserved.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login; 