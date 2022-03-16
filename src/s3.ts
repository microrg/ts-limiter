import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const client = new S3Client({
  apiVersion: '2006-03-01',
  region: process.env.AWS_DEFAULT_REGION,
});

function getObject(bucket: string, key: string): Promise<any> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return client.send(command);
}

function putPublicReadJsonObject(
  bucket: string,
  key: string,
  body: any
): Promise<any> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(body),
    ContentType: 'application/json',
    ACL: 'public-read',
  });
  return client.send(command);
}

export { getObject, putPublicReadJsonObject };
