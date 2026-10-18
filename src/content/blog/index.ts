// To publish a new article: create a file next to this one (copy an existing one), then add
// it to BLOG_POSTS below. Newest first. Remember to add it to the content calendar.
import type { BlogPost } from './types';
import { khaddarVsLawnVsCotton } from './khaddar-vs-lawn-vs-cotton';
import { howToMeasureForASuit } from './how-to-measure-for-a-suit';
import { buyingUnstitchedSuitsOnline } from './buying-unstitched-suits-online-pakistan';

export const BLOG_POSTS: BlogPost[] = [
  khaddarVsLawnVsCotton,
  howToMeasureForASuit,
  buyingUnstitchedSuitsOnline,
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
