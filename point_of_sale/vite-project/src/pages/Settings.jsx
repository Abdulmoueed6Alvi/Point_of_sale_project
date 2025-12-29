import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';
import { Activity, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'manager') {
            fetchActivityLogs();
        }
    }, [user]);

    const fetchActivityLogs = async () => {
        try {
            const response = await logsAPI.getActivityLogs({ limit: 20 });
            setActivityLogs(response.data.logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="page-title">Settings & System Logs</h1>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                            <Shield size={32} color="#2563eb" />
                        </div>
                        <div>
                            <h3>User Role</h3>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {user?.role}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                            <Users size={32} color="#10b981" />
                        </div>
                        <div>
                            <h3>Logged In As</h3>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {user?.name}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                            <Activity size={32} color="#f59e0b" />
                        </div>
                        <div>
                            <h3>System Status</h3>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                                Active
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {(user?.role === 'admin' || user?.role === 'manager') && (
                <div className="card">
                    <h2>Recent Activity Logs</h2>
                    {loading ? (
                        <p>Loading logs...</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Module</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                                            <td>
                                                <div>
                                                    <p style={{ fontWeight: 600 }}>{log.user?.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {log.user?.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-info">{log.action}</span></td>
                                            <td>{log.module}</td>
                                            <td>{log.description}</td>
                                            <td>
                                                <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>System Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Application Name</p>
                        <p style={{ fontWeight: 600 }}>POS Sanitary Store</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Version</p>
                        <p style={{ fontWeight: 600 }}>1.0.0</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Database</p>
                        <p style={{ fontWeight: 600 }}>MongoDB</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tech Stack</p>
                        <p style={{ fontWeight: 600 }}>MERN Stack</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
