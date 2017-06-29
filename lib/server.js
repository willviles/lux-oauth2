import OAuthServer from 'oauth2-server';
import bCrypt from 'bcrypt-nodejs';
import camelCase from 'lodash.camelcase';

import NotFoundError from './errors/not-found-error';
import UnauthorizedError from './errors/unauthorized-error';

import OAuth2Request from './handlers/request';
import OAuth2Response from './handlers/response';

const { OAuthError } = OAuthServer;

const DEFAULT_GRANT_TYPES = [
  'authorization_code',
  'client_credentials',
  'password',
  'refresh_token'
];

const REQUIRED_MODELS = [
  'accessToken',
  'client',
  'refreshToken',
  'user'
];

class OAuth2BaseServer {
  constructor() {
    this.setGrantTypes();
    this.setModels();
    this.server = new OAuthServer({
      model: this.buildServerModel(),
      accessTokenLifetime: this.accessTokenLifetime,
      refreshTokenLifetime: this.refreshTokenLifetime,
      allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
      allowBearerTokensInQueryString: this.allowBearerTokensInQueryString,
      extendedGrantTypes: this.extendedGrantTypes
    });
  }

  accessTokenLifetime = 3600;
  refreshTokenLifetime = 1209600;
  allowExtendedTokenAttributes = true;
  allowBearerTokensInQueryString = true;

  //
  // OAUTH2SERVER METHODS
  //
  // ---------------------

  // @async getAccessToken
  //
  // Gets an OAuth access token when passed an access_token.
  //
  // @param accessToken { String }
  // @param done { Promise }

  getAccessToken = async (accessToken, done) => {
    try {
     const result = await this.models.accessToken.where({
       accessToken
     }).first();
     if (!result) {
       throw new OAuthError(`No access token found`, { code: 404 });
     }
     const client = await result[this.models.client.oauthRef];
     const user = await result[this.models.user.oauthRef];
     return done(null, {
       accessToken: result.accessToken,
       accessTokenExpiresAt: result.expires,
       client,
       user
     });
   } catch(error) { return done(error); }
  }

  // @function revokeToken
  //
  // Revokes an access token.
  //
  // @param { refreshTokenExpiresAt } { String }

  revokeToken({ refreshTokenExpiresAt }) {
    return { refreshTokenExpiresAt };
  }

  // @async saveToken
  //
  // Saves an OAuth access token and refresh token.
  //
  // @param token { String }
  // @param client { Record }
  // @param user { Record }
  // @param done { Promise }

  saveToken = async (token, client, user, done) => {
    try {
      await this.models.accessToken.create({
        accessToken: token.accessToken,
        expires: token.accessTokenExpiresAt,
        [this.models.client.oauthRefId]: client.id,
        [this.models.user.oauthRefId]: user.id
      });
      await this.models.refreshToken.create({
        refreshToken: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        [this.models.client.oauthRefId]: client.id,
        [this.models.user.oauthRefId]: user.id
      });
      return done(null, {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        client,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user: user.id
      });
    } catch(error) { return done(error); }

  }

  // @async getClient
  //
  // Gets a client when passed clientId and clientSecret.
  //
  // @param clientId { String }
  // @param clientSecret { String }
  // @param done { Promise }

  getClient = async (clientId, clientSecret, done) => {
    try {
      const result = await this.models.client.where({
        clientId,
        clientSecret
      }).first();
      if (!result) {
        throw new OAuthError(`No client found`, { code: 404 });
      }

      if (typeof result.grants === 'string') {
        result.grants = JSON.parse(result.grants.replace(/'/g, '"'));
      }

      return done(null, {
        id: result.id,
        clientId: result.clientId,
        clientSecret: result.clientSecret,
        grants: result.grants
      });
    } catch(error) { return done(error); }

  }

  // @async getRefreshToken
  //
  // Gets a refreshToken when passed a refresh_token value.
  //
  // @param refreshToken { String }
  // @param done { Promise }

  getRefreshToken = async (refreshToken, done) => {
    try {
      const result = await this.models.refreshToken.where({
        refreshToken
      }).first();
      if (!result) {
        throw new OAuthError(`No refresh token found`, { code: 404 });
      }
      const client = await result[this.models.client.oauthRef];
      const user = await result[this.models.user.oauthRef];
      return done(null, {
        refreshToken: result.refreshToken,
        refreshTokenExpiresAt: result.expires,
        client,
        user
      });
    } catch(error) { return done(error); }
  }

  // @async validateScope
  //
  // Validates the scope of the authentication
  //
  // @param user { Record }
  // @param client { Record }
  // @param scope { string }
  // @param done { Promise }

  validateScope = async () => true;

  // @async getUser
  //
  // Returns a user from email & password.
  //
  // @param email { String }
  // @param password { String }
  // @param done { Promise }

  getUser = async (email, password, done) => {
    try {
      const result = await this.models.user.where({
        email
      }).first();
      if (!result) {
        throw new OAuthError(`No user found with email ${email}`, { code: 404 });
      }
      if (!this.constructor.isValidPassword(result.password, password)) {
        throw new OAuthError('Password incorrect', { code: 401 });
      }
      return done(null, result);
    } catch(error) { return done(error); }
  }

  //
  // MIDDLEWARE FUNCTIONS
  //
  // ---------------------

  // @async authenticate
  //
  // Authenticate middleware.
  //
  // @param request { Request }
  // @param response { Response }

  authenticate = async (request, response) => {
    const req = new OAuth2Request(request);
    const res = new OAuth2Response(response);

    await this.server.authenticate(req, res)
      .then(result => {
        return Reflect.set(response, 'oauth2', {
          isAuthenticated: true,
          currentUser: result.user,
          client: result.client
        });
      })
      .catch(error => {
        const { message, name, statusCode } = error;
        return Reflect.set(response, 'oauth2', {
          isAuthenticated: false,
          error: { message, name, statusCode }
        });
      });

  }

  // @async authorize
  //
  // Authorize middleware.
  //
  // @param request { Request }
  // @param response { Response }

  async authenticatedRoute(request, response) {
    const { oauth2 } = response;
    const { isAuthenticated, error } = oauth2;

    if (isAuthenticated !== true) {
      throw new UnauthorizedError(error.message);
    }
  }

  // @async requestToken
  //
  // Route handler for requesting a new token.
  //
  // @param request { Request }
  // @param response { Response }

  requestToken = async (request, response) => {
    const req = new OAuth2Request(request);
    const res = new OAuth2Response(response);

    return this.server.token(req, res)
      .tap(token => { response.oauth2 = { token }; })
      .then(() => {
        Reflect.set(response, 'statusCode', 201);
        return res.body;
      })
      .catch(error => {
        if (error.code === 404) {
          throw new NotFoundError(error.message)
        } else if (error.code === 401) {
          throw new UnauthorizedError(error.message)
        } else {
          throw new Error(error.message);
        }
      });

  }

  //
  // UTIL FUNCTIONS
  //
  // ---------------------

  // @static isValidPassword
  //
  // Check the password against the hash.
  //
  // @param checkPassword { string }
  // @param password { string }

  static isValidPassword(checkPassword, password) {
    return bCrypt.compareSync(password, checkPassword);
  }

  //
  // INIT FUNCTIONS
  //
  // ---------------------

  setGrantTypes() {
    if (!this.constructor.grantTypes &&
        !Array.isArray(this.constructor.grantTypes)) {
      throw new Error('No grantTypes array set in OAuth2Server');
    }
    this.grantTypes = this.constructor.grantTypes.reduce((prev, GrantType) => {
      return [
        ...prev,
        new GrantType()
      ];
    }, []);
    this.extendedGrantTypes = this.grantTypes.reduce((prev, GrantType) => {
      if (DEFAULT_GRANT_TYPES.includes(GrantType.id)) {
        return [...prev];
      }
      return [
        ...prev,
        GrantType.id
      ];
    }, []);
  }

  buildServerModel() {
    return this.grantTypes.reduce((prev, GrantType) => {
      GrantType.constructor.methods.forEach(key => {
        if (typeof GrantType[key] === "function") {
          prev[key] = GrantType[key];
        } else if (typeof this[key] === "function") {
          prev[key] = this[key];
        } else {
          throw new Error(`No method found for OAuth2Server method ${key}, declared in ${GrantType.name}`);
        }
      });
      return prev;
    }, {});
  }

  setModels() {
    if (!this.constructor.models) {
      throw new Error('No models declared in OAuth2Server');
    }

    this.models = Object.keys(this.constructor.models).reduce((obj, key) => {
      const model = this.constructor.models[key];
      model.oauthRef = camelCase(this.constructor.models[key].name);
      model.oauthRefId = `${model.oauthRef}Id`;
      obj[key] = model;
      return obj;
    }, {});

    REQUIRED_MODELS.forEach(model => {
      if (!this.models[model]) {
        throw new Error(`Required '${model}' model missing set in OAuth2Server`);
      }
    });

  }


}

export default OAuth2BaseServer;
