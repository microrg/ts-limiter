# Limiter TypeScript SDK

Limiter is a subscription limits management platform.

This TypeScript package tracks usage and enforces limits within a TypeScript application.

- Lightweight and fast
- Relies on S3 for scalability and data availability

## Installation

With npm:

```
npm install ts-limiter
```

With yarn:

```
yarn add ts-limiter
```

## Quick Usage

```typescript
import { Limiter } from 'ts-limiter';

// Initialize SDK with S3 bucket containing the feature matrix and usage tracking data
const awsCredentials = {
  s3Bucket: 's3-bucket',
  region: 'us-east-1',
  accessKeyId: 'access-key-id',
  secretAccessKey: 'secret-access-key',
};
const client = new Limiter(awsCredentials, 'project-id');

// Check if a feature is within limit
if (await client.feature('plan-name', 'feature-name', 'user-id')) {
  // Pass
}

// Increment usage by 1.
await client.increment('feature-name', 'user-id');

// Decrement usage by 1.
await client.decrement('feature-name', 'user-id');

// Set usage to some value.
await client.set('feature-name', 'user-id', 5);

// Get feature matrix for the project
const featureMatrix = await client.featureMatrix();

// Get user's usage data
const usage = await client.usage('5a8a1ca3-aee8-4a96-9bb4-673442728f2e');
```
