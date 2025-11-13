// FILE: src/pages/Documents.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Modal, Form, Table, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import { uploadFile, deleteFile } from '../utils/fileUpload';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedButton from '../components/AnimatedButton';

const Documents = () => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [profile]);

  useEffect(() => {
    if (applications.length > 0) {
      fetchAllDocuments();
    }
  }, [applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.applications.getByStudent(profile.id);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const allDocs = [];
      for (const app of applications) {
        const docs = await api.documents.getByApplication(app.id);
        allDocs.push(...docs.map(doc => ({ ...doc, application: app })));
      }
      setDocuments(allDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    setSelectedFile(null);
    setSelectedAppId('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setSelectedAppId('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedAppId) {
      setError('Please select a file and application');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const fileData = await uploadFile(selectedFile);
      
      await api.documents.create({
        application_id: selectedAppId,
        file_name: fileData.name,
        file_url: fileData.url,
        uploaded_at: new Date().toISOString()
      });

      setSuccess('Document uploaded successfully!');
      handleCloseModal();
      fetchAllDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const filePath = doc.file_url.split('/').pop();
      await deleteFile(filePath);
      await api.documents.delete(doc.id);
      setSuccess('Document deleted successfully!');
      fetchAllDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
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
            <h1>Documents</h1>
            <AnimatedButton variant="primary" onClick={handleShowModal}>
              + Upload Document
            </AnimatedButton>
          </div>

          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {applications.length === 0 ? (
            <Alert variant="info">
              You need to create an application first before uploading documents.
            </Alert>
          ) : (
            <Card className="shadow-sm border-0">
              <Card.Body>
                {documents.length === 0 ? (
                  <p className="text-center text-muted py-4">No documents uploaded yet</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Application</th>
                          <th>Program</th>
                          <th>Uploaded</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.file_name}</td>
                            <td>{doc.application?.programs?.name || 'N/A'}</td>
                            <td>{doc.application?.programs?.universities?.name || 'N/A'}</td>
                            <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                            <td>
                              <AnimatedButton
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                View
                              </AnimatedButton>
                              <AnimatedButton
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(doc)}
                              >
                                Delete
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
          )}
        </motion.div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Application</Form.Label>
                <Form.Select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  required
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.programs?.name} - {app.programs?.universities?.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <Form.Text className="text-muted">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <AnimatedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
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

export default Documents;