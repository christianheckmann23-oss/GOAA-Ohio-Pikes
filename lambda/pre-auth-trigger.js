/**
 * Cognito Pre-Authentication Lambda Trigger
 * Attached to: User Pool → Triggers → Pre authentication
 *
 * Blocks login for users whose profile status is not "approved".
 * This fires before Cognito issues tokens, so unapproved users
 * can verify their email but cannot actually log in.
 *
 * Required env vars: DYNAMODB_TABLE
 */

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';

exports.handler = async (event) => {
  const userId = event.request.userAttributes.sub;

  // Admin users (in Cognito "admin" group) bypass this check.
  const groups = (event.request.groupConfiguration &&
    event.request.groupConfiguration.groupsToOverride) || [];
  if (groups.includes('admin')) return event;

  try {
    const { Item } = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: { userId: { S: userId } },
      ProjectionExpression: '#s',
      ExpressionAttributeNames: { '#s': 'status' },
    }));

    if (!Item) {
      // Profile not created yet — could be a timing race right after confirm.
      // Allow through; post-confirm trigger will create the record.
      return event;
    }

    const status = Item.status && Item.status.S;

    if (status === 'approved') return event;

    if (status === 'rejected') {
      throw new Error('Your account request has been declined. Please contact the alumni association.');
    }

    // pending or any other state
    throw new Error('Your account is pending admin approval. You will receive an email once approved.');
  } catch (err) {
    // Re-throw known user-facing errors as-is; wrap unexpected ones.
    if (err.message.startsWith('Your account')) throw err;
    console.error('pre-auth-trigger error:', err);
    throw new Error('Unable to verify account status. Please try again later.');
  }
};
