
export enum VideoQuality {
  HD_1080p = '1080p',
  TwoK = '2K',
  FourK = '4K',
}

export enum AspectRatio {
  NineToSixteen = '9:16',
  SixteenToNine = '16:9',
}

export enum GenerationStatus {
  Idle = 'idle',
  Generating = 'generating',
  Success = 'success',
  Error = 'error',
}

export type MimeType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/heic' | 'image/heif';

export interface GenerationParams {
  prompt: string;
  image: {
    base64: string;
    mimeType: MimeType;
  };
  quality: VideoQuality;
  aspectRatio: AspectRatio;
}
