/**
 * GET /profile
 * Returns the calling alumni's profile from DynamoDB.
 * Requires a valid Cognito JWT (attached via API Gateway JWT authorizer).
 *
 * Required env vars: DYNAMODB_TABLE
 */

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';

const CORS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // API Gateway JWT authorizer injects claims into requestContext
  const userId = event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.jwt &&
    event.requestContext.authorizer.jwt.claims &&
    event.requestContext.authorizer.jwt.claims.sub;

  if (!userId) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { Item } = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: { userId: { S: userId } },
    }));

    if (!Item) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Profile not found' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(unmarshall(Item)) };
  } catch (err) {
    console.error('alumni-get-profile error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
