import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import DataTable from '../components/DataTable';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState({});

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/wp-json/wp-grammar-scanner/v1/report');
            setReport(res.data.report || {});
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div className="wpgs-reports">
            <h2>All Reports</h2>
            {loading ? <Loader /> : <DataTable data={report} />}
        </div>
    );
};

export default Reports;
