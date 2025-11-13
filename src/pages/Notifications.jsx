// FILE: src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Notifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotifications();
    if (profile?.role === 'admin') {
      fetchStudents();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getByStudent(profile.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await api.profiles.getAll();
      setStudents(data.filter(p => p.role === 'student'));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    setFormData({
      student_id: '',
      message: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      student_id: '',
      message: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const notificationData = {
        ...formData,
        read_status: false,
        created_at: new Date().toISOString()
      };

      await api.notifications.create(notificationData);
      setSuccess('Notification sent successfully!');
      handleCloseModal();
      if (formData.student_id === profile.id) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await api.notifications.delete(id);
      setSuccess('Notification deleted successfully!');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
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
            <h1>Notifications</h1>
            {profile?.role === 'admin' && (
              <AnimatedButton variant="primary" onClick={handleShowModal}>
                + Send Notification
              </AnimatedButton>
            )}
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Card className="shadow-sm border-0">
            <Card.Body>
              {notifications.length === 0 ? (
                <p className="text-center text-muted py-4">No notifications</p>
              ) : (
                <ListGroup variant="flush">
                  {notifications.map((notification) => (
                    <ListGroup.Item 
                      key={notification.id}
                      className={`d-flex justify-content-between align-items-start ${!notification.read_status ? 'bg-light' : ''}`}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          {!notification.read_status && (
                            <Badge bg="primary" className="me-2">New</Badge>
                          )}
                          <small className="text-muted">
                            {new Date(notification.created_at).toLocaleString()}
                          </small>
                        </div>
                        <p className="mb-0">{notification.message}</p>
                      </div>
                      <div className="d-flex gap-2 ms-3">
                        {!notification.read_status && (
                          <AnimatedButton
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark Read
                          </AnimatedButton>
                        )}
                        <AnimatedButton
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(notification.id)}
                        >
                          Delete
                        </AnimatedButton>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        {profile?.role === 'admin' && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Send Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Send To</Form.Label>
                  <Form.Select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} ({student.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter notification message..."
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton type="submit" variant="primary">
                    Send
                  </AnimatedButton>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default Notifications;
