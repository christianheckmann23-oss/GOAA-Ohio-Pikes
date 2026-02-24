# Lambda Functions — GOAA Alumni Portal

Seven Node.js 18.x functions. Each file is self-contained and must be
uploaded individually to AWS Lambda.

## Environment Variables (set on every function)

| Variable          | Example value                        | Notes                                  |
|-------------------|--------------------------------------|----------------------------------------|
| `DYNAMODB_TABLE`  | `goaa-alumni-profiles`               | DynamoDB table name                    |
| `SES_FROM_EMAIL`  | `noreply@goaa-ohiopikes.org`         | Must be verified in SES                |
| `ADMIN_EMAIL`     | `admin@goaa-ohiopikes.org`           | Where approval requests are sent       |
| `SITE_URL`        | `https://your-amplify-app.amplify... | Used in email links + CORS             |
| `AWS_REGION`      | `us-east-1`                          | Set automatically by Lambda            |

## Functions

| File                     | Trigger                    | IAM Permissions Needed                     |
|--------------------------|----------------------------|--------------------------------------------|
| `pre-auth-trigger.js`    | Cognito Pre-Authentication | `dynamodb:GetItem`                         |
| `post-confirm-trigger.js`| Cognito Post-Confirmation  | `dynamodb:PutItem`, `ses:SendEmail`        |
| `alumni-get-profile.js`  | API Gateway GET /profile   | `dynamodb:GetItem`                         |
| `alumni-update-profile.js`| API Gateway PUT /profile  | `dynamodb:UpdateItem`                      |
| `admin-list-alumni.js`   | API Gateway GET /admin/alumni | `dynamodb:Scan`                         |
| `admin-update-status.js` | API Gateway POST /admin/alumni/{id}/status | `dynamodb:GetItem`, `dynamodb:UpdateItem`, `ses:SendEmail` |
| `admin-send-email.js`    | API Gateway POST /admin/email | `dynamodb:Scan`, `ses:SendEmail`        |

## Deploying

1. Zip each file individually (the file itself, not in a subfolder)
2. In AWS Console → Lambda → Create function → Author from scratch
3. Runtime: Node.js 18.x
4. Upload .zip, set handler to `filename.handler` (e.g. `alumni-get-profile.handler`)
5. Add environment variables above
6. For Cognito triggers (pre-auth, post-confirm): also attach them in the User Pool settings

## API Gateway Routes

```
GET    /profile                      → alumni-get-profile
PUT    /profile                      → alumni-update-profile
GET    /admin/alumni                 → admin-list-alumni
POST   /admin/alumni/{id}/status     → admin-update-status
POST   /admin/email                  → admin-send-email
```

All routes except the Cognito triggers require a Cognito JWT authorizer on the HTTP API.
