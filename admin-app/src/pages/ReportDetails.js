import React from 'react';
import ErrorItem from '../components/ErrorItem';

const ReportDetails = ({ matches }) => {
    return (
        <div className="wpgs-report-details">
            {matches && matches.length ? (
                matches.map((m, i) => <ErrorItem key={i} match={m} />)
            ) : (
                <p>No grammar errors found.</p>
            )}
        </div>
    );
};

export default ReportDetails;
