import axios from 'axios';

function sendWebhook(
  url: string,
  token: string,
  userId: string,
  featureId: string,
  value: number,
  limit: number
): Promise<any> {
  return axios.post(
    url,
    { user_id: userId, value, limit, feature_id: featureId },
    { headers: { Authorization: token, 'Content-Type': 'application/json' } }
  );
}

export { sendWebhook };
