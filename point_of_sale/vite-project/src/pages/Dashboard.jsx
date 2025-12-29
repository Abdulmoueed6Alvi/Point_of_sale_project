import { useState, useEffect } from 'react';
import { dashboardAPI, productAPI } from '../services/api';
import {
    TrendingUp, Package, AlertTriangle, DollarSign,
    ShoppingBag, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, lowStockRes] = await Promise.all([
                dashboardAPI.getStats(),
                productAPI.getLowStock()
            ]);

            setStats({
                ...statsRes.data,
                lowStockProducts: lowStockRes.data.products
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    const statCards = [
        {
            title: "Today's Sales",
            value: `PKR ${stats?.today?.revenue?.toLocaleString() || 0}`,
            subtitle: `${stats?.today?.count || 0} transactions`,
            icon: DollarSign,
            color: '#10b981'
        },
        {
            title: "This Month",
            value: `PKR ${stats?.thisMonth?.revenue?.toLocaleString() || 0}`,
            subtitle: `${stats?.thisMonth?.count || 0} sales`,
            icon: TrendingUp,
            color: '#2563eb'
        },
        {
            title: "Products",
            value: stats?.products?.totalProducts || 0,
            subtitle: `Value: PKR ${stats?.products?.totalValue?.toLocaleString() || 0}`,
            icon: Package,
            color: '#8b5cf6'
        },
        {
            title: "Low Stock Alert",
            value: stats?.products?.lowStock || 0,
            subtitle: `${stats?.products?.outOfStock || 0} out of stock`,
            icon: AlertTriangle,
            color: '#ef4444'
        }
    ];

    return (
        <div className="dashboard">
            <h1 className="page-title">Dashboard</h1>

            <div className="stat-cards grid grid-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stat.title}</h3>
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-subtitle">{stat.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-2" style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h2>Sales Trend (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.salesTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h2>Top Selling Products</h2>
                    <div className="top-products">
                        {stats?.topProducts?.length > 0 ? (
                            stats.topProducts.map((product, index) => (
                                <div key={index} className="top-product-item">
                                    <div className="product-rank">{index + 1}</div>
                                    <div className="product-details">
                                        <p className="product-name">{product.productName}</p>
                                        <p className="product-stats">
                                            {product.totalQuantity} units • PKR {product.totalRevenue?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No sales data available</p>
                        )}
                    </div>
                </div>
            </div>

            {stats?.lowStockProducts?.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h2>Low Stock Alerts</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Min Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.lowStockProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.name}</td>
                                        <td>{product.sku}</td>
                                        <td>
                                            <span className="badge badge-info">{product.category}</span>
                                        </td>
                                        <td>{product.stock}</td>
                                        <td>{product.minStockLevel}</td>
                                        <td>
                                            <span className={`badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {stats?.recentActivities?.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h2>Recent Activities</h2>
                    <div className="activity-list">
                        {stats.recentActivities.slice(0, 10).map((activity) => (
                            <div key={activity._id} className="activity-item">
                                <div className="activity-icon">
                                    <ShoppingBag size={16} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-description">{activity.description}</p>
                                    <p className="activity-meta">
                                        {activity.user?.name} • {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
