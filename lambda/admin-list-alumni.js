/**
 * GET /admin/alumni
 * Returns all alumni profiles from DynamoDB.
 * Requires the caller to be in the Cognito "admin" group.
 *
 * Optional query string: ?status=pending|approved|rejected|all (default: all)
 *
 * Required env vars: DYNAMODB_TABLE
 */

const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';

const CORS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
};

function isAdmin(event) {
  const claims = event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.jwt &&
    event.requestContext.authorizer.jwt.claims;
  if (!claims) return false;
  // Cognito groups are in the `cognito:groups` claim as a space-separated string or array
  const groups = claims['cognito:groups'] || '';
  return Array.isArray(groups) ? groups.includes('admin') : groups.split(',').includes('admin');
}

exports.handler = async (event) => {
  if (!isAdmin(event)) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Admin access required' }) };
  }

  const statusFilter = (event.queryStringParameters && event.queryStringParameters.status) || 'all';

  try {
    const params = { TableName: TABLE };

    if (statusFilter !== 'all') {
      params.FilterExpression = '#s = :status';
      params.ExpressionAttributeNames = { '#s': 'status' };
      params.ExpressionAttributeValues = { ':status': { S: statusFilter } };
    }

    const items = [];
    let lastKey;

    // DynamoDB Scan paginates — loop to collect all records
    do {
      if (lastKey) params.ExclusiveStartKey = lastKey;
      const result = await dynamo.send(new ScanCommand(params));
      items.push(...(result.Items || []).map(unmarshall));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    // Sort by createdAt descending
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ alumni: items, count: items.length }),
    };
  } catch (err) {
    console.error('admin-list-alumni error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
