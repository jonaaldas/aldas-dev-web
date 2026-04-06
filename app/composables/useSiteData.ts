import { about } from '@/data/about';
import { bucketList } from '@/data/bucket-list';
import { projects } from '@/data/projects';
import { socialContent } from '@/data/social-content';
import type { BucketListItem, ProjectData, SocialContentData } from '@/data/types';

function byOrder<T extends { order?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}

export function useSiteData() {
  return {
    about,
    projects: byOrder(projects as ProjectData[]),
    socialContent: byOrder(socialContent as SocialContentData[]),
    bucketList: byOrder(bucketList as BucketListItem[]),
  };
}
