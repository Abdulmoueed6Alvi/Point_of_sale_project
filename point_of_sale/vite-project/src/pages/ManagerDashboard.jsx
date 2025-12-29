import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Package, ShoppingCart, TrendingUp, AlertTriangle,
    ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        todaySales: 0,
        todayRevenue: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [dashboardRes, productsRes, salesRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/products'),
                api.get('/sales')
            ]);

            // Set main stats
            setStats({
                totalProducts: dashboardRes.data.totalProducts || 0,
                lowStockProducts: dashboardRes.data.lowStockProducts || 0,
                todaySales: dashboardRes.data.todaySales || 0,
                todayRevenue: dashboardRes.data.todayRevenue || 0
            });

            // Sales trend data
            if (dashboardRes.data.salesTrend) {
                setSalesData(dashboardRes.data.salesTrend);
            }

            // Top selling products
            if (dashboardRes.data.topProducts) {
                setTopProducts(dashboardRes.data.topProducts.slice(0, 5));
            }

            // Low stock items
            const lowStock = productsRes.data.filter(p => p.stock <= p.lowStockThreshold);
            setLowStockItems(lowStock.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return <div className="loading-container">Loading dashboard...</div>;
    }

    return (
        <div className="manager-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Manager Dashboard</h1>
                    <p>Welcome back, {user?.name}! Here's your store overview.</p>
                </div>
                <button
                    className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon products">
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p className="stat-value">{stats.totalProducts}</p>
                        <span className="stat-label">In inventory</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon sales">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Today's Sales</h3>
                        <p className="stat-value">{stats.todaySales}</p>
                        <span className="stat-label">Transactions</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Today's Revenue</h3>
                        <p className="stat-value">PKR {stats.todayRevenue.toLocaleString()}</p>
                        <span className="stat-label">Total earnings</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon alert">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Low Stock Alert</h3>
                        <p className="stat-value">{stats.lowStockProducts}</p>
                        <span className="stat-label">Items need restock</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>Sales Trend (Last 7 Days)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Top Selling Products</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="totalSold" fill="#10b981" name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
                <div className="low-stock-section">
                    <h3>
                        <AlertTriangle size={20} />
                        Low Stock Items - Restock Required
                    </h3>
                    <div className="low-stock-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Threshold</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td className="stock-cell">
                                            <span className={`stock-badge ${item.stock === 0 ? 'out' : 'low'}`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td>{item.lowStockThreshold}</td>
                                        <td>
                                            {item.stock === 0 ? (
                                                <span className="status-badge critical">Out of Stock</span>
                                            ) : (
                                                <span className="status-badge warning">Low Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <a href="/products" className="action-card">
                        <Package size={32} />
                        <span>Manage Products</span>
                        <p>Add, edit or view products</p>
                    </a>
                    <a href="/inventory" className="action-card">
                        <ArrowUp size={32} />
                        <span>Update Inventory</span>
                        <p>Adjust stock levels</p>
                    </a>
                    <a href="/pos" className="action-card">
                        <ShoppingCart size={32} />
                        <span>Point of Sale</span>
                        <p>Make a new sale</p>
                    </a>
                    <a href="/reports" className="action-card">
                        <TrendingUp size={32} />
                        <span>View Reports</span>
                        <p>Sales and inventory reports</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
