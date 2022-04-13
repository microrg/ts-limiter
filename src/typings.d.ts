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
}
