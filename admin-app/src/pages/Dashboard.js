import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const scanNow = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/wp-json/wp-grammar-scanner/v1/scan');
            alert(`Scan completed! ${res.data.report_count} posts scanned.`);
            fetchReport();
        } catch (err) {
            console.error(err);
            alert('Error running scan.');
        }
        setLoading(false);
    };

    const fetchReport = async () => {
        try {
            const res = await axios.get('/wp-json/wp-grammar-scanner/v1/report');
            setReport(res.data.report);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>WP Grammar Scanner Dashboard</h1>
            <button onClick={scanNow} disabled={loading}>
                {loading ? 'Scanning...' : 'Scan Now'}
            </button>

            {report && report.length > 0 && (
                <div>
                    <h2>Last Report</h2>
                    <ul>
                        {report.map(item => (
                            <li key={item.id}>
                                {item.title} - Word Count: {item.word_count}, Issues Found: {item.issues_found}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
