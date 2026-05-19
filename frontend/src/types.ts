export interface SnapProfile {
  username: string;
  title: string;
  bio: string;
  profilePictureUrl: string;
  snapcodeImageUrl: string;
  subscriberCount: string;
  websiteUrl: string;
  address: string;
  badge: number;
  hasStory: boolean;
  hasCuratedHighlights: boolean;
  hasSpotlightHighlights: boolean;
  squareHeroImageUrl: string;
  creationTimestampMs: string;
  lastUpdateTimestampMs: string;
}

export interface SnapHighlight {
  storyType: number;
  storyId: string;
  storyTitle: { value: string };
  thumbnailUrl: string;
  snapList: SnapItem[];
}

export interface SnapItem {
  snapIndex: number;
  snapId: string;
  snapMediaType: number;
  mediaUrl: string;
  mediaPreviewUrl: string;
  timestampInSec: string;
}

export interface SpotlightHighlight {
  storyId: string;
  thumbnailUrl: string;
  snapList: SnapItem[];
}

export interface SpotlightMeta {
  videoMetadata: {
    name: string;
    thumbnailUrl: string;
    uploadDateMs: string;
    viewCount: string;
    contentUrl: string;
    durationMs: string;
    width: number;
    height: number;
    shareCount: string;
    embeddedTextCaption: string;
  };
  engagementStats: {
    viewCount: string;
    shareCount: string;
    commentCount: string;
    boostCount: string;
    recommendCount: string;
  };
  hashtags: string[];
  description: string;
}

export interface SnapData {
  status: string;
  data: {
    profile: SnapProfile;
    story: null;
    curatedHighlights: SnapHighlight[];
    spotlightHighlights: SpotlightHighlight[];
    spotlightMetadata: SpotlightMeta[];
    pageMetadata: {
      pageTitle: string;
      pageDescription: string;
    };
    pageLinks: {
      snapchatCanonicalUrl: string;
    };
  };
}

export interface ApiSettings {
  cache: {
    enabled: boolean;
    ttl: number;
  };
  cacheSize: number;
  cachedUsernames: string[];
}
