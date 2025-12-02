import React from 'react';

const ErrorItem = ({ match }) => {
    return (
        <div className="wpgs-error-item">
            <p><strong>Message:</strong> {match.message}</p>
            <p><strong>Context:</strong> {match.context.text}</p>
            <p><strong>Suggestion:</strong> {match.replacements.map(r => r.value).join(', ')}</p>
        </div>
    );
};

export default ErrorItem;
