import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, salesAPI } from '../services/api';
import {
    ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
    Banknote, Receipt, User, Package, CheckCircle, X,
    Calculator, Barcode
} from 'lucide-react';
import './CashierPOS.css';

function CashierPOS() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastInvoice, setLastInvoice] = useState(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        fetchProducts();
        // Focus on search on load
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory, products]);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll({ limit: 500 });
            const productList = response.data.products || [];
            setProducts(productList.filter(p => p.isActive && p.stock > 0));

            // Extract unique categories
            const uniqueCategories = [...new Set(productList.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        setFilteredProducts(filtered);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product._id === product._id);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const item = cart.find(i => i.product._id === productId);
        if (!item) return;

        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= item.product.stock) {
            setCart(cart.map(i =>
                i.product._id === productId
                    ? { ...i, quantity: newQuantity }
                    : i
            ));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product._id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerInfo({ name: '', phone: '', email: '' });
        setAmountPaid('');
    };

    const getSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
    };

    const getTax = () => {
        return 0; // No tax for now, can be configured
    };

    const getTotal = () => {
        return getSubtotal() + getTax();
    };

    const getChange = () => {
        const paid = parseFloat(amountPaid) || 0;
        return Math.max(0, paid - getTotal());
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setProcessing(true);
        try {
            const saleData = {
                items: cart.map(item => ({
                    product: item.product._id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.sellingPrice,
                    total: item.product.sellingPrice * item.quantity
                })),
                customer: {
                    name: customerInfo.name || 'Walk-in Customer',
                    phone: customerInfo.phone || '',
                    email: customerInfo.email || ''
                },
                paymentMethod,
                paymentStatus: 'paid',
                subtotal: getSubtotal(),
                tax: getTax(),
                total: getTotal(),
                amountPaid: parseFloat(amountPaid) || getTotal()
            };

            console.log('Sale data:', saleData);
            const response = await salesAPI.create(saleData);
            setLastInvoice(response.data.sale);
            setShowCheckout(false);
            setShowSuccess(true);
            clearCart();
            fetchProducts(); // Refresh stock

            // Auto-close success after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
                setLastInvoice(null);
            }, 5000);
        } catch (error) {
            console.error('Sale error:', error.response?.data || error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                'Error creating sale';
            alert(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchRef.current?.focus();
            } else if (e.key === 'F4' && cart.length > 0) {
                e.preventDefault();
                setShowCheckout(true);
            } else if (e.key === 'Escape') {
                setShowCheckout(false);
                setShowSuccess(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]);

    return (
        <div className="cashier-pos">
            {/* Left Panel - Products */}
            <div className="pos-products-panel">
                <div className="pos-header">
                    <div className="pos-title">
                        <ShoppingCart size={28} />
                        <div>
                            <h1>Point of Sale</h1>
                            <p>Welcome, {user?.name}</p>
                        </div>
                    </div>
                    <div className="pos-shortcuts">
                        <span>F2: Search</span>
                        <span>F4: Checkout</span>
                    </div>
                </div>

                <div className="pos-search-bar">
                    <Search size={20} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search products by name, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="pos-categories">
                    <button
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="pos-loading">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : (
                    <div className="pos-products-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                className={`pos-product-card ${product.stock < 5 ? 'low-stock' : ''}`}
                                onClick={() => addToCart(product)}
                            >
                                <div className="product-icon">
                                    <Package size={24} />
                                </div>
                                <div className="product-details">
                                    <h4>{product.name}</h4>
                                    <p className="product-category">{product.category}</p>
                                    <div className="product-meta">
                                        <span className="product-price">PKR {product.sellingPrice.toLocaleString()}</span>
                                        <span className={`product-stock ${product.stock < 5 ? 'warning' : ''}`}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                </div>
                                <div className="add-indicator">
                                    <Plus size={20} />
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="no-products">
                                <Package size={48} />
                                <p>No products found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Panel - Cart */}
            <div className="pos-cart-panel">
                <div className="cart-header">
                    <h2><ShoppingCart size={24} /> Current Sale</h2>
                    {cart.length > 0 && (
                        <button className="clear-cart-btn" onClick={clearCart}>
                            <Trash2 size={18} />
                            Clear
                        </button>
                    )}
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={48} />
                            <p>Cart is empty</p>
                            <span>Click on products to add them</span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product._id} className="cart-item">
                                <div className="item-info">
                                    <h4>{item.product.name}</h4>
                                    <p>PKR {item.product.sellingPrice.toLocaleString()} each</p>
                                </div>
                                <div className="item-quantity">
                                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="item-total">
                                    PKR {(item.product.sellingPrice * item.quantity).toLocaleString()}
                                </div>
                                <button className="remove-item" onClick={() => removeFromCart(item.product._id)}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-summary">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>PKR {getSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax</span>
                        <span>PKR {getTax().toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>PKR {getTotal().toLocaleString()}</span>
                    </div>
                </div>

                <button
                    className="checkout-btn"
                    disabled={cart.length === 0}
                    onClick={() => setShowCheckout(true)}
                >
                    <CreditCard size={24} />
                    Proceed to Checkout (F4)
                </button>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="pos-modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="pos-modal checkout-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Receipt size={24} /> Checkout</h2>
                            <button className="close-modal" onClick={() => setShowCheckout(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="checkout-content">
                            <div className="checkout-section">
                                <h3><User size={20} /> Customer Info (Optional)</h3>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Customer Name"
                                        value={customerInfo.name}
                                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={customerInfo.phone}
                                        onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="checkout-section">
                                <h3><CreditCard size={20} /> Payment Method</h3>
                                <div className="payment-methods">
                                    <button
                                        className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <Banknote size={24} />
                                        Cash
                                    </button>
                                    <button
                                        className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <CreditCard size={24} />
                                        Card
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="checkout-section">
                                    <h3><Calculator size={20} /> Cash Payment</h3>
                                    <div className="cash-input">
                                        <label>Amount Received</label>
                                        <input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amountPaid}
                                            onChange={e => setAmountPaid(e.target.value)}
                                        />
                                    </div>
                                    {parseFloat(amountPaid) >= getTotal() && (
                                        <div className="change-display">
                                            <span>Change:</span>
                                            <span className="change-amount">PKR {getChange().toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="checkout-total">
                                <div className="total-row">
                                    <span>Items:</span>
                                    <span>{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
                                </div>
                                <div className="total-row grand">
                                    <span>Total Amount:</span>
                                    <span>PKR {getTotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <button className="cancel-btn" onClick={() => setShowCheckout(false)}>
                                Cancel
                            </button>
                            <button
                                className="confirm-btn"
                                onClick={handleCheckout}
                                disabled={processing || (paymentMethod === 'cash' && parseFloat(amountPaid) < getTotal())}
                            >
                                {processing ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Complete Sale
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="pos-modal-overlay success-overlay">
                    <div className="pos-modal success-modal">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h2>Sale Complete!</h2>
                        {lastInvoice && (
                            <div className="invoice-info">
                                <p>Invoice: <strong>{lastInvoice.invoiceNumber}</strong></p>
                                <p>Amount: <strong>PKR {lastInvoice.total?.toLocaleString()}</strong></p>
                            </div>
                        )}
                        <button className="new-sale-btn" onClick={() => setShowSuccess(false)}>
                            Start New Sale
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CashierPOS;
