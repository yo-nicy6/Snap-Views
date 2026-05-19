import { motion } from 'framer-motion';
import { MapPin, Users, ExternalLink, Clock, Image, Film } from 'lucide-react';
import { SnapData } from '../types';
import './ProfileCard.css';

function formatTimestamp(ms: string): string {
  try {
    return new Date(Number(ms)).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return '—'; }
}

function StatBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="stat-badge">
      <Icon size={14} className="stat-icon" />
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}

interface Props {
  snapData: SnapData;
  cached?: boolean;
  age?: number;
}

export default function ProfileCard({ snapData, cached, age }: Props) {
  const { profile, curatedHighlights, spotlightMetadata, spotlightHighlights } = snapData.data;

  const totalBoosts = spotlightMetadata?.reduce((acc, m) => acc + parseInt(m.engagementStats.boostCount || '0'), 0) ?? 0;
  const totalSnaps = spotlightHighlights?.length ?? 0;
  const highlights = curatedHighlights?.length ?? 0;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      className="profile-card"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Cache tag */}
      {cached !== undefined && (
        <motion.div className={`cache-tag ${cached ? 'cached' : 'fresh'}`} variants={item}>
          <Clock size={11} />
          {cached ? `Cached · ${age}s ago` : 'Fresh fetch'}
        </motion.div>
      )}

      {/* Header */}
      <motion.div className="profile-header" variants={item}>
        <div className="avatar-wrap">
          <img
            src={profile.profilePictureUrl}
            alt={profile.title}
            className="avatar-img"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x120/1a1a1a/fffc00?text=👻'; }}
          />
          <div className="avatar-ring" />
        </div>

        <div className="profile-meta">
          <h2 className="profile-name">{profile.title || profile.username}</h2>
          <p className="profile-handle">@{profile.username}</p>
          {profile.address && (
            <div className="profile-location">
              <MapPin size={13} />
              <span>{profile.address}</span>
            </div>
          )}
        </div>

        <a
          href={`https://www.snapchat.com/@${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sc-link-btn"
        >
          <span>Open Snapchat</span>
          <ExternalLink size={14} />
        </a>
      </motion.div>

      {/* Bio */}
      {profile.bio && (
        <motion.div className="profile-bio" variants={item}>
          <p>{profile.bio}</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div className="stats-row" variants={item}>
        <StatBadge icon={Users} label="Subscribers" value={profile.subscriberCount === '0' ? '—' : profile.subscriberCount} />
        <StatBadge icon={Film} label="Spotlight" value={totalSnaps} />
        <StatBadge icon={Image} label="Highlights" value={highlights} />
        <StatBadge icon={ExternalLink} label="Boosts" value={totalBoosts} />
      </motion.div>

      {/* Highlights grid */}
      {curatedHighlights && curatedHighlights.length > 0 && (
        <motion.div className="section" variants={item}>
          <h3 className="section-title">Highlights</h3>
          <div className="highlights-grid">
            {curatedHighlights.map((h, i) => (
              <motion.div
                key={i}
                className="highlight-thumb"
                whileHover={{ scale: 1.04, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <img
                  src={h.thumbnailUrl}
                  alt={h.storyTitle?.value || `Highlight ${i + 1}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x180/1a1a1a/fffc00?text=👻'; }}
                />
                <div className="highlight-overlay">
                  <span>{h.snapList?.length ?? 0} snaps</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Spotlight grid */}
      {spotlightMetadata && spotlightMetadata.length > 0 && (
        <motion.div className="section" variants={item}>
          <h3 className="section-title">Spotlight</h3>
          <div className="spotlight-grid">
            {spotlightMetadata.slice(0, 12).map((meta, i) => {
              const boosts = parseInt(meta.engagementStats.boostCount || '0');
              const dur = Math.round(parseInt(meta.videoMetadata.durationMs || '0') / 1000);
              const hasCaption = meta.videoMetadata.embeddedTextCaption;
              return (
                <motion.div
                  key={i}
                  className="spotlight-card"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <img
                    src={meta.videoMetadata.thumbnailUrl}
                    alt={meta.videoMetadata.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x280/1a1a1a/fffc00?text=🎬'; }}
                  />
                  <div className="spotlight-overlay">
                    {hasCaption && <p className="spotlight-caption">{hasCaption}</p>}
                    <div className="spotlight-meta-row">
                      {boosts > 0 && <span className="boost-tag">⚡ {boosts}</span>}
                      {dur > 0 && <span className="dur-tag">{dur}s</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div className="profile-footer" variants={item}>
        <span>Joined {formatTimestamp(profile.creationTimestampMs)}</span>
        <span>·</span>
        <span>Updated {formatTimestamp(profile.lastUpdateTimestampMs)}</span>
      </motion.div>
    </motion.div>
  );
}
