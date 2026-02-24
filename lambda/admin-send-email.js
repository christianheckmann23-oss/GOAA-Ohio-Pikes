/**
 * POST /admin/email
 * Sends an email to selected alumni via Amazon SES.
 * Requires the caller to be in the Cognito "admin" group.
 *
 * Body:
 * {
 *   "to": "all" | "approved" | ["email1@x.com", "email2@x.com"],
 *   "subject": "string",
 *   "body": "HTML string",
 *   "replyTo": "optional reply-to address"
 * }
 *
 * Required env vars: DYNAMODB_TABLE, SES_FROM_EMAIL
 */

const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendBulkTemplatedEmailCommand, SendEmailCommand } = require('@aws-sdk/client-ses');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com';

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

async function getAllAlumniEmails(statusFilter) {
  const params = {
    TableName: TABLE,
    ProjectionExpression: 'email, firstName, lastName, #s',
    ExpressionAttributeNames: { '#s': 'status' },
  };

  if (statusFilter !== 'all') {
    params.FilterExpression = '#s = :status';
    params.ExpressionAttributeValues = { ':status': { S: statusFilter } };
  }

  const emails = [];
  let lastKey;
  do {
    if (lastKey) params.ExclusiveStartKey = lastKey;
    const result = await dynamo.send(new ScanCommand(params));
    (result.Items || []).forEach(item => {
      const { email, status } = unmarshall(item);
      if (email && (statusFilter === 'all' || status === statusFilter)) {
        emails.push(email);
      }
    });
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return emails;
}

exports.handler = async (event) => {
  if (!isAdmin(event)) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Admin access required' }) };
  }

  let to, subject, bodyHtml, replyTo;
  try {
    ({ to, subject, body: bodyHtml, replyTo } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!subject || !bodyHtml) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'subject and body are required' }) };
  }

  // Resolve recipient list
  let recipientEmails = [];
  if (to === 'all' || to === 'approved') {
    recipientEmails = await getAllAlumniEmails(to === 'all' ? 'all' : 'approved');
  } else if (Array.isArray(to) && to.length > 0) {
    recipientEmails = to;
  } else {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid "to" field' }) };
  }

  if (!recipientEmails.length) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No recipients found' }) };
  }

  // SES sendEmail supports up to 50 destinations per call — send in batches
  const BATCH_SIZE = 50;
  const results = { sent: 0, failed: 0, errors: [] };

  for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
    const batch = recipientEmails.slice(i, i + BATCH_SIZE);
    try {
      const cmd = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { BccAddresses: batch }, // BCC to protect privacy
        ReplyToAddresses: replyTo ? [replyTo] : [],
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: bodyHtml },
            Text: { Data: bodyHtml.replace(/<[^>]+>/g, '') },
          },
        },
      });
      await ses.send(cmd);
      results.sent += batch.length;
    } catch (err) {
      console.error('SES batch send error:', err);
      results.failed += batch.length;
      results.errors.push(err.message);
    }
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({
      success: results.failed === 0,
      sent: results.sent,
      failed: results.failed,
      total: recipientEmails.length,
    }),
  };
};
