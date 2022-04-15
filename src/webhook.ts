import axios from 'axios';

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

export { sendWebhook };
