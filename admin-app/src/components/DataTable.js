import React from 'react';

const DataTable = ({ data }) => {
    return (
        <table className="wpgs-table">
            <thead>
                <tr>
                    <th>Post ID</th>
                    <th>Post Title</th>
                    <th>Errors Found</th>
                </tr>
            </thead>
            <tbody>
                {Object.keys(data).map(postId => (
                    <tr key={postId}>
                        <td>{postId}</td>
                        <td>{data[postId].title || 'N/A'}</td>
                        <td>{data[postId].length}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;
