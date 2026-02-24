/**
 * Cognito Post-Confirmation Lambda Trigger
 * Attached to: User Pool → Triggers → Post confirmation
 *
 * Fires after a user verifies their email. Creates a DynamoDB profile
 * record with status "pending" and notifies the admin via SES.
 *
 * Required env vars: DYNAMODB_TABLE, SES_FROM_EMAIL, ADMIN_EMAIL
 */

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE = process.env.DYNAMODB_TABLE || 'goaa-alumni-profiles';
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
const SITE_URL = process.env.SITE_URL || 'https://yourdomain.com';

exports.handler = async (event) => {
  const attrs = event.request.userAttributes;
  const userId = attrs.sub;
  const email = attrs.email || '';
  const now = new Date().toISOString();

  // Create the DynamoDB profile record
  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      userId:      { S: userId },
      email:       { S: email },
      firstName:   { S: attrs.given_name || '' },
      lastName:    { S: attrs.family_name || '' },
      address:     { S: '' },
      graduationYear: { S: '' },
      initiationYear: { S: '' },
      major:       { S: '' },
      phone:       { S: '' },
      aboutMe:     { S: '' },
      status:      { S: 'pending' },
      createdAt:   { S: now },
      updatedAt:   { S: now },
    },
    ConditionExpression: 'attribute_not_exists(userId)',
  }));

  // Notify admin of a new pending account request
  try {
    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: 'New Alumni Account Request — Approval Needed' },
        Body: {
          Html: {
            Data: `
              <p>A new alumni has registered and is awaiting your approval.</p>
              <table>
                <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                <tr><td><strong>Name:</strong></td><td>${attrs.given_name || ''} ${attrs.family_name || ''}</td></tr>
                <tr><td><strong>Requested:</strong></td><td>${now}</td></tr>
              </table>
              <p><a href="${SITE_URL}/admin/users.html">Review &amp; Approve →</a></p>
            `,
          },
          Text: { Data: `New alumni account request from ${email}. Review at ${SITE_URL}/admin/users.html` },
        },
      },
    }));
  } catch (emailErr) {
    // Don't fail the trigger if the email fails — the record is already created.
    console.error('Admin notification email failed:', emailErr);
  }

  return event;
};
