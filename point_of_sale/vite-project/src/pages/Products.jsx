import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, categoryAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', purchasePrice: '',
        sellingPrice: '', stock: '', unit: 'piece', minStockLevel: 10,
        description: '', supplier: { name: '', contact: '', email: '' }
    });

    // Role-based permissions
    const canAddProduct = user?.role === 'admin' || user?.role === 'manager';
    const canEditProduct = user?.role === 'admin' || user?.role === 'manager';
    const canDeleteProduct = user?.role === 'admin';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, category]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data.categories);
            // Set default category for new products
            if (response.data.categories.length > 0) {
                setFormData(prev => ({ ...prev, category: response.data.categories[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll({ search: searchTerm, category });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await productAPI.update(currentProduct._id, formData);
            } else {
                await productAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving product');
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData(product);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                fetchProducts();
            } catch (error) {
                alert('Error deleting product');
            }
        }
    };

    const resetForm = () => {
        setCurrentProduct(null);
        setFormData({
            name: '', sku: '', category: categories.length > 0 ? categories[0].name : '', purchasePrice: '',
            sellingPrice: '', stock: '', unit: 'piece', minStockLevel: 10,
            description: '', supplier: { name: '', contact: '', email: '' }
        });
    };

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title">Products</h1>
                {canAddProduct && (
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={18} /> Add Product
                    </button>
                )}
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.displayName}</option>
                        ))}
                    </select>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Unit</th>
                                <th>Purchase Price</th>
                                <th>Selling Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.sku}</td>
                                    <td>{product.name}</td>
                                    <td><span className="badge badge-info">{product.category}</span></td>
                                    <td>{product.stock}</td>
                                    <td>{product.unit}</td>
                                    <td>PKR {product.purchasePrice}</td>
                                    <td>PKR {product.sellingPrice}</td>
                                    <td>
                                        <span className={`badge ${product.stock === 0 ? 'badge-danger' : product.stock <= product.minStockLevel ? 'badge-warning' : 'badge-success'}`}>
                                            {product.stock === 0 ? 'Out of Stock' : product.stock <= product.minStockLevel ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        {canEditProduct && (
                                            <button className="btn btn-outline" style={{ marginRight: '0.5rem', padding: '0.5rem' }} onClick={() => handleEdit(product)}>
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {canDeleteProduct && (
                                            <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(product._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-2">
                                <div className="input-group">
                                    <label>Product Name *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>SKU *</label>
                                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Category *</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Unit *</label>
                                    <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required>
                                        <option value="piece">Piece</option>
                                        <option value="box">Box</option>
                                        <option value="bag">Bag</option>
                                        <option value="sq_ft">Sq Ft</option>
                                        <option value="sq_meter">Sq Meter</option>
                                        <option value="kg">KG</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Purchase Price *</label>
                                    <input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Selling Price *</label>
                                    <input type="number" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Initial Stock *</label>
                                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required disabled={currentProduct} />
                                </div>
                                <div className="input-group">
                                    <label>Min Stock Level</label>
                                    <input type="number" value={formData.minStockLevel} onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3"></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
