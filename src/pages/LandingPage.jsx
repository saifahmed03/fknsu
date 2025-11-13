// FILE: src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const LandingPage = () => {
  const features = [
    { title: 'Easy Applications', description: 'Apply to multiple universities with a single profile', icon: '📝' },
    { title: 'Track Progress', description: 'Monitor your application status in real-time', icon: '📊' },
    { title: 'Document Management', description: 'Upload and manage all required documents securely', icon: '📁' },
    { title: 'Instant Notifications', description: 'Get updates on your application status', icon: '🔔' }
  ];

  return (
    <>
      <Navbar />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center my-5"
        >
          <h1 className="display-3 fw-bold mb-4">Welcome to Bhorti Juddho</h1>
          <p className="lead mb-4">
            Your one-stop platform for managing university applications with ease
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <AnimatedButton as={Link} to="/signup" variant="primary" size="lg">
              Get Started
            </AnimatedButton>
            <AnimatedButton as={Link} to="/login" variant="outline-primary" size="lg">
              Login
            </AnimatedButton>
          </div>
        </motion.div>

        <Row className="my-5 g-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-100 text-center shadow-sm border-0">
                  <Card.Body>
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center my-5 py-5 bg-light rounded"
        >
          <h2 className="mb-4">Ready to Start Your Journey?</h2>
          <p className="lead mb-4">Join thousands of students managing their university applications</p>
          <AnimatedButton as={Link} to="/signup" variant="success" size="lg">
            Create Free Account
          </AnimatedButton>
        </motion.div>
      </Container>
      <Footer />
    </>
  );
};

export default LandingPage;