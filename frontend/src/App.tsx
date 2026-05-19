import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Search, Settings, Ghost } from 'lucide-react';
import Home from './components/Home';
import SearchPage from './components/SearchPage';
import Preferences from './components/Preferences';
import './App.css';

function Nav() {
  const location = useLocation();

  const links = [
    { to: '/', icon: HomeIcon, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/preferences', icon: Settings, label: 'API' },
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        {/* Logo */}
        <NavLink to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Ghost size={18} strokeWidth={2.5} />
          </div>
          <span className="nav-logo-text">Snap<span>View</span></span>
        </NavLink>

        {/* Links */}
        <div className="nav-links">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={2} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      className="nav-link-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/preferences" element={<Preferences />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="noise-overlay" />
        <Nav />
        <main className="app-main">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
