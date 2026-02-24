/**
 * POST /admin/alumni/{id}/status
 * Approves or rejects an alumni account.
 * Requires the caller to be in the Cognito "admin" group.
 *
 * Body: { "action": "approve" | "reject" }
 *
 * On approve: updates DynamoDB status to "approved" and sends welcome email.
 * On reject: updates DynamoDB status to "rejected" and sends notification email.
 *
 * Required env vars: DYNAMODB_TABLE, SES_FROM_EMAIL, SITE_URL
 */

const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com';
const SITE_URL = process.env.SITE_URL || 'https://yourdomain.com';

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
  const groups = claims['cognito:groups'] || '';
  return Array.isArray(groups) ? groups.includes('admin') : groups.split(',').includes('admin');
}

exports.handler = async (event) => {
  if (!isAdmin(event)) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Admin access required' }) };
  }

  const userId = event.pathParameters && event.pathParameters.id;
  if (!userId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing user ID' }) };
  }

  let action;
  try {
    ({ action } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!['approve', 'reject'].includes(action)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'action must be "approve" or "reject"' }) };
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    // Fetch profile to get email for notification
    const { Item } = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: { userId: { S: userId } },
    }));

    if (!Item) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Alumni profile not found' }) };
    }

    const profile = unmarshall(Item);

    // Update status
    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: 'SET #s = :status, #u = :updated',
      ExpressionAttributeNames: { '#s': 'status', '#u': 'updatedAt' },
      ExpressionAttributeValues: {
        ':status': { S: newStatus },
        ':updated': { S: new Date().toISOString() },
      },
    }));

    // Send email notification to the alumni
    if (profile.email) {
      const subject = action === 'approve'
        ? 'Welcome to the GOAA Alumni Portal — Your Account is Approved'
        : 'GOAA Alumni Portal — Account Request Update';

      const htmlBody = action === 'approve'
        ? `<p>Great news! Your Gamma Omicron Alumni Association account has been approved.</p>
           <p><a href="${SITE_URL}/alumni/">Log in to your alumni portal →</a></p>
           <p>Once logged in, please complete your profile so fellow brothers can find you.</p>
           <p>Once a Pike, always a Pike.</p>`
        : `<p>Thank you for your interest in the GOAA alumni portal.</p>
           <p>Unfortunately, we were unable to verify your alumni status at this time. 
           If you believe this is an error, please contact us directly.</p>`;

      try {
        await ses.send(new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [profile.email] },
          Message: {
            Subject: { Data: subject },
            Body: {
              Html: { Data: htmlBody },
              Text: { Data: htmlBody.replace(/<[^>]+>/g, '') },
            },
          },
        }));
      } catch (emailErr) {
        console.error('Alumni notification email failed:', emailErr);
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, userId, status: newStatus }),
    };
  } catch (err) {
    console.error('admin-update-status error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
