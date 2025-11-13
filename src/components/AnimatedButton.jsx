// FILE: src/components/AnimatedButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';

const AnimatedButton = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
};

export default AnimatedButton;
