
import { VideoQuality, AspectRatio } from './types';

export const VIDEO_QUALITIES = [
  { label: '1080p HD', value: VideoQuality.HD_1080p },
  { label: '2K', value: VideoQuality.TwoK },
  { label: '4K', value: VideoQuality.FourK },
];

export const ASPECT_RATIOS = [
  { label: 'Portrait (9:16)', value: AspectRatio.NineToSixteen },
  { label: 'Landscape (16:9)', value: AspectRatio.SixteenToNine },
];

export const LOADING_MESSAGES = [
  'Warming up the AI video director...',
  'Storyboarding your concept...',
  'Setting up the virtual cameras...',
  'Rendering the first few frames...',
  'Applying cinematic color grading...',
  'Compositing visual effects...',
  'Syncing audio and visuals...',
  'Finalizing your masterpiece...',
];
