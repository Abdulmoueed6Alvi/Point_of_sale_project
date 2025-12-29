import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { categoryAPI } from '../services/api';
import { Plus, Edit, Trash2, Tag, Check, X } from 'lucide-react';
import './Categories.css';

const Categories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: ''
    });
    const [error, setError] = useState('');

    const canDelete = user?.role === 'admin';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAllIncludingInactive();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (currentCategory) {
                await categoryAPI.update(currentCategory._id, formData);
            } else {
                await categoryAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            displayName: category.displayName,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY DELETE this category? This action cannot be undone. Use "Deactivate" if you want to keep the category but hide it.')) {
            try {
                await categoryAPI.delete(id);
                fetchCategories();
            } catch (error) {
                alert('Error deleting category');
            }
        }
    };

    const toggleActive = async (category) => {
        try {
            await categoryAPI.update(category._id, { isActive: !category.isActive });
            fetchCategories();
        } catch (error) {
            alert('Error updating category');
        }
    };

    const resetForm = () => {
        setCurrentCategory(null);
        setFormData({
            name: '',
            displayName: '',
            description: ''
        });
        setError('');
    };

    if (loading) return <div className="loading">Loading categories...</div>;

    return (
        <div className="categories-page">
            <div className="page-header">
                <h1 className="page-title">
                    <Tag size={28} />
                    Categories
                </h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="categories-grid">
                {categories.map(category => (
                    <div key={category._id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
                        <div className="category-header">
                            <div className="category-icon">
                                <Tag size={24} />
                            </div>
                            <div className="category-info">
                                <h3>{category.displayName}</h3>
                                <span className="category-slug">{category.name}</span>
                            </div>
                            <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {category.description && (
                            <p className="category-description">{category.description}</p>
                        )}

                        <div className="category-actions">
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => toggleActive(category)}
                                title={category.isActive ? 'Deactivate' : 'Activate'}
                            >
                                {category.isActive ? <X size={16} /> : <Check size={16} />}
                                {category.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(category)}>
                                <Edit size={16} /> Edit
                            </button>
                            {canDelete && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(category._id)}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="no-categories">
                        <Tag size={48} />
                        <p>No categories found. Add your first category!</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Category Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{currentCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="input-group">
                                <label>Category Name (ID)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., tiles, cement, pipes"
                                    required
                                    disabled={currentCategory}
                                />
                                <small>This will be used as the unique identifier (lowercase, no spaces)</small>
                            </div>

                            <div className="input-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    placeholder="e.g., Tiles, Cement, PVC Pipes"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category"
                                    rows={3}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {currentCategory ? 'Update Category' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
