// FILE: src/pages/Universities.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Universities = () => {
  const { profile } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await api.universities.getAll();
      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (university = null) => {
    if (university) {
      setEditingUniversity(university);
      setFormData({
        name: university.name,
        location: university.location || '',
        website: university.website || ''
      });
    } else {
      setEditingUniversity(null);
      setFormData({
        name: '',
        location: '',
        website: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUniversity(null);
    setFormData({
      name: '',
      location: '',
      website: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUniversity) {
        await api.universities.update(editingUniversity.id, formData);
        setSuccess('University updated successfully!');
      } else {
        await api.universities.create(formData);
        setSuccess('University created successfully!');
      }
      handleCloseModal();
      fetchUniversities();
    } catch (error) {
      console.error('Error saving university:', error);
      setError('Failed to save university');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this university? This will also delete all associated programs.')) return;

    try {
      await api.universities.delete(id);
      setSuccess('University deleted successfully!');
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      setError('Failed to delete university. Make sure there are no programs associated with it.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Universities</h1>
            {profile?.role === 'admin' && (
              <AnimatedButton variant="primary" onClick={() => handleShowModal()}>
                + Add University
              </AnimatedButton>
            )}
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {universities.length === 0 ? (
            <Alert variant="info">No universities available at the moment.</Alert>
          ) : (
            <Row className="g-4">
              {universities.map((university) => (
                <Col key={university.id} md={6} lg={4}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-100 shadow-sm border-0">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0">{university.name}</h5>
                          <Badge bg="info">🏛️</Badge>
                        </div>
                        <p className="text-muted mb-2">
                          <strong>📍</strong> {university.location || 'Location not specified'}
                        </p>
                        {university.website && (
                          <p className="mb-3">
                            <a 
                              href={university.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none small"
                            >
                              🌐 Visit Website
                            </a>
                          </p>
                        )}
                        {profile?.role === 'admin' && (
                          <div className="d-flex gap-2 mt-3">
                            <AnimatedButton
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleShowModal(university)}
                            >
                              Edit
                            </AnimatedButton>
                            <AnimatedButton
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(university.id)}
                            >
                              Delete
                            </AnimatedButton>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingUniversity ? 'Edit University' : 'Add University'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>University Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Harvard University"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Cambridge, MA, USA"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://university.edu"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary">
                  {editingUniversity ? 'Update' : 'Create'}
                </AnimatedButton>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
      <Footer />
    </>
  );
};

export default Universities;