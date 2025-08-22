import React from 'react';

const Footer = () => {
  return (
    <footer className="flex-shrink-0 p-4 text-center text-sm text-text-secondary border-t border-border bg-white">
      <p>&copy; {new Date().getFullYear()} Vaultify. All rights reserved.</p>
      <p className="mt-1">
        Build by Mayank Jaiswal.
      </p>
    </footer>
  );
};

export default Footer;