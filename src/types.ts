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
  generatedImages?: string[];
  predictionId?: string;
  predictionStatus?: PredictionStatus;
}