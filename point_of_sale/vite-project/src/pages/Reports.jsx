import { useState, useEffect } from 'react';
import { dashboardAPI, salesAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const [salesByCategory, setSalesByCategory] = useState([]);
    const [stats, setStats] = useState(null);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        try {
            const [categoryRes, statsRes] = await Promise.all([
                dashboardAPI.getSalesByCategory(dateRange),
                salesAPI.getStats(dateRange)
            ]);
            setSalesByCategory(categoryRes.data.salesByCategory);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div>
            <h1 className="page-title">Reports & Analytics</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Filter Reports</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Total Sales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalSales || 0}</p>
                </div>
                <div className="card">
                    <h3>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                        PKR {stats?.totalRevenue?.toLocaleString() || 0}
                    </p>
                </div>
                <div className="card">
                    <h3>Average Sale</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        PKR {stats?.avgSaleValue?.toFixed(2) || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h2>Sales by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByCategory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#2563eb" name="Revenue" />
                            <Bar dataKey="totalQuantity" fill="#10b981" name="Quantity" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h2>Revenue Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={salesByCategory}
                                dataKey="totalRevenue"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {salesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
