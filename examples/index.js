(async () => {
  const { Limiter } = require('../lib/index.js');

  // Initialize SDK with S3 bucket containing the feature matrix and usage tracking data
  const client = new Limiter('limiter-test', 'my-project');

  // Check if a feature is within limit
  if (
    await client.feature('p1', 'p1f2', '5a8a1ca3-aee8-4a96-9bb4-673442728f2e')
  ) {
    console.log('Pass');
  } else {
    console.log('Fail');
  }

  // Increment usage by 1.
  await client.increment('p1f2', '5a8a1ca3-aee8-4a96-9bb4-673442728f2e');

  // Set usage to some value.
  await client.set('p1f2', '5a8a1ca3-aee8-4a96-9bb4-673442728f2e', 5);

  // Get feature matrix for the project
  const featureMatrix = await client.featureMatrix();
  console.log(JSON.stringify(featureMatrix));

  // Get user's usage data
  const usage = await client.usage('5a8a1ca3-aee8-4a96-9bb4-673442728f2e');
  console.log(JSON.stringify(usage));
})();
