import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart, FileText,
    BarChart3, Settings, LogOut, Menu, X, Users, PlusCircle, Boxes, Tag
} from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Define navigation items with role-based access
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
        { path: '/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
        { path: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager'] },
        { path: '/categories', label: 'Categories', icon: Tag, roles: ['admin', 'manager'] },
        { path: '/sales', label: 'Sales History', icon: FileText, roles: ['admin', 'manager', 'cashier'] },
        { path: '/invoices', label: 'Invoices', icon: FileText, roles: ['admin', 'manager', 'cashier'] },
        { path: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'manager'] },
        { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
        { path: '/employees', label: 'Employees', icon: Users, roles: ['admin'] },
        { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager'] },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        return item.roles.includes(user?.role);
    });

    // Get role display info
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#ef4444';
            case 'manager': return '#10b981';
            case 'cashier': return '#f59e0b';
            default: return '#64748b';
        }
    };

    return (
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>POS Sanitary Store</h2>
                    <span className="role-indicator" style={{ background: getRoleColor(user?.role) }}>
                        {user?.role}
                    </span>
                </div>
                <nav className="sidebar-nav">
                    {filteredNavItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            end={path === '/'}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="main-content">
                <header className="header">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role" style={{ color: getRoleColor(user?.role) }}>{user?.role}</span>
                        </div>
                        <button className="btn btn-outline" onClick={logout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
