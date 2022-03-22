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

- `LIMITER_AWS_ACCESS_KEY_ID`
- `LIMITER_AWS_SECRET_ACCESS_KEY`
- `LIMITER_AWS_DEFAULT_REGION`

```typescript
import { Limiter } from 'ts-limiter';

// Initialize SDK with S3 bucket containing the feature matrix and usage tracking data
const client = new Limiter('s3-bucket', 'project-id');

// Check if a feature is within limit
if (await client.feature('plan-name', 'feature-name', 'user-id')) {
  // Pass
}

// Increment usage by 1.
await client.increment('feature-name', 'user-id');

// Set usage to some value.
await client.set('feature-name', 'user-id', 5);

// Get feature matrix for the project
const featureMatrix = await client.featureMatrix();

// Get user's usage data
const usage = await client.usage('5a8a1ca3-aee8-4a96-9bb4-673442728f2e');
```
