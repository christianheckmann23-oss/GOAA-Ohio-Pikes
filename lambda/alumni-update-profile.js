/**
 * PUT /profile
 * Updates the calling alumni's editable profile fields in DynamoDB.
 * Only approved alumni can update (pre-auth trigger prevents login of others).
 *
 * Required env vars: DYNAMODB_TABLE
 */

const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';

const CORS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
};

// Fields alumni are allowed to update (admins cannot be set this way)
const ALLOWED_FIELDS = [
  'firstName', 'lastName', 'address',
  'graduationYear', 'initiationYear', 'major', 'phone', 'aboutMe',
];

exports.handler = async (event) => {
  const userId = event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.jwt &&
    event.requestContext.authorizer.jwt.claims &&
    event.requestContext.authorizer.jwt.claims.sub;

  if (!userId) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // Build update expression from allowed fields only
  const updates = [];
  const names = {};
  const values = {};

  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      updates.push(`#${field} = :${field}`);
      names[`#${field}`] = field;
      values[`:${field}`] = { S: String(body[field] || '') };
    }
  }

  if (!updates.length) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No valid fields to update' }) };
  }

  updates.push('#updatedAt = :updatedAt');
  names['#updatedAt'] = 'updatedAt';
  values[':updatedAt'] = { S: new Date().toISOString() };

  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: 'SET ' + updates.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(userId)',
    }));

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Profile not found' }) };
    }
    console.error('alumni-update-profile error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
