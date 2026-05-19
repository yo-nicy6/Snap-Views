import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ghost, Loader2, X, Clock, ChevronRight } from 'lucide-react';
import { fetchSnap } from '../hooks/api';
import { SnapData } from '../types';
import ProfileCard from './ProfileCard';
import './SearchPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const RECENT_KEY = 'snapviewer_recent';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}
function saveRecent(username: string) {
  const prev = getRecent().filter(u => u !== username);
  localStorage.setItem(RECENT_KEY, JSON.stringify([username, ...prev].slice(0, 8)));
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ data: SnapData; cached: boolean; age: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>(getRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  async function doSearch(username: string) {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetchSnap(username.trim());
      setResult(res);
      saveRecent(username.trim());
      setRecent(getRecent());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  function clearSearch() {
    setQuery('');
    setResult(null);
    setError('');
    inputRef.current?.focus();
  }

  return (
    <motion.div className="search-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Top bar */}
      <div className="search-top">
        <div className="search-top-inner">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="search-heading">Search</h1>
            <p className="search-sub">Enter a Snapchat username to explore their profile</p>
          </motion.div>

          {/* Search form */}
          <motion.form
            className="search-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Username (e.g. ansh_trio)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button type="button" className="search-clear" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
              {loading ? <Loader2 size={18} className="spin" /> : <><span>Search</span><ChevronRight size={16} /></>}
            </button>
          </motion.form>

          {/* Recent */}
          {recent.length > 0 && !result && !loading && (
            <motion.div
              className="recent-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="recent-label"><Clock size={12} /> Recent</div>
              <div className="recent-chips">
                {recent.map((u) => (
                  <button key={u} className="recent-chip" onClick={() => { setQuery(u); doSearch(u); }}>
                    @{u}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="search-results">
        <div className="search-results-inner">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                className="search-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="loading-ghost">
                  <Ghost size={48} />
                </div>
                <p>Fetching profile…</p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                className="search-error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Ghost size={36} />
                <p>{error}</p>
                <button className="btn-primary-sm" onClick={() => doSearch(query)}>Retry</button>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProfileCard snapData={result.data} cached={result.cached} age={result.age} />
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div
                key="empty"
                className="search-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-ghost">
                  <Ghost size={64} strokeWidth={1.5} />
                </div>
                <p>Search for a Snapchat username above</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
