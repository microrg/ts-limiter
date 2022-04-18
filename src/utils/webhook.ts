import axios from 'axios';

import { log } from './log';
import { FeatureMatrix, FeatureUsage } from '../typings';

function sendWebhook(
  url: string,
  token: string,
  payload: string,
  userId: string,
  featureId: string,
  usage: number,
  limit: number
): Promise<any> {
  let payloadString = payload;
  payloadString = payloadString.replace('{{user_id}}', userId);
  payloadString = payloadString.replace('{{feature_id}}', featureId);
  payloadString = payloadString.replace('{{usage}}', usage as any);
  payloadString = payloadString.replace('{{limit}}', limit as any);
  return axios.post(url, JSON.parse(payloadString), {
    headers: { Authorization: token, 'Content-Type': 'application/json' },
  });
}

async function shouldSendWebhook(
  featureMatrix: FeatureMatrix,
  featureUsage: FeatureUsage,
  featureId: string,
  userId: string
) {
  const curr = featureUsage.usage[featureId];
  for (let plan of featureMatrix.plans) {
    for (let feature of plan.features) {
      if (feature.feature_id === featureId) {
        const hook = feature?.webhook;
        if (hook && hook.enabled && curr / feature.value > hook.threshold) {
          log.info(`User ${userId}, triggering webhook: ${hook.url}`);
          await sendWebhook(
            hook.url,
            hook.token,
            hook.payload,
            userId,
            featureId,
            curr,
            feature.value
          ).catch((err) => {
            log.error(`User ${userId}, webhook failed: ${err}`);
          });
          log.info(`User ${userId}, webhook triggered: ${hook.url}`);
        }
      }
    }
  }
}

export { shouldSendWebhook };
