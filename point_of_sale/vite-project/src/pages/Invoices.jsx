import { useState, useEffect } from 'react';
import { invoiceAPI } from '../services/api';
import { FileText, Download, Eye, X, Package, User, Calendar, CreditCard, Printer, Search } from 'lucide-react';
import './Invoices.css';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        filterInvoices();
    }, [invoices, searchTerm, dateRange]);

    const fetchInvoices = async () => {
        try {
            const response = await invoiceAPI.getAll();
            setInvoices(response.data.invoices || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const filterInvoices = () => {
        let filtered = [...invoices];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(invoice => 
                invoice.invoiceNumber?.toLowerCase().includes(search) ||
                invoice.customer?.name?.toLowerCase().includes(search) ||
                invoice.customer?.phone?.includes(search)
            );
        }

        // Date range filter
        if (dateRange.startDate) {
            const startDate = new Date(dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(invoice => new Date(invoice.createdAt) >= startDate);
        }
        if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(invoice => new Date(invoice.createdAt) <= endDate);
        }

        setFilteredInvoices(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateRange({ startDate: '', endDate: '' });
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedInvoice(null);
        setShowModal(false);
    };

    const handlePrint = () => {
        if (!selectedInvoice) return;
        
        const printWindow = window.open('', '_blank');
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${selectedInvoice.invoiceNumber || 'N/A'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    .invoice-container { max-width: 800px; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
                    .company-name { font-size: 24px; font-weight: bold; color: #667eea; }
                    .company-subtitle { color: #666; font-size: 14px; }
                    .invoice-title { text-align: right; }
                    .invoice-title h2 { font-size: 28px; color: #333; }
                    .invoice-number { background: #eef2ff; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #667eea; display: inline-block; margin: 8px 0; }
                    .invoice-date { color: #666; font-size: 14px; }
                    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .section-title { font-size: 16px; font-weight: bold; color: #444; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
                    .customer-name { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
                    .customer-detail { color: #666; font-size: 14px; margin-bottom: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #667eea; color: white; padding: 12px; text-align: left; font-size: 14px; }
                    td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
                    tr:hover { background: #f5f5f5; }
                    .totals { max-width: 300px; margin-left: auto; margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .total-row.final { border-top: 2px solid #667eea; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: bold; }
                    .total-row.final span:last-child { color: #667eea; }
                    .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                    .payment-item label { font-size: 12px; color: #666; display: block; margin-bottom: 4px; }
                    .payment-item span { font-weight: 600; }
                    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                    .badge-success { background: #c6f6d5; color: #22543d; }
                    .badge-warning { background: #fefcbf; color: #744210; }
                    .badge-danger { background: #fed7d7; color: #822727; }
                    .footer { text-align: center; padding: 20px; background: #667eea; color: white; border-radius: 8px; margin-top: 30px; }
                    .footer p { margin: 4px 0; }
                    @media print { body { padding: 0; } .invoice-container { max-width: 100%; } }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div>
                            <div class="company-name">Sanitary Store</div>
                            <div class="company-subtitle">Point of Sale System</div>
                        </div>
                        <div class="invoice-title">
                            <h2>INVOICE</h2>
                            <div class="invoice-number">${selectedInvoice.invoiceNumber || 'N/A'}</div>
                            <div class="invoice-date">${formatDate(selectedInvoice.createdAt)}</div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Bill To</div>
                        <div class="customer-name">${selectedInvoice.customer?.name || 'Walk-in Customer'}</div>
                        ${selectedInvoice.customer?.phone ? `<div class="customer-detail">Phone: ${selectedInvoice.customer.phone}</div>` : ''}
                        ${selectedInvoice.customer?.email ? `<div class="customer-detail">Email: ${selectedInvoice.customer.email}</div>` : ''}
                        ${selectedInvoice.customer?.address ? `<div class="customer-detail">Address: ${selectedInvoice.customer.address}</div>` : ''}
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Items</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(selectedInvoice.items || []).map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.productName || item.product?.name || 'Unknown Product'}</td>
                                        <td>PKR ${(item.unitPrice || 0).toLocaleString()}</td>
                                        <td>${item.quantity || 0}</td>
                                        <td>PKR ${(item.subtotal || (item.unitPrice || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>PKR ${((selectedInvoice.total || 0) + (selectedInvoice.discount || 0)).toLocaleString()}</span>
                            </div>
                            ${selectedInvoice.discount > 0 ? `
                                <div class="total-row" style="color: #e53e3e;">
                                    <span>Discount:</span>
                                    <span>-PKR ${selectedInvoice.discount.toLocaleString()}</span>
                                </div>
                            ` : ''}
                            <div class="total-row final">
                                <span>Total Amount:</span>
                                <span>PKR ${(selectedInvoice.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Payment Details</div>
                        <div class="payment-grid">
                            <div class="payment-item">
                                <label>Payment Method</label>
                                <span style="text-transform: capitalize;">${selectedInvoice.paymentMethod || 'N/A'}</span>
                            </div>
                            <div class="payment-item">
                                <label>Payment Status</label>
                                <span class="badge ${selectedInvoice.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}">${selectedInvoice.paymentStatus || 'N/A'}</span>
                            </div>
                            <div class="payment-item">
                                <label>Invoice Status</label>
                                <span class="badge ${selectedInvoice.status === 'completed' ? 'badge-success' : 'badge-danger'}">${selectedInvoice.status || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        ${selectedInvoice.cashier ? `<p style="font-size: 14px; opacity: 0.9;">Processed by: ${selectedInvoice.cashier.name}</p>` : ''}
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return 'N/A';
        }
    };

    if (loading) return <div className="loading">Loading invoices...</div>;

    return (
        <div>
            <h1 className="page-title">Invoices</h1>

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
                        Showing {filteredInvoices.length} of {invoices.length} invoices
                    </div>
                )}
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total Amount</th>
                                <th>Payment Status</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td><strong>{invoice.invoiceNumber || 'N/A'}</strong></td>
                                    <td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{invoice.customer?.name || 'Walk-in Customer'}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {invoice.customer?.phone || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td><strong>PKR {(invoice.total || 0).toLocaleString()}</strong></td>
                                    <td>
                                        <span className={`badge ${invoice.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {invoice.paymentStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${invoice.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => handleViewInvoice(invoice)}
                                            title="View Invoice"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Details Modal */}
            {showModal && selectedInvoice && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FileText size={24} />
                                Invoice Details
                            </h2>
                            <div className="modal-header-actions">
                                <button className="btn btn-outline print-btn" onClick={handlePrint} title="Print Invoice">
                                    <Printer size={18} />
                                </button>
                                <button className="modal-close" onClick={closeModal}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="invoice-content" id="invoice-print">
                            {/* Invoice Header */}
                            <div className="invoice-header-section">
                                <div className="company-info">
                                    <h1>Sanitary Store</h1>
                                    <p>Point of Sale System</p>
                                </div>
                                <div className="invoice-info">
                                    <h2>INVOICE</h2>
                                    <p className="invoice-number">{selectedInvoice.invoiceNumber || 'N/A'}</p>
                                    <p className="invoice-date">
                                        <Calendar size={14} />
                                        {formatDate(selectedInvoice.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="customer-section">
                                <h3><User size={18} /> Bill To</h3>
                                <div className="customer-details">
                                    <p className="customer-name">{selectedInvoice.customer?.name || 'Walk-in Customer'}</p>
                                    {selectedInvoice.customer?.phone && (
                                        <p>Phone: {selectedInvoice.customer.phone}</p>
                                    )}
                                    {selectedInvoice.customer?.email && (
                                        <p>Email: {selectedInvoice.customer.email}</p>
                                    )}
                                    {selectedInvoice.customer?.address && (
                                        <p>Address: {selectedInvoice.customer.address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="items-section">
                                <h3><Package size={18} /> Items</h3>
                                <table className="invoice-items-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedInvoice.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.productName || item.product?.name || 'Unknown Product'}</td>
                                                <td>PKR {(item.unitPrice || 0).toLocaleString()}</td>
                                                <td>{item.quantity || 0}</td>
                                                <td>PKR {(item.subtotal || (item.unitPrice || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Section */}
                            <div className="totals-section">
                                <div className="totals-row">
                                    <span>Subtotal:</span>
                                    <span>PKR {((selectedInvoice.total || 0) + (selectedInvoice.discount || 0)).toLocaleString()}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="totals-row discount">
                                        <span>Discount:</span>
                                        <span>-PKR {selectedInvoice.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="totals-row total">
                                    <span>Total Amount:</span>
                                    <span>PKR {(selectedInvoice.total || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="payment-info-section">
                                <h3><CreditCard size={18} /> Payment Details</h3>
                                <div className="payment-details">
                                    <div className="payment-row">
                                        <span>Payment Method:</span>
                                        <span style={{ textTransform: 'capitalize' }}>{selectedInvoice.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div className="payment-row">
                                        <span>Payment Status:</span>
                                        <span className={`badge ${selectedInvoice.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {selectedInvoice.paymentStatus || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="payment-row">
                                        <span>Invoice Status:</span>
                                        <span className={`badge ${selectedInvoice.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                                            {selectedInvoice.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="invoice-footer">
                                <p>Thank you for your business!</p>
                                {selectedInvoice.cashier && (
                                    <p className="cashier-info">Processed by: {selectedInvoice.cashier.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
