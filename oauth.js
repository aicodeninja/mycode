// Complete OAuth 2.0 Server with Express.js
// Install: npm install express oauth2-server body-parser uuid

const express = require('express');
const OAuth2Server = require('oauth2-server');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// IN-MEMORY DATABASE (Replace with real DB)
// ============================================

const db = {
  // Registered OAuth clients
  clients: [
    {
      id: 'application-client-id',
      clientId: 'application-client-id',
      clientSecret: 'application-client-secret',
      grants: ['client_credentials', 'password', 'authorization_code', 'refresh_token'],
      redirectUris: ['http://localhost:3000/callback']
    }
  ],
  
  // Users in the system
  users: [
    {
      id: 'user-123',
      username: 'testuser',
      password: 'password123', // In production, hash this!
      email: 'user@example.com'
    }
  ],
  
  // Active access tokens
  tokens: [],
  
  // Authorization codes
  authorizationCodes: []
};

// ============================================
// OAUTH MODEL IMPLEMENTATION
// ============================================

const oauthModel = {
  // Get access token from database
  getAccessToken: async (accessToken) => {
    const token = db.tokens.find(t => t.accessToken === accessToken);
    if (!token) return false;
    
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      client: token.client,
      user: token.user
    };
  },

  // Get refresh token from database
  getRefreshToken: async (refreshToken) => {
    const token = db.tokens.find(t => t.refreshToken === refreshToken);
    if (!token) return false;
    
    return {
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: token.client,
      user: token.user
    };
  },

  // Get client credentials
  getClient: async (clientId, clientSecret) => {
    const client = db.clients.find(c => 
      c.clientId === clientId && 
      (clientSecret ? c.clientSecret === clientSecret : true)
    );
    
    if (!client) return false;
    
    return {
      id: client.id,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: client.grants,
      redirectUris: client.redirectUris
    };
  },

  // Save generated token
  saveToken: async (token, client, user) => {
    const savedToken = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: {
        id: client.id,
        clientId: client.clientId
      },
      user: {
        id: user.id,
        username: user.username
      }
    };
    
    db.tokens.push(savedToken);
    return savedToken;
  },

  // Get user credentials (for password grant)
  getUser: async (username, password) => {
    const user = db.users.find(u => 
      u.username === username && u.password === password
    );
    
    if (!user) return false;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  },

  // Get authorization code
  getAuthorizationCode: async (authorizationCode) => {
    const code = db.authorizationCodes.find(c => 
      c.authorizationCode === authorizationCode
    );
    
    if (!code) return false;
    
    return {
      code: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: code.client,
      user: code.user
    };
  },

  // Save authorization code
  saveAuthorizationCode: async (code, client, user) => {
    const authCode = {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: {
        id: client.id,
        clientId: client.clientId
      },
      user: {
        id: user.id,
        username: user.username
      }
    };
    
    db.authorizationCodes.push(authCode);
    return authCode;
  },

  // Revoke authorization code after use
  revokeAuthorizationCode: async (code) => {
    const index = db.authorizationCodes.findIndex(c => 
      c.authorizationCode === code.code
    );
    
    if (index !== -1) {
      db.authorizationCodes.splice(index, 1);
      return true;
    }
    return false;
  },

  // Revoke token
  revokeToken: async (token) => {
    const index = db.tokens.findIndex(t => 
      t.refreshToken === token.refreshToken
    );
    
    if (index !== -1) {
      db.tokens.splice(index, 1);
      return true;
    }
    return false;
  },

  // Verify scope
  verifyScope: async (token, scope) => {
    if (!token.scope) return false;
    const requestedScopes = scope.split(' ');
    const authorizedScopes = token.scope.split(' ');
    return requestedScopes.every(s => authorizedScopes.includes(s));
  },

  // Generate access token
  generateAccessToken: async (client, user, scope) => {
    return uuidv4();
  },

  // Generate refresh token
  generateRefreshToken: async (client, user, scope) => {
    return uuidv4();
  },

  // Generate authorization code
  generateAuthorizationCode: async (client, user, scope) => {
    return uuidv4();
  }
};

// ============================================
// INITIALIZE OAUTH SERVER
// ============================================

const oauth = new OAuth2Server({
  model: oauthModel,
  accessTokenLifetime: 0, // 0 = lifetime (never expires)
  refreshTokenLifetime: 0, // 0 = lifetime (never expires)
  allowBearerTokensInQueryString: true
});

// ============================================
// API 1: GET ACCESS TOKEN
// ============================================

// Token endpoint - supports multiple grant types
app.post('/oauth/token', async (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  try {
    const token = await oauth.token(request, response);
    
    res.json({
      access_token: token.accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: token.refreshToken,
      scope: token.scope
    });
  } catch (err) {
    res.status(err.code || 500).json({
      error: err.name,
      error_description: err.message
    });
  }
});

// ============================================
// API 2: GET RESOURCE (Protected Resource)
// ============================================

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  const request = new Request(req);
  const response = new Response(res);

  try {
    const token = await oauth.authenticate(request, response);
    req.oauth = {
      token: token,
      user: token.user
    };
    next();
  } catch (err) {
    res.status(err.code || 401).json({
      error: err.name,
      error_description: err.message
    });
  }
};

// Protected resource endpoint
app.get('/api/resource', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected resource',
    user: req.oauth.user,
    data: {
      id: 1,
      name: 'Sample Resource',
      description: 'This data is protected by OAuth 2.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Get user profile (another protected endpoint example)
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.oauth.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email
  });
});

// ============================================
// ADDITIONAL HELPFUL ENDPOINTS
// ============================================

// Revoke token endpoint
app.post('/oauth/revoke', async (req, res) => {
  const { token, token_type_hint } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'token is required' });
  }
  
  // Find and remove the token
  const index = db.tokens.findIndex(t => 
    t.accessToken === token || t.refreshToken === token
  );
  
  if (index !== -1) {
    db.tokens.splice(index, 1);
  }
  
  res.json({ message: 'Token revoked successfully' });
});

// Token introspection endpoint
app.post('/oauth/introspect', async (req, res) => {
  const { token } = req.body;
  
  const foundToken = db.tokens.find(t => 
    t.accessToken === token || t.refreshToken === token
  );
  
  if (!foundToken) {
    return res.json({ active: false });
  }
  
  const isExpired = foundToken.accessTokenExpiresAt < new Date();
  
  res.json({
    active: !isExpired,
    scope: foundToken.scope,
    client_id: foundToken.client.clientId,
    username: foundToken.user.username,
    token_type: 'Bearer',
    exp: Math.floor(foundToken.accessTokenExpiresAt.getTime() / 1000),
    iat: Math.floor((foundToken.accessTokenExpiresAt.getTime() - 3600000) / 1000)
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`OAuth 2.0 Server running on port ${PORT}`);
  console.log('===========================================');
  console.log('\n📋 TESTING INSTRUCTIONS:\n');
  console.log('1. GET ACCESS TOKEN (Client Credentials):');
  console.log(`   curl -X POST http://localhost:${PORT}/oauth/token \\`);
  console.log('     -H "Content-Type: application/x-www-form-urlencoded" \\');
  console.log('     -d "grant_type=client_credentials&client_id=application-client-id&client_secret=application-client-secret"\n');
  
  console.log('2. GET ACCESS TOKEN (Password Grant):');
  console.log(`   curl -X POST http://localhost:${PORT}/oauth/token \\`);
  console.log('     -H "Content-Type: application/x-www-form-urlencoded" \\');
  console.log('     -d "grant_type=password&username=testuser&password=password123&client_id=application-client-id&client_secret=application-client-secret"\n');
  
  console.log('3. ACCESS PROTECTED RESOURCE:');
  console.log(`   curl -X GET http://localhost:${PORT}/api/resource \\`);
  console.log('     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"\n');
  
  console.log('4. GET USER PROFILE:');
  console.log(`   curl -X GET http://localhost:${PORT}/api/user/profile \\`);
  console.log('     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"\n');
  
  console.log('===========================================\n');
});