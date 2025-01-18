export enum PredictionStatus {
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  STARTING = 'starting',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export interface Page {
  id: string;
  title: string;
  isPublished: boolean;
  nodes: Node[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Node {
  id: string;
  title: string;
  description: string;
  pageId: string;
  prompt?: string;
  time?: number;
  generatedImages?: string[];
  narration?: string;
  predictionId?: string;
  predictionStatus?: PredictionStatus;
  createdAt?: string;
  updatedAt?: string;
}