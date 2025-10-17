import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ children }) => {



  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
