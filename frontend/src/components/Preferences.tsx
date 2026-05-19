import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Database, Zap, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, Server, ToggleLeft, ToggleRight } from 'lucide-react';
import { getSettings, updateSettings, clearCache, clearUserCache, getHealth } from '../hooks/api';
import { ApiSettings } from '../types';
import './Preferences.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

interface Toast { id: number; msg: string; type: 'success' | 'error'; }
let toastId = 0;

export default function Preferences() {
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [health, setHealth] = useState<{ status: string; uptime: number; cacheSize: number } | null>(null);
  const [ttlInput, setTtlInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [clearing, setClearing] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([getSettings(), getHealth()]);
      setSettings(s);
      setHealth(h);
      setTtlInput(String(s.cache.ttl));
    } catch {
      addToast('Backend unreachable — is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleCache() {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSettings({ enabled: !settings.cache.enabled });
      setSettings(prev => prev ? { ...prev, cache: { ...prev.cache, enabled: !prev.cache.enabled } } : prev);
      addToast(`Cache ${!settings.cache.enabled ? 'enabled' : 'disabled'}`);
    } catch { addToast('Failed to update settings', 'error'); }
    finally { setSaving(false); }
  }

  async function saveTtl() {
    const val = parseInt(ttlInput);
    if (isNaN(val) || val < 1) { addToast('TTL must be a positive number', 'error'); return; }
    setSaving(true);
    try {
      await updateSettings({ ttl: val });
      setSettings(prev => prev ? { ...prev, cache: { ...prev.cache, ttl: val } } : prev);
      addToast(`Cache TTL set to ${val}s`);
    } catch { addToast('Failed to save TTL', 'error'); }
    finally { setSaving(false); }
  }

  async function handleClearAll() {
    setClearing(true);
    try {
      const res = await clearCache();
      setSettings(prev => prev ? { ...prev, cacheSize: 0, cachedUsernames: [] } : prev);
      addToast(`Cleared ${res.cleared} cached entries`);
    } catch { addToast('Failed to clear cache', 'error'); }
    finally { setClearing(false); }
  }

  async function handleDeleteUser(username: string) {
    setDeletingUser(username);
    try {
      await clearUserCache(username);
      setSettings(prev => prev ? {
        ...prev,
        cacheSize: Math.max(0, prev.cacheSize - 1),
        cachedUsernames: prev.cachedUsernames.filter(u => u !== username),
      } : prev);
      addToast(`Removed @${username} from cache`);
    } catch { addToast('Failed to remove user', 'error'); }
    finally { setDeletingUser(null); }
  }

  function formatUptime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }

  return (
    <motion.div className="prefs-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Toasts */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {t.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="prefs-inner">
        {/* Header */}
        <motion.div className="prefs-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="prefs-icon"><Settings size={20} /></div>
          <div>
            <h1 className="prefs-title">API Preferences</h1>
            <p className="prefs-sub">Configure caching, TTL and manage cached data</p>
          </div>
          <button className="refresh-btn" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </motion.div>

        {loading ? (
          <div className="prefs-loading">
            <RefreshCw size={32} className="spin" />
            <p>Connecting to backend…</p>
          </div>
        ) : (
          <div className="prefs-grid">
            {/* Server health */}
            <motion.div className="pref-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="pref-card-header">
                <Server size={18} />
                <h2>Server Status</h2>
                <div className={`status-dot ${health?.status === 'ok' ? 'online' : 'offline'}`} />
              </div>
              <div className="health-stats">
                <div className="health-stat">
                  <span className="health-val">{health?.status === 'ok' ? 'Online' : 'Offline'}</span>
                  <span className="health-lbl">Status</span>
                </div>
                <div className="health-stat">
                  <span className="health-val">{health ? formatUptime(health.uptime) : '—'}</span>
                  <span className="health-lbl">Uptime</span>
                </div>
                <div className="health-stat">
                  <span className="health-val">{health?.cacheSize ?? 0}</span>
                  <span className="health-lbl">Cached</span>
                </div>
              </div>
              <div className="api-url-display">
                <Zap size={12} />
                <code>http://localhost:3001</code>
              </div>
            </motion.div>

            {/* Cache toggle */}
            <motion.div className="pref-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="pref-card-header">
                <Database size={18} />
                <h2>Cache Control</h2>
              </div>
              <div className="toggle-row">
                <div>
                  <p className="toggle-label">Enable response caching</p>
                  <p className="toggle-desc">Cache API responses to reduce latency and rate limiting</p>
                </div>
                <button
                  className={`toggle-btn ${settings?.cache.enabled ? 'on' : 'off'}`}
                  onClick={toggleCache}
                  disabled={saving}
                >
                  {settings?.cache.enabled
                    ? <ToggleRight size={36} />
                    : <ToggleLeft size={36} />}
                </button>
              </div>
            </motion.div>

            {/* TTL */}
            <motion.div className="pref-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="pref-card-header">
                <Clock size={18} />
                <h2>Cache TTL</h2>
              </div>
              <p className="pref-desc">How long (in seconds) to keep a cached profile before re-fetching</p>
              <div className="ttl-row">
                <div className="ttl-input-wrap">
                  <input
                    type="number"
                    className="ttl-input"
                    value={ttlInput}
                    onChange={(e) => setTtlInput(e.target.value)}
                    min={1}
                    placeholder="300"
                  />
                  <span className="ttl-unit">seconds</span>
                </div>
                <button className="save-btn" onClick={saveTtl} disabled={saving}>
                  {saving ? <RefreshCw size={14} className="spin" /> : 'Save'}
                </button>
              </div>
              <div className="ttl-presets">
                {[30, 60, 300, 600, 3600].map(v => (
                  <button key={v} className={`preset-chip ${parseInt(ttlInput) === v ? 'active' : ''}`} onClick={() => setTtlInput(String(v))}>
                    {v >= 3600 ? `${v/3600}h` : v >= 60 ? `${v/60}m` : `${v}s`}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Cached users */}
            <motion.div className="pref-card span-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="pref-card-header">
                <Database size={18} />
                <h2>Cached Profiles ({settings?.cacheSize ?? 0})</h2>
                {(settings?.cacheSize ?? 0) > 0 && (
                  <button className="clear-all-btn" onClick={handleClearAll} disabled={clearing}>
                    <Trash2 size={14} />
                    {clearing ? 'Clearing…' : 'Clear all'}
                  </button>
                )}
              </div>

              {settings?.cachedUsernames.length === 0 ? (
                <p className="empty-cache">No profiles cached yet. Search for a username to populate the cache.</p>
              ) : (
                <div className="cached-list">
                  <AnimatePresence>
                    {settings?.cachedUsernames.map(u => (
                      <motion.div
                        key={u}
                        className="cached-item"
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="cached-user">
                          <div className="cached-avatar">@</div>
                          <span>@{u}</span>
                        </div>
                        <button
                          className="del-btn"
                          onClick={() => handleDeleteUser(u)}
                          disabled={deletingUser === u}
                        >
                          {deletingUser === u ? <RefreshCw size={13} className="spin" /> : <Trash2 size={13} />}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Raw API config */}
            <motion.div className="pref-card span-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="pref-card-header">
                <Zap size={18} />
                <h2>API Configuration</h2>
              </div>
              <div className="api-config-grid">
                <div className="api-config-item">
                  <span className="api-config-label">Upstream API</span>
                  <code className="api-config-val">snapchatapi.asapiservices.workers.dev</code>
                </div>
                <div className="api-config-item">
                  <span className="api-config-label">Endpoint</span>
                  <code className="api-config-val">/snap?username=&#123;username&#125;</code>
                </div>
                <div className="api-config-item">
                  <span className="api-config-label">Backend port</span>
                  <code className="api-config-val">3001</code>
                </div>
                <div className="api-config-item">
                  <span className="api-config-label">Cache type</span>
                  <code className="api-config-val">In-memory (Node.js Map)</code>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
