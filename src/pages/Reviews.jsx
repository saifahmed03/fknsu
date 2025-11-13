// FILE: src/pages/Reviews.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, Table, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Reviews = () => {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    application_id: '',
    comments: '',
    status: 'pending'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchApplications();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getAll();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await api.applications.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleShowModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        application_id: review.application_id,
        comments: review.comments || '',
        status: review.status
      });
    } else {
      setEditingReview(null);
      setFormData({
        application_id: '',
        comments: '',
        status: 'pending'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData({
      application_id: '',
      comments: '',
      status: 'pending'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        ...formData,
        reviewer_id: profile.id,
        reviewed_at: new Date().toISOString()
      };

      if (editingReview) {
        await api.reviews.update(editingReview.id, reviewData);
        setSuccess('Review updated successfully!');
      } else {
        await api.reviews.create(reviewData);
        setSuccess('Review submitted successfully!');
      }

      // Update application status
      await api.applications.update(formData.application_id, { 
        status: formData.status 
      });

      handleCloseModal();
      fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      setError('Failed to save review');
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
            <h1>Application Reviews</h1>
            <AnimatedButton variant="primary" onClick={() => handleShowModal()}>
              + New Review
            </AnimatedButton>
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Card className="shadow-sm border-0">
            <Card.Body>
              {reviews.length === 0 ? (
                <p className="text-center text-muted py-4">No reviews yet</p>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Program</th>
                        <th>Reviewer</th>
                        <th>Status</th>
                        <th>Comments</th>
                        <th>Reviewed Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                          <td>{review.applications?.profiles?.full_name || 'N/A'}</td>
                          <td>{review.applications?.programs?.name || 'N/A'}</td>
                          <td>{review.profiles?.full_name || 'N/A'}</td>
                          <td>
                            <Badge bg={getStatusBadge(review.status)}>
                              {review.status}
                            </Badge>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {review.comments || 'No comments'}
                          </td>
                          <td>{new Date(review.reviewed_at).toLocaleDateString()}</td>
                          <td>
                            <AnimatedButton
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleShowModal(review)}
                            >
                              Edit
                            </AnimatedButton>
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

        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingReview ? 'Edit Review' : 'New Review'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Application</Form.Label>
                <Form.Select
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  required
                  disabled={editingReview}
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.profiles?.full_name} - {app.programs?.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Review Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Enter your review comments..."
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary">
                  {editingReview ? 'Update Review' : 'Submit Review'}
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

export default Reviews;