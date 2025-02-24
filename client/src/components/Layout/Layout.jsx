import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, user }) => {
    return (
        <div className="layout">
            <Sidebar user={user} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;