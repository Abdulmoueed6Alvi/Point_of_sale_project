import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { salesAPI } from '../services/api';
import { Eye, XCircle, X, Package, User, Calendar, CreditCard, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import './Sales.css';

const Sales = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    // Check if user can cancel sales (admin/manager only)
    const canCancelSales = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        filterSales();
    }, [sales, searchTerm, dateRange]);

    const fetchSales = async () => {
        try {
            const response = await salesAPI.getAll();
            setSales(response.data.sales || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSales = () => {
        let filtered = [...sales];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(sale => 
                sale.invoiceNumber?.toLowerCase().includes(search) ||
                sale.customer?.name?.toLowerCase().includes(search) ||
                sale.customer?.phone?.includes(search)
            );
        }

        // Date range filter
        if (dateRange.startDate) {
            const startDate = new Date(dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(sale => new Date(sale.createdAt) >= startDate);
        }
        if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(sale => new Date(sale.createdAt) <= endDate);
        }

        setFilteredSales(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateRange({ startDate: '', endDate: '' });
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this sale?')) {
            try {
                await salesAPI.cancel(id, 'Cancelled by user');
                fetchSales();
            } catch (error) {
                alert('Error cancelling sale');
            }
        }
    };

    const handleViewDetails = (sale) => {
        setSelectedSale(sale);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedSale(null);
        setShowModal(false);
    };

    if (loading) return <div className="loading">Loading sales...</div>;

    return (
        <div>
            <h1 className="page-title">
                {user?.role === 'cashier' ? 'My Sales History' : 'Sales History'}
            </h1>

            {/* Search and Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                        <label>Search</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Search by invoice #, customer name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                    </div>
                    <button 
                        className="btn btn-outline" 
                        onClick={clearFilters}
                        style={{ height: '42px' }}
                    >
                        Clear
                    </button>
                </div>
                {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Showing {filteredSales.length} of {sales.length} sales
                    </div>
                )}
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale._id}>
                                    <td><strong>{sale.invoiceNumber}</strong></td>
                                    <td>{sale.customer.name}</td>
                                    <td>{format(new Date(sale.createdAt), 'dd MMM yyyy, hh:mm a')}</td>
                                    <td>{sale.items.length} items</td>
                                    <td><strong>PKR {sale.total.toLocaleString()}</strong></td>
                                    <td>
                                        <span className={`badge ${sale.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {sale.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${sale.status === 'completed' ? 'badge-success' : sale.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline"
                                            style={{ marginRight: '0.5rem', padding: '0.5rem' }}
                                            onClick={() => handleViewDetails(sale)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {canCancelSales && sale.status === 'completed' && (
                                            <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleCancel(sale._id)}>
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Details Modal */}
            {showModal && selectedSale && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="sale-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FileText size={24} />
                                Sale Details
                            </h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="sale-detail-content">
                            {/* Invoice Info */}
                            <div className="detail-section">
                                <div className="detail-row">
                                    <span className="detail-label">Invoice Number:</span>
                                    <span className="detail-value invoice-number">{selectedSale.invoiceNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <Calendar size={16} /> Date:
                                    </span>
                                    <span className="detail-value">
                                        {format(new Date(selectedSale.createdAt), 'dd MMM yyyy, hh:mm a')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`badge ${selectedSale.status === 'completed' ? 'badge-success' : selectedSale.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                        {selectedSale.status}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="detail-section">
                                <h3><User size={18} /> Customer Information</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{selectedSale.customer?.name || 'Walk-in Customer'}</span>
                                </div>
                                {selectedSale.customer?.phone && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{selectedSale.customer.phone}</span>
                                    </div>
                                )}
                                {selectedSale.customer?.email && (
                                    <div className="detail-row">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{selectedSale.customer.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="detail-section">
                                <h3><Package size={18} /> Items Purchased</h3>
                                <div className="items-table-container">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Qty</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSale.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.productName || item.product?.name || 'Unknown Product'}</td>
                                                    <td>PKR {(item.unitPrice || 0).toLocaleString()}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>PKR {(item.subtotal || (item.unitPrice || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="detail-section payment-section">
                                <h3><CreditCard size={18} /> Payment Information</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Payment Method:</span>
                                    <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                                        {selectedSale.paymentMethod}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Payment Status:</span>
                                    <span className={`badge ${selectedSale.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                        {selectedSale.paymentStatus}
                                    </span>
                                </div>
                                {selectedSale.discount > 0 && (
                                    <div className="detail-row">
                                        <span className="detail-label">Discount:</span>
                                        <span className="detail-value discount">-PKR {selectedSale.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="detail-row total-row">
                                    <span className="detail-label">Total Amount:</span>
                                    <span className="detail-value total-amount">PKR {selectedSale.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Cashier Info */}
                            {selectedSale.cashier && (
                                <div className="detail-section">
                                    <div className="detail-row">
                                        <span className="detail-label">Processed by:</span>
                                        <span className="detail-value">{selectedSale.cashier.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
