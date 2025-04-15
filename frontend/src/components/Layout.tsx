import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Header could go here */}
      <main>{children}</main>
      {/* Footer could go here */}
    </div>
  );
};

export default Layout; 