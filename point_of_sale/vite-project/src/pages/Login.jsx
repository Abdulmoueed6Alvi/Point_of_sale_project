import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ email, password });

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-branding">
                    <div className="brand-icon">
                        <Store size={60} />
                    </div>
                    <h1>POS Sanitary Store</h1>
                    <p>Complete Inventory & Sales Management System</p>
                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Manage Products & Inventory</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Track Sales & Invoices</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Real-time Analytics & Reports</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-dot"></span>
                            <span>Employee Management</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-container">
                    <div className="login-header">
                        <h2>Welcome Back!</h2>
                        <p>Sign in to continue to your dashboard</p>
                    </div>

                    {error && (
                        <div className="login-alert">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>Demo Credentials</span>
                    </div>

                    <div className="demo-credentials">
                        <div className="demo-item">
                            <strong>Admin:</strong> admin@pos.com / admin123
                        </div>
                    </div>

                    <div className="login-footer-text">
                        <p>© 2024 POS Sanitary Store. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
