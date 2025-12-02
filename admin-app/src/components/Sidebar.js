import React from 'react';

const Sidebar = ({ setPage }) => {
    return (
        <aside className="wpgs-sidebar">
            <ul>
                <li><button onClick={() => setPage('dashboard')}>Dashboard</button></li>
                <li><button onClick={() => setPage('reports')}>Reports</button></li>
                <li><button onClick={() => setPage('settings')}>Settings</button></li>
            </ul>
        </aside>
    );
};

export default Sidebar;
