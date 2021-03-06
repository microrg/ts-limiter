import { log } from '../utils/log';
import { getObject, putJsonObject } from '../utils/s3';
import { shouldSendWebhook } from '../utils/webhook';
import {
  Backend,
  S3BackendOptions,
  FeatureMatrix,
  FeatureUsage,
} from '../typings';

export class S3Backend implements Backend {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
  projectId: string;

  constructor(projectId: string, opts: S3BackendOptions) {
    const { accessKeyId, secretAccessKey, region, s3Bucket } = opts;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.s3Bucket = s3Bucket;
    this.projectId = projectId;
  }

  private async getFeatureMatrix(): Promise<FeatureMatrix | void> {
    try {
      const resp = await getObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        `${this.projectId}/feature_matrix.json`
      );
      let s3ResponseBody = '';
      for await (const chunk of resp.Body) {
        s3ResponseBody += chunk;
      }
      return JSON.parse(s3ResponseBody);
    } catch (err: any) {
      log.error(err);
      switch (err.Code) {
        case 'NoSuchBucket':
          log.error('Bucket does not exist');
          break;
        case 'NoSuchKey':
          log.error('Feature matrix does not exist');
          break;
        default:
          log.error('Unknown error');
      }
    }
  }

  private async getFeatureUsage(userId: string): Promise<FeatureUsage | void> {
    const key = `${this.projectId}/users/${userId}.json`;
    try {
      const resp = await getObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        key
      );
      let s3ResponseBody = '';
      for await (const chunk of resp.Body) {
        s3ResponseBody += chunk;
      }
      return JSON.parse(s3ResponseBody);
    } catch (err: any) {
      log.error(err);
      if (err.Code === 'NoSuchKey') {
        log.info(`Creating feature usage json for user ${userId}`);
        const featureUsage = {
          user_id: userId,
          plan_id: null,
          usage: {},
        };
        try {
          await putJsonObject(
            this.accessKeyId,
            this.secretAccessKey,
            this.region,
            this.s3Bucket,
            key,
            featureUsage
          );
        } catch (err) {
          log.error(err);
          log.error('Failed to create feature usage');
        }
        return featureUsage;
      }
    }
  }

  public async bind(planId: string, userId: string): Promise<void> {
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      throw new Error('FeatureUsageNotFound');
    }

    log.info(`Plan ${planId}, User ${userId}: Binding user to plan`);
    featureUsage.plan_id = planId;

    try {
      await putJsonObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        `${this.projectId}/users/${userId}.json`,
        featureUsage
      );
    } catch (err) {
      log.error(err);
      log.error('Failed to update feature usage');
      throw err;
    }
  }

  public async feature(featureId: string, userId: string): Promise<boolean> {
    const featureMatrix = await this.getFeatureMatrix();
    if (!featureMatrix) {
      log.error('Failed to fetch feature matrix');
      return false;
    }
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      return false;
    }

    for (let plan of featureMatrix.plans) {
      if (plan.plan_id === featureUsage.plan_id) {
        for (let feature of plan.features) {
          if (feature.feature_id === featureId) {
            if (!feature.enabled) {
              log.info(`Feature ${featureId} disabled, allow.`);
              return true;
            }
            if (feature.type === 'Boolean' && feature.value === 1) {
              return true;
            }
            if (feature.type === 'Boolean' && feature.value === 0) {
              return false;
            }
            if (feature.soft) {
              log.info(`Feature ${featureId} is soft, allow.`);
              return true;
            }
            if (featureUsage.usage[featureId]) {
              return featureUsage.usage[featureId] < feature.value;
            }
            // Feature in plan but undefined on user
            return true;
          }
        }
      }
    }

    log.info(
      `Feature ${featureId} not found in ${featureUsage.plan_id} plan, deny.`
    );
    return false;
  }

  public async increment(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {
    const featureMatrix = await this.getFeatureMatrix();
    if (!featureMatrix) {
      log.error('Failed to fetch feature matrix');
      throw new Error('FeatureMatrixNotFound');
    }
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      throw new Error('FeatureUsageNotFound');
    }

    log.info(
      `Feature ${featureId}, User ${userId}: Incrementing usage by ${value}`
    );
    if (featureUsage.usage[featureId]) {
      featureUsage.usage[featureId] += value;
    } else {
      featureUsage.usage[featureId] = value;
    }

    try {
      await putJsonObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        `${this.projectId}/users/${userId}.json`,
        featureUsage
      );
    } catch (err) {
      log.error(err);
      log.error('Failed to update feature usage');
      throw err;
    }

    await shouldSendWebhook(featureMatrix, featureUsage, featureId, userId);
  }

  public async decrement(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      throw new Error('FeatureUsageNotFound');
    }

    if (featureUsage.usage[featureId] > 0) {
      log.info(
        `Feature ${featureId}, User ${userId}: Decrementing usage by ${value}`
      );
      featureUsage.usage[featureId] -= value;
    }

    try {
      await putJsonObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        `${this.projectId}/users/${userId}.json`,
        featureUsage
      );
    } catch (err) {
      log.error(err);
      log.error('Failed to update feature usage');
      throw err;
    }
  }

  public async set(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {
    const featureMatrix = await this.getFeatureMatrix();
    if (!featureMatrix) {
      log.error('Failed to fetch feature matrix');
      throw new Error('FeatureMatrixNotFound');
    }
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      throw new Error('FeatureUsageNotFound');
    }

    log.info(`Feature ${featureId}, User ${userId}: Setting usage to ${value}`);
    featureUsage.usage[featureId] = value;

    try {
      await putJsonObject(
        this.accessKeyId,
        this.secretAccessKey,
        this.region,
        this.s3Bucket,
        `${this.projectId}/users/${userId}.json`,
        featureUsage
      );
    } catch (err) {
      log.error(err);
      log.error('Failed to update feature usage');
      throw err;
    }

    await shouldSendWebhook(featureMatrix, featureUsage, featureId, userId);
  }

  public async featureMatrix(): Promise<FeatureMatrix | void> {
    const featureMatrix = await this.getFeatureMatrix();
    if (!featureMatrix) {
      log.error('Failed to fetch feature matrix');
      return;
    }
    return featureMatrix;
  }

  public async usage(userId: string): Promise<FeatureUsage | void> {
    const featureUsage = await this.getFeatureUsage(userId);
    if (!featureUsage) {
      log.error('Failed to fetch feature usage');
      return;
    }
    return featureUsage;
  }
}
