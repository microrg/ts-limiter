import axios from 'axios';

function sendWebhook(
  url: string,
  token: string,
  userId: string,
  value: number,
  limit: number
): Promise<any> {
  return axios.post(
    url,
    { user_id: userId, value, limit },
    { headers: { Authorization: token, 'Content-Type': 'application/json' } }
  );
}

export { sendWebhook };
