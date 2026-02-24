// Updates a Netlify Identity user's roles. Only callable by users with the "admin" role.
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { identity, user } = context.clientContext || {};

  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated' }) };
  }

  const callerRoles = (user.app_metadata && user.app_metadata.roles) || [];
  if (!callerRoles.includes('admin')) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin role required' }) };
  }

  let userId, newRoles;
  try {
    ({ userId, newRoles } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const VALID_ROLES = ['admin', 'alumni', 'member'];
  const sanitized = (newRoles || []).filter(r => VALID_ROLES.includes(r));

  try {
    const response = await fetch(`${identity.url}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${identity.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_metadata: { roles: sanitized } }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, headers, body: JSON.stringify({ error: text }) };
    }

    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
