export interface FeatureMatrix {
  plans: Plans[];
}

interface Plans {
  plan_id: string;
  features: Features[];
}

interface Features {
  feature_id: string;
  type: string;
  value: number;
  enabled: boolean;
  soft: boolean;
  webhook: Webhook;
}

export interface FeatureUsage {
  user_id: string;
  plan_id: string | null;
  usage: Usage;
}

interface Usage {
  [key: string]: number;
}

interface Webhook {
  enabled: string;
  url: string;
  token: string;
  threshold: number;
  payload: any;
}

export interface Options {
  backend: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
  apiToken: string;
  backendUrl: string;
}

// S3 backend options
export interface S3BackendOptions {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}

// Default backend options
export interface DefaultBackendOptions {
  apiToken: string;
  backendUrl: string;
}

export interface Backend {
  bind(planId: string, userId: string): Promise<void>;
  featureMatrix(): Promise<FeatureMatrix | void>;
  usage(userId: string): Promise<FeatureUsage | void>;
  feature(featureId: string, userId: string): Promise<boolean>;
  increment(featureId: string, userId: string): Promise<void>;
  decrement(featureId: string, userId: string): Promise<void>;
  set(featureId: string, userId: string, value: number): Promise<void>;
}
