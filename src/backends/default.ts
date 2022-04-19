import axios from 'axios';

import {
  Backend,
  DefaultBackendOptions,
  FeatureMatrix,
  FeatureUsage,
} from '../typings';

const V1_API = 'https://www.applimiter.com/api/v1';

export class DefaultBackend implements Backend {
  apiToken: string;
  backendUrl: string;
  projectId: string;

  constructor(projectId: string, opts: DefaultBackendOptions) {
    const { apiToken, backendUrl } = opts;
    this.apiToken = apiToken;
    this.projectId = projectId;
    this.backendUrl = backendUrl || V1_API;
  }

  public async feature(
    planId: string,
    featureId: string,
    userId: string
  ): Promise<boolean> {
    const resp = await axios.post(
      `${this.backendUrl}/feature`,
      {
        user_id: userId,
        plan_id: planId,
        feature_id: featureId,
        project_id: this.projectId,
      },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return resp.data.allow;
  }

  public async increment(featureId: string, userId: string): Promise<void> {
    await axios.post(
      `${this.backendUrl}/increment`,
      { user_id: userId, feature_id: featureId, project_id: this.projectId },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public async decrement(featureId: string, userId: string): Promise<void> {
    await axios.post(
      `${this.backendUrl}/decrement`,
      { user_id: userId, feature_id: featureId, project_id: this.projectId },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public async set(
    featureId: string,
    userId: string,
    value: number
  ): Promise<void> {
    await axios.post(
      `${this.backendUrl}/set`,
      {
        value,
        user_id: userId,
        feature_id: featureId,
        project_id: this.projectId,
      },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public async featureMatrix(): Promise<FeatureMatrix | void> {
    const resp = await axios.post(
      `${this.backendUrl}/feature-matrix`,
      { project_id: this.projectId },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return resp.data;
  }

  public async usage(userId: string): Promise<FeatureUsage | void> {
    const resp = await axios.post(
      `${this.backendUrl}/usage`,
      { user_id: userId, project_id: this.projectId },
      {
        headers: {
          Authorization: this.apiToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return resp.data;
  }
}
