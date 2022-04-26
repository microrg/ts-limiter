import { FeatureMatrix, FeatureUsage, Backend, Options } from './typings';
import { DefaultBackend, S3Backend } from './backends';

enum BackendType {
  'Default' = 'Default',
  'S3' = 'S3',
}

export class Limiter {
  backend: Backend;

  constructor(projectId: string, opts: Options) {
    const {
      backend,
      accessKeyId,
      secretAccessKey,
      region,
      s3Bucket,
      apiToken,
      backendUrl,
    } = opts;
    if (backend === BackendType.Default) {
      this.backend = new DefaultBackend(projectId, {
        apiToken,
        backendUrl,
      });
    } else if (backend === BackendType.S3) {
      this.backend = new S3Backend(projectId, {
        accessKeyId,
        secretAccessKey,
        region,
        s3Bucket,
      });
    } else {
      throw new Error('UnsupportedBackend');
    }
  }

  public async bind(planId: string, userId: string): Promise<void> {
    return this.backend.bind(planId, userId);
  }

  public async feature(featureId: string, userId: string): Promise<boolean> {
    return this.backend.feature(featureId, userId);
  }

  public async increment(featureId: string, userId: string): Promise<void> {
    return this.backend.increment(featureId, userId);
  }

  public async decrement(featureId: string, userId: string): Promise<void> {
    return this.backend.decrement(featureId, userId);
  }

  public async set(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {
    this.backend.set(featureId, userId, value);
  }

  public async featureMatrix(): Promise<FeatureMatrix | void> {
    return this.backend.featureMatrix();
  }

  public async usage(userId: string): Promise<FeatureUsage | void> {
    return this.backend.usage(userId);
  }
}
