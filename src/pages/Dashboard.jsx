// FILE: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    documents: 0,
    notifications: 0,
    programs: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (profile?.role === 'student') {
        const applications = await api.applications.getByStudent(profile.id);
        const notifications = await api.notifications.getByStudent(profile.id);
        
        let documentCount = 0;
        for (const app of applications) {
          const docs = await api.documents.getByApplication(app.id);
          documentCount += docs.length;
        }

        setStats({
          applications: applications.length,
          documents: documentCount,
          notifications: notifications.filter(n => !n.read_status).length,
          programs: 0
        });
        setRecentApplications(applications.slice(0, 5));
      } else if (profile?.role === 'admin') {
        const applications = await api.applications.getAll();
        const programs = await api.programs.getAll();
        const universities = await api.universities.getAll();
        const profiles = await api.profiles.getAll();

        setStats({
          applications: applications.length,
          programs: programs.length,
          universities: universities.length,
          users: profiles.length
        });
        setRecentApplications(applications.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      under_review: 'info'
    };
    return badges[status] || 'secondary';
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
          <h1 className="mb-4">Dashboard</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="g-4 mb-4">
            {profile?.role === 'student' ? (
              <>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Applications</h6>
                          <h2 className="mb-0">{stats.applications}</h2>
                        </div>
                        <div className="fs-1">📝</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Documents</h6>
                          <h2 className="mb-0">{stats.documents}</h2>
                        </div>
                        <div className="fs-1">📁</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Unread Notifications</h6>
                          <h2 className="mb-0">{stats.notifications}</h2>
                        </div>
                        <div className="fs-1">🔔</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </>
            ) : (
              <>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Total Applications</h6>
                          <h2 className="mb-0">{stats.applications}</h2>
                        </div>
                        <div className="fs-1">📝</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Programs</h6>
                          <h2 className="mb-0">{stats.programs}</h2>
                        </div>
                        <div className="fs-1">🎓</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Universities</h6>
                          <h2 className="mb-0">{stats.universities}</h2>
                        </div>
                        <div className="fs-1">🏛️</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} lg={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Total Users</h6>
                          <h2 className="mb-0">{stats.users}</h2>
                        </div>
                        <div className="fs-1">👥</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </>
            )}
          </Row>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Applications</h5>
            </Card.Header>
            <Card.Body>
              {recentApplications.length === 0 ? (
                <p className="text-muted text-center py-4">No applications yet</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Program</th>
                        {profile?.role === 'admin' && <th>Student</th>}
                        <th>University</th>
                        <th>Status</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.programs?.name || 'N/A'}</td>
                          {profile?.role === 'admin' && (
                            <td>{app.profiles?.full_name || 'N/A'}</td>
                          )}
                          <td>{app.programs?.universities?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="text-center mt-3">
                <Link to="/applications" className="btn btn-primary">
                  View All Applications
                </Link>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
      <Footer />
    </>
  );
};

export default Dashboard;