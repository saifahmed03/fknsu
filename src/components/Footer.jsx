// FILE: src/components/Footer.jsx
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container className="text-center">
        <p className="mb-0">&copy; 2025 Bhorti Juddho. All rights reserved.</p>
        <p className="mb-0 small text-muted">University Application Management Platform</p>
      </Container>
    </footer>
  );
};

export default Footer;
