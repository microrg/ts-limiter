# Limiter TypeScript SDK

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

### Default Backend

Initialize SDK with the managed storage backend

```typescript
import { Limiter } from 'ts-limiter';

const opts = {
  backend: 'Default',
  apiToken: 'api-token',
};
const client = new Limiter('project-id', opts);
```

### S3 Backend

Initialize SDK with a private S3 bucket storage

```typescript
import { Limiter } from 'ts-limiter';

const opts = {
  backend: 'S3',
  s3Bucket: 's3-bucket',
  region: 'us-east-1',
  accessKeyId: 'access-key-id',
  secretAccessKey: 'secret-access-key',
};
const client = new Limiter('project-id', opts);
```

### Available Methods

```typescript
// Bind user to a plan
await client.bind('plan-name', 'user-id');

// Check if a feature is within limit
if (await client.feature('feature-name', 'user-id')) {
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
const usage = await client.usage('user-id');
```
