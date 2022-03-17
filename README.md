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

The following environment variables must be set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`

```typescript
import { Limiter } from 'ts-limiter';

// Initialize SDK with S3 bucket containing the feature matrix and usage tracking data
const client = new Limiter('my-s3-bucket', 'my-project-id');

// Check if a feature is within limit
if (await client.feature('my-feature', 'user-id')) {
  // Pass
}

// Increment usage by 1.
await client.increment('my-feature', 'user-id');

// Set usage to some value.
await client.set('my-feature', 'user-id', 5);
```
