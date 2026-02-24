// Lists all Netlify Identity users. Only callable by users with the "admin" role.
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { identity, user } = context.clientContext || {};

  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated' }) };
  }

  const roles = (user.app_metadata && user.app_metadata.roles) || [];
  if (!roles.includes('admin')) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin role required' }) };
  }

  try {
    const response = await fetch(`${identity.url}/admin/users?per_page=200`, {
      headers: { Authorization: `Bearer ${identity.token}` },
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
