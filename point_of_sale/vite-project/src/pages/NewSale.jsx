import { useState, useEffect } from 'react';
import { productAPI, salesAPI } from '../services/api';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewSale = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [searchTerm]);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll({ search: searchTerm, isActive: true });
            setProducts(response.data.products.filter(p => p.stock > 0));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.product._id === product._id);
        if (existing) {
            updateQuantity(product._id, existing.quantity + 1);
        } else {
            setCart([...cart, { product, quantity: 1, discount: 0 }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p._id === productId);
        if (newQuantity > product.stock) {
            alert('Quantity exceeds available stock');
            return;
        }
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.product._id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product._id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) =>
            sum + (item.product.sellingPrice * item.quantity - item.discount), 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Please add items to cart');
            return;
        }
        if (!customer.name) {
            alert('Please enter customer name');
            return;
        }

        setLoading(true);
        try {
            const items = cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                discount: item.discount
            }));

            await salesAPI.create({
                items,
                customer,
                paymentMethod,
                tax: 0,
                discount: 0,
                amountPaid: calculateTotal()
            });

            alert('Sale completed successfully!');
            navigate('/sales');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="page-title">New Sale</h1>

            <div className="grid grid-2">
                <div className="card">
                    <h2>Select Products</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {products.map(product => (
                            <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <p style={{ fontWeight: 600 }}>{product.name}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        PKR {product.sellingPrice} • Stock: {product.stock}
                                    </p>
                                </div>
                                <button className="btn btn-primary" onClick={() => addToCart(product)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="card">
                        <h2>Cart ({cart.length} items)</h2>
                        {cart.map(item => (
                            <div key={item.product._id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{item.product.name}</strong>
                                    <button onClick={() => removeFromCart(item.product._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={() => updateQuantity(item.product._id, item.quantity - 1)} style={{ padding: '0.25rem 0.5rem' }}>
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button className="btn btn-outline" onClick={() => updateQuantity(item.product._id, item.quantity + 1)} style={{ padding: '0.25rem 0.5rem' }}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span>× PKR {item.product.sellingPrice}</span>
                                    <strong style={{ marginLeft: 'auto' }}>= PKR {(item.product.sellingPrice * item.quantity).toLocaleString()}</strong>
                                </div>
                            </div>
                        ))}

                        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                <span>Total:</span>
                                <span>PKR {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="card" style={{ marginTop: '1rem' }}>
                        <h2>Customer Details</h2>
                        <div className="input-group">
                            <label>Customer Name *</label>
                            <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Phone</label>
                            <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Payment Method *</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || cart.length === 0}>
                            <ShoppingCart size={18} />
                            {loading ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewSale;
