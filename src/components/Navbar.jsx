// FILE: src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BSNavbar, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../utils/auth';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          <strong>Bhorti Juddho</strong>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/programs">Programs</Nav.Link>
                {profile?.role === 'student' && (
                  <>
                    <Nav.Link as={Link} to="/applications">My Applications</Nav.Link>
                    <Nav.Link as={Link} to="/documents">Documents</Nav.Link>
                    <Nav.Link as={Link} to="/notifications">Notifications</Nav.Link>
                  </>
                )}
                {profile?.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/universities">Universities</Nav.Link>
                    <Nav.Link as={Link} to="/reviews">Reviews</Nav.Link>
                  </>
                )}
                <NavDropdown title={profile?.full_name || 'Account'} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
