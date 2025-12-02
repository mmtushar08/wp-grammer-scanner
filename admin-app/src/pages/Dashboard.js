import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [reportMeta, setReportMeta] = useState(null);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);

    const apiRoot = window.wpGsApi?.root || '/wp-json/';       // we’ll localize this from PHP
    const nonce = window.wpGsApi?.nonce || '';

    const axiosInstance = axios.create({
        baseURL: apiRoot,
        headers: nonce ? { 'X-WP-Nonce': nonce } : {},
    });

    const scanNow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.post('wp-grammar-scanner/v1/scan');
            alert(res.data.message || 'Scan completed.');
            await fetchReport();
        } catch (err) {
            console.error(err);
            setError('Error running scan.');
        }
        setLoading(false);
    };

    const fetchReport = async () => {
        setError(null);
        try {
            const res = await axiosInstance.get('wp-grammar-scanner/v1/report');
            if (!res.data.has_report) {
                setReportMeta(null);
                setRows([]);
                return;
            }
            setReportMeta(res.data.report);
            setRows(res.data.rows || []);
        } catch (err) {
            console.error(err);
            setError('Error loading data.');
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div className="wpgs-dashboard">
            <h1>WP Grammar Scanner Dashboard</h1>

            <button onClick={scanNow} disabled={loading}>
                {loading ? 'Scanning...' : 'Scan Now'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {reportMeta && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Last Scan Summary</h2>
                    <p>
                        <strong>Status:</strong> {reportMeta.status}<br />
                        <strong>Total posts:</strong> {reportMeta.total_posts}<br />
                        <strong>Total issues:</strong> {reportMeta.total_issues}<br />
                        <strong>Created:</strong> {reportMeta.created_at}
                    </p>

                    {reportMeta.csv_url && (
                        <p>
                            <a href={reportMeta.csv_url} className="button button-primary" download>
                                Download Full CSV
                            </a>
                        </p>
                    )}
                </div>
            )}

            {rows && rows.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Issues Preview (first {rows.length})</h2>
                    <table className="widefat striped">
                        <thead>
                            <tr>
                                <th>Post ID</th>
                                <th>Title</th>
                                <th>Message</th>
                                <th>Rule</th>
                                <th>Sentence</th>
                                <th>Suggestions</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td>{row['Post ID']}</td>
                                    <td>{row['Title']}</td>
                                    <td>{row['Message']}</td>
                                    <td>{row['Rule']}</td>
                                    <td>{row['Sentence']}</td>
                                    <td>{row['Suggestions']}</td>
                                    <td>
                                        {row['URL'] && (
                                            <a href={row['URL']} target="_blank" rel="noreferrer">
                                                View Post
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!reportMeta && !error && (
                <p>No reports yet. Click “Scan Now” to generate your first report.</p>
            )}
        </div>
    );
};

export default Dashboard;
