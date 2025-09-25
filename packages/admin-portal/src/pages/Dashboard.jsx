import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports`, {
          headers: { 'x-auth-token': authToken },
        });
        setReports(response.data);
      } catch (err) {
        setError('Failed to fetch reports.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [authToken]);

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Reports Dashboard</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Submitted On</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td style={styles.td}>{report.title}</td>
              <td style={styles.td}>{report.status}</td>
              <td style={styles.td}>{new Date(report.created_at).toLocaleDateString()}</td>
              <td style={styles.td}>
                <Link to={`/report/${report.id}`}>View Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
    container: {
        padding: '20px',
        color: 'white',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    },
    th: {
        borderBottom: '2px solid #555',
        padding: '10px',
        textAlign: 'left',
        backgroundColor: '#333',
    },
    td: {
        borderBottom: '1px solid #555',
        padding: '10px',
    }
}

export default Dashboard;