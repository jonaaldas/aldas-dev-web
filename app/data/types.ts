export type SiteLink = {
  label: string;
  url: string;
};

export type AboutData = {
  name: string;
  role: string;
  summary: string;
  location: string;
  links: SiteLink[];
};

export type ProjectData = {
  title: string;
  description: string;
  paragraphs: string[];
  tech: string[];
  status: string;
  links: {
    website?: string;
    github?: string;
    video?: string;
  };
  date: string;
  order?: number;
};

export type SocialContentSource = 'YouTube' | 'TikTok' | 'Twitter' | 'Instagram' | 'LinkedIn' | 'Twitch';

export type SocialContentData = {
  title: string;
  url: string;
  source: SocialContentSource;
  thumbnail?: string;
  date: string;
  order?: number;
};

export type BucketListStatus = 'Planned' | 'In Progress' | 'Booked' | 'Done';

export type BucketListItem = {
  title: string;
  want: string;
  progress: string;
  status: BucketListStatus;
  order?: number;
};
