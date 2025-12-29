import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    X,
    Search,
    UserPlus,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Eye,
    EyeOff,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    RefreshCw,
    UserMinus
} from 'lucide-react';
import './Employees.css';

function Employees() {
    const { user: currentUser } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAll();
            setEmployees(response.data.users || []);
        } catch (err) {
            setError('Failed to fetch employees');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingEmployee) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await userAPI.update(editingEmployee._id, updateData);
                setSuccess('Employee updated successfully!');
            } else {
                await userAPI.create(formData);
                setSuccess('Employee added successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchEmployees();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            password: '',
            role: employee.role,
            phone: employee.phone || ''
        });
        setShowModal(true);
    };

    const handleDeactivate = async (employee) => {
        if (employee._id === currentUser?.id) {
            setError("You cannot deactivate your own account!");
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (window.confirm(`Are you sure you want to deactivate ${employee.name}? They won't be able to login.`)) {
            try {
                await userAPI.deactivate(employee._id);
                setSuccess('Employee deactivated successfully!');
                fetchEmployees();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to deactivate employee');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleDelete = async (employee) => {
        if (employee._id === currentUser?.id) {
            setError("You cannot delete your own account!");
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (window.confirm(`⚠️ PERMANENT DELETE: Are you sure you want to permanently delete ${employee.name}? This action cannot be undone!`)) {
            try {
                await userAPI.delete(employee._id);
                setSuccess('Employee permanently deleted!');
                fetchEmployees();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete employee');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'cashier',
            phone: ''
        });
        setEditingEmployee(null);
        setShowPassword(false);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <ShieldAlert size={16} />;
            case 'manager':
                return <ShieldCheck size={16} />;
            default:
                return <Shield size={16} />;
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin':
                return 'role-badge admin';
            case 'manager':
                return 'role-badge manager';
            default:
                return 'role-badge cashier';
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if current user is admin
    if (currentUser?.role !== 'admin') {
        return (
            <div className="employees-page">
                <div className="access-denied">
                    <ShieldAlert size={64} />
                    <h2>Access Denied</h2>
                    <p>Only administrators can manage employees.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employees-page">
            <div className="employees-header">
                <div className="header-left">
                    <Users size={32} />
                    <div>
                        <h1>Employee Management</h1>
                        <p>Manage staff accounts and permissions</p>
                    </div>
                </div>
                <button className="add-employee-btn" onClick={openAddModal}>
                    <UserPlus size={20} />
                    Add Employee
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <XCircle size={20} />
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <CheckCircle size={20} />
                    {success}
                </div>
            )}

            <div className="employees-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="refresh-btn" onClick={fetchEmployees} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                </button>
            </div>

            <div className="employees-stats">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{employees.length}</span>
                        <span className="stat-label">Total Employees</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon admin">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{employees.filter(e => e.role === 'admin').length}</span>
                        <span className="stat-label">Administrators</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon manager">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{employees.filter(e => e.role === 'manager').length}</span>
                        <span className="stat-label">Managers</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon cashier">
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{employees.filter(e => e.role === 'cashier').length}</span>
                        <span className="stat-label">Cashiers</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading employees...</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="empty-state">
                    <Users size={64} />
                    <h3>No Employees Found</h3>
                    <p>
                        {searchTerm
                            ? 'No employees match your search criteria.'
                            : 'Start by adding your first employee.'}
                    </p>
                    {!searchTerm && (
                        <button className="add-first-btn" onClick={openAddModal}>
                            <Plus size={20} />
                            Add First Employee
                        </button>
                    )}
                </div>
            ) : (
                <div className="employees-grid">
                    {filteredEmployees.map((employee) => (
                        <div key={employee._id} className={`employee-card ${!employee.isActive ? 'inactive' : ''}`}>
                            <div className="employee-avatar">
                                {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="employee-info">
                                <h3>{employee.name}</h3>
                                <div className="employee-email">
                                    <Mail size={14} />
                                    {employee.email}
                                </div>
                                {employee.phone && (
                                    <div className="employee-phone">
                                        <Phone size={14} />
                                        {employee.phone}
                                    </div>
                                )}
                            </div>
                            <div className={getRoleBadgeClass(employee.role)}>
                                {getRoleIcon(employee.role)}
                                {employee.role}
                            </div>
                            <div className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                                {employee.isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div className="employee-actions">
                                <button
                                    className="action-btn edit"
                                    onClick={() => handleEdit(employee)}
                                    title="Edit Employee"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {employee._id !== currentUser?.id && employee.isActive && (
                                    <button
                                        className="action-btn deactivate"
                                        onClick={() => handleDeactivate(employee)}
                                        title="Deactivate Employee"
                                    >
                                        <UserMinus size={16} />
                                    </button>
                                )}
                                {employee._id !== currentUser?.id && (
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(employee)}
                                        title="Permanently Delete Employee"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editingEmployee ? (
                                    <>
                                        <Edit2 size={24} />
                                        Edit Employee
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={24} />
                                        Add New Employee
                                    </>
                                )}
                            </h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="employee-form">
                            {error && (
                                <div className="form-error">
                                    <XCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Password {editingEmployee ? '(Leave blank to keep current)' : '*'}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingEmployee ? 'Enter new password' : 'Enter password'}
                                        required={!editingEmployee}
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div className="role-description">
                                {formData.role === 'admin' && (
                                    <p><ShieldAlert size={16} /> Full access to all features including employee management</p>
                                )}
                                {formData.role === 'manager' && (
                                    <p><ShieldCheck size={16} /> Can manage products, view reports, and process sales</p>
                                )}
                                {formData.role === 'cashier' && (
                                    <p><Shield size={16} /> Can process sales and view basic inventory</p>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            {editingEmployee ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingEmployee ? <Edit2 size={18} /> : <Plus size={18} />}
                                            {editingEmployee ? 'Update Employee' : 'Add Employee'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Employees;
