import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useContext(AuthContext);

  const [report, setReport] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [status, setStatus] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        // Fetch both report and departments in parallel
        const [reportRes, deptsRes] = await Promise.all([
          axios.get(`${API_URL}/reports/${id}`, { headers: { 'x-auth-token': authToken } }),
          axios.get(`${API_URL}/departments`, { headers: { 'x-auth-token': authToken } })
        ]);

        setReport(reportRes.data);
        setDepartments(deptsRes.data);

        // Initialize form state
        setStatus(reportRes.data.status);
        setAssignedDepartment(reportRes.data.assigned_department_id || '');

      } catch (err) {
        setError('Failed to fetch report details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [id, authToken]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        status,
        assigned_department_id: assignedDepartment || null,
      };
      await axios.put(`${API_URL}/reports/${id}`, updateData, {
        headers: { 'x-auth-token': authToken },
      });
      alert('Report updated successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to update report.');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!report) return <div>Report not found.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.detailCard}>
        <h1>{report.title}</h1>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Submitted:</strong> {new Date(report.created_at).toLocaleString()}</p>
        <p><strong>Description:</strong> {report.description}</p>
        {report.photo_url && (
          <div>
            <strong>Photo:</strong><br/>
            <img src={report.photo_url} alt="Report" style={styles.photo} />
          </div>
        )}
      </div>

      <div style={styles.updateCard}>
        <h2>Update Report</h2>
        <form onSubmit={handleUpdate}>
          <div style={styles.formGroup}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label>Assign to Department</label>
            <select value={assignedDepartment} onChange={(e) => setAssignedDepartment(e.target.value)} style={styles.select}>
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={styles.button}>Update Report</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
    container: { padding: '20px', color: 'white' },
    detailCard: { backgroundColor: '#444', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    updateCard: { backgroundColor: '#444', padding: '20px', borderRadius: '8px' },
    photo: { maxWidth: '100%', height: 'auto', marginTop: '10px', borderRadius: '4px' },
    formGroup: { marginBottom: '15px' },
    select: { width: '100%', padding: '8px', borderRadius: '4px' },
    button: { padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' },
};

export default ReportDetail;