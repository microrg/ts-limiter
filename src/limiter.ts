import { getObject, putPublicReadJsonObject } from './s3';
import { FeatureMatrix, FeatureUsage } from './typings';

export class Limiter {
  s3Bucket: string;
  projectId: string;

  constructor(bucket: string, projectId: string) {
    this.s3Bucket = bucket;
    this.projectId = projectId;
  }

  private async getFeatureMatrix(): Promise<FeatureMatrix | void> {
    try {
      return getObject(this.s3Bucket, `${this.projectId}/feature_matrix.json`);
    } catch (err) {
      // TODO: handle error
    }
  }

  private async getFeatureUsage(userId: string): Promise<FeatureUsage | void> {
    const key = `${this.projectId}/users/${userId}.json`;
    try {
      const resp = await getObject(this.s3Bucket, key);
      return JSON.parse(resp.Body.toString('utf-8'));
    } catch (err) {
      // TODO: check key not found
      const featureUsage = {
        user_id: userId,
        usage: {},
      };
      await putPublicReadJsonObject(this.s3Bucket, key, featureUsage);
      return featureUsage;
    }
  }

  public async feature(featureId: string, userId: string): Promise<boolean> {
    try {
      const featureMatrix = await this.getFeatureMatrix();
      if (!featureMatrix) {
        return false;
      }
      const featureUsage = await this.getFeatureUsage(userId);
      if (!featureUsage) {
        return false;
      }

      for (const plan of featureMatrix.plans) {
        for (const feature of plan.features) {
          if (feature.feature_id === featureId) {
            if (!feature.enabled) {
              // TODO: log
              return true;
            }
            if (feature.type === 'boolean' && feature.value === 1) {
              return true;
            }
            if (featureUsage.usage[featureId]) {
              return featureUsage.usage[featureId] <= feature.value;
            }
          }
        }
      }

      return true;
    } catch (err) {
      // TODO: handle error
      return false;
    }
  }

  public async increment(featureId: string, userId: string): Promise<void> {}

  public async set(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {}
}
