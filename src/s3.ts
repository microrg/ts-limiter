import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

function getClient(
  accessKeyId: string,
  secretAccessKey: string,
  region: string
): S3Client {
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    apiVersion: '2006-03-01',
  });
}

function getObject(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  bucket: string,
  key: string
): Promise<any> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getClient(accessKeyId, secretAccessKey, region).send(command);
}

function putJsonObject(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  bucket: string,
  key: string,
  body: any
): Promise<any> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(body),
    ContentType: 'application/json',
  });
  return getClient(accessKeyId, secretAccessKey, region).send(command);
}

export { getObject, putJsonObject };
