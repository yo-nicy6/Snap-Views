import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Ghost, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSnap } from '../hooks/api';
import { SnapData } from '../types';
import ProfileCard from './ProfileCard';
import './Home.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

export default function Home() {
  const [featured, setFeatured] = useState<SnapData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnap('ansh_trio')
      .then((res) => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div className="home-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* BG Video */}
      <div className="hero-bg">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/bg.mp4"
        />
        <div className="hero-gradient" />
        <div className="hero-grain" />
      </div>

      {/* Hero */}
      <section className="hero-section">
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Ghost size={14} strokeWidth={2.5} />
          <span>Snapchat Profile Viewer</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Explore any
          <br />
          <span className="hero-title-accent">Snap profile</span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          Search highlights, spotlight snaps and profile data — all in one place.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <button className="btn-primary" onClick={() => navigate('/search')}>
            <span>Search profiles</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={() => navigate('/preferences')}>
            <Zap size={14} />
            <span>API Settings</span>
          </button>
        </motion.div>

        {/* Floating ghost orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </section>

      {/* Featured profile */}
      <section className="featured-section">
        <div className="featured-inner">
          <motion.div
            className="featured-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="featured-tag">
              <span className="featured-dot" />
              Featured Profile
            </div>
          </motion.div>

          {loading ? (
            <div className="profile-skeleton">
              <div className="skel-header">
                <div className="skel skel-avatar" />
                <div className="skel-lines">
                  <div className="skel skel-line" style={{ width: '60%' }} />
                  <div className="skel skel-line" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="skel-stats">
                {[1,2,3,4].map(i => <div key={i} className="skel skel-stat" />)}
              </div>
              <div className="skel skel-grid">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skel skel-thumb" />)}
              </div>
            </div>
          ) : featured ? (
            <ProfileCard snapData={featured} />
          ) : (
            <div className="fetch-error">
              <Ghost size={40} />
              <p>Could not load featured profile. Make sure the backend is running.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
