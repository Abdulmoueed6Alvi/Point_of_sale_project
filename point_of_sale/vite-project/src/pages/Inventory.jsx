import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';

const Inventory = () => {
    const [summary, setSummary] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        try {
            const [summaryRes, logsRes] = await Promise.all([
                inventoryAPI.getSummary(),
                inventoryAPI.getLogs({ limit: 50 })
            ]);
            setSummary(summaryRes.data);
            setLogs(logsRes.data.logs);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading inventory...</div>;

    return (
        <div>
            <h1 className="page-title">Inventory Management</h1>

            <div className="grid grid-4">
                <div className="card">
                    <h3>Total Products</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {summary?.overall?.totalProducts || 0}
                    </p>
                </div>
                <div className="card">
                    <h3>Stock Value</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                        PKR {summary?.overall?.totalStockValue?.toLocaleString() || 0}
                    </p>
                </div>
                <div className="card">
                    <h3>Low Stock</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                        {summary?.overall?.lowStockCount || 0}
                    </p>
                </div>
                <div className="card">
                    <h3>Out of Stock</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                        {summary?.overall?.outOfStockCount || 0}
                    </p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>Inventory by Category</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Products</th>
                                <th>Stock Value</th>
                                <th>Selling Value</th>
                                <th>Low Stock</th>
                                <th>Out of Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary?.byCategory?.map((cat) => (
                                <tr key={cat._id}>
                                    <td><strong>{cat._id}</strong></td>
                                    <td>{cat.totalProducts}</td>
                                    <td>PKR {cat.totalStockValue?.toLocaleString()}</td>
                                    <td>PKR {cat.totalSellingValue?.toLocaleString()}</td>
                                    <td><span className="badge badge-warning">{cat.lowStockCount}</span></td>
                                    <td><span className="badge badge-danger">{cat.outOfStockCount}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>Recent Inventory Movements</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Change</th>
                                <th>Previous</th>
                                <th>New Stock</th>
                                <th>Performed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td>{log.product?.name || 'N/A'}</td>
                                    <td><span className="badge badge-info">{log.type}</span></td>
                                    <td>
                                        <span style={{ color: log.quantityChange > 0 ? 'var(--secondary-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                                            {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                                        </span>
                                    </td>
                                    <td>{log.previousStock}</td>
                                    <td><strong>{log.newStock}</strong></td>
                                    <td>{log.performedBy?.name || 'System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
