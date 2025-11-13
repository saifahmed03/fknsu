// FILE: src/pages/Programs.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Programs = () => {
  const { profile } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    university_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPrograms();
    fetchUniversities();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await api.programs.getAll();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const data = await api.universities.getAll();
      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleShowModal = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        description: program.description || '',
        university_id: program.university_id
      });
    } else {
      setEditingProgram(null);
      setFormData({
        name: '',
        description: '',
        university_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProgram(null);
    setFormData({
      name: '',
      description: '',
      university_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingProgram) {
        await api.programs.update(editingProgram.id, formData);
        setSuccess('Program updated successfully!');
      } else {
        await api.programs.create(formData);
        setSuccess('Program created successfully!');
      }
      handleCloseModal();
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      setError('Failed to save program');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;

    try {
      await api.programs.delete(id);
      setSuccess('Program deleted successfully!');
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      setError('Failed to delete program');
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
            <h1>Programs</h1>
            {profile?.role === 'admin' && (
              <AnimatedButton variant="primary" onClick={() => handleShowModal()}>
                + Add Program
              </AnimatedButton>
            )}
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {programs.length === 0 ? (
            <Alert variant="info">No programs available at the moment.</Alert>
          ) : (
            <Row className="g-4">
              {programs.map((program) => (
                <Col key={program.id} md={6} lg={4}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-100 shadow-sm border-0">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title">{program.name}</h5>
                          <Badge bg="primary">🎓</Badge>
                        </div>
                        <p className="text-muted mb-2">
                          <strong>{program.universities?.name}</strong>
                        </p>
                        <p className="card-text small text-muted">
                          {program.description || 'No description available'}
                        </p>
                        {profile?.role === 'admin' && (
                          <div className="d-flex gap-2 mt-3">
                            <AnimatedButton
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleShowModal(program)}
                            >
                              Edit
                            </AnimatedButton>
                            <AnimatedButton
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(program.id)}
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
            <Modal.Title>{editingProgram ? 'Edit Program' : 'Add Program'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Program Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bachelor of Computer Science"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>University</Form.Label>
                <Form.Select
                  value={formData.university_id}
                  onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                  required
                >
                  <option value="">Select a university</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Program description..."
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary">
                  {editingProgram ? 'Update' : 'Create'}
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

export default Programs;