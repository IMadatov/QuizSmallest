/**
 * Edit this file to change result messages and GIF/video paths.
 * Rules:
 * - List tiers from HIGHEST minPercent to lowest.
 * - First tier where score % >= minPercent wins.
 * - media: path under public/ (e.g. gifs/90percent.webm)
 */
export interface ResultTierConfig {
  minPercent: number;
  message: string;
  media: string;
}

export const RESULT_TIERS: ResultTierConfig[] = [
  {
    minPercent: 100,
    message: 'Perfect score! You are ready for the exam.',
    media: 'gifs/100percent.webm'
  },
  {
    minPercent: 95,
    message: 'Outstanding! Almost flawless.',
    media: 'gifs/95percent.webp'
  },
  {
    minPercent: 90,
    message: 'Excellent! You are ready for the exam.',
    media: 'gifs/90percent.webm'
  },
  {
    minPercent: 70,
    message: 'Good work! Review the weak areas.',
    media: 'gifs/nice.webp'
  },
  {
    minPercent: 60,
    message: 'Nice effort! Keep reviewing.',
    media: 'gifs/70percent.webm'
  },
  {
    minPercent: 0,
    message: 'More practice needed. Try again!',
    media: 'gifs/less60percent.webm'
  }
];
