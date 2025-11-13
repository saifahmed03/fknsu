// FILE: src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Card, Alert, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    education: '',
    social_links: {}
  });
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        education: profile.education || ''
      });
      
      if (profile.social_links) {
        setSocialLinks({
          linkedin: profile.social_links.linkedin || '',
          github: profile.social_links.github || '',
          twitter: profile.social_links.twitter || ''
        });
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLinkChange = (e) => {
    setSocialLinks({
      ...socialLinks,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        social_links: socialLinks
      };

      await api.profiles.update(profile.id, updateData);
      await refreshProfile();
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h2 className="mb-4">Profile Settings</h2>
                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="full_name">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="phone">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="education">
                          <Form.Label>Education</Form.Label>
                          <Form.Control
                            type="text"
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            placeholder="e.g., Bachelor's in Computer Science"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <hr className="my-4" />
                    <h5 className="mb-3">Social Links</h5>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId="linkedin">
                          <Form.Label>LinkedIn</Form.Label>
                          <Form.Control
                            type="url"
                            name="linkedin"
                            value={socialLinks.linkedin}
                            onChange={handleSocialLinkChange}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId="github">
                          <Form.Label>GitHub</Form.Label>
                          <Form.Control
                            type="url"
                            name="github"
                            value={socialLinks.github}
                            onChange={handleSocialLinkChange}
                            placeholder="https://github.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId="twitter">
                          <Form.Label>Twitter</Form.Label>
                          <Form.Control
                            type="url"
                            name="twitter"
                            value={socialLinks.twitter}
                            onChange={handleSocialLinkChange}
                            placeholder="https://twitter.com/..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                      <AnimatedButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </AnimatedButton>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </Container>
      <Footer />
    </>
  );
};

export default Profile;