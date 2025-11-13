// FILE: src/pages/Applications.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, Table, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Applications = () => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    program_id: '',
    status: 'pending'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchPrograms();
  }, [profile]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let data;
      if (profile?.role === 'admin') {
        data = await api.applications.getAll();
      } else {
        data = await api.applications.getByStudent(profile.id);
      }
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await api.programs.getAll();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleShowModal = (app = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        program_id: app.program_id,
        status: app.status
      });
    } else {
      setEditingApp(null);
      setFormData({
        program_id: '',
        status: 'pending'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingApp(null);
    setFormData({
      program_id: '',
      status: 'pending'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingApp) {
        await api.applications.update(editingApp.id, formData);
        setSuccess('Application updated successfully!');
      } else {
        const newApp = {
          ...formData,
          student_id: profile.id,
          submitted_at: new Date().toISOString()
        };
        await api.applications.create(newApp);
        setSuccess('Application submitted successfully!');
      }
      handleCloseModal();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      setError('Failed to save application');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.applications.delete(id);
      setSuccess('Application deleted successfully!');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      under_review: 'info'
    };
    return variants[status] || 'secondary';
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
            <h1>Applications</h1>
            {profile?.role === 'student' && (
              <AnimatedButton variant="primary" onClick={() => handleShowModal()}>
                + New Application
              </AnimatedButton>
            )}
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Card className="shadow-sm border-0">
            <Card.Body>
              {applications.length === 0 ? (
                <p className="text-center text-muted py-4">No applications found</p>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th>University</th>
                        {profile?.role === 'admin' && <th>Student</th>}
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.programs?.name || 'N/A'}</td>
                          <td>{app.programs?.universities?.name || 'N/A'}</td>
                          {profile?.role === 'admin' && (
                            <td>{app.profiles?.full_name || 'N/A'}</td>
                          )}
                          <td>
                            <Badge bg={getStatusBadge(app.status)}>
                              {app.status}
                            </Badge>
                          </td>
                          <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                          <td>
                            <AnimatedButton
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleShowModal(app)}
                            >
                              Edit
                            </AnimatedButton>
                            {profile?.role === 'student' && (
                              <AnimatedButton
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(app.id)}
                              >
                                Delete
                              </AnimatedButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingApp ? 'Edit Application' : 'New Application'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Program</Form.Label>
                <Form.Select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  required
                  disabled={editingApp && profile?.role === 'student'}
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.universities?.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {(editingApp && profile?.role === 'admin') && (
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              )}

              <div className="d-flex justify-content-end gap-2">
                <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary">
                  {editingApp ? 'Update' : 'Submit'}
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

export default Applications;
