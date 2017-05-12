import OAuthServer from 'oauth2-server';

const { Response } = OAuthServer;

export default class OAuth2Response {
  constructor(response, res = {}) {
    res = Object.assign(Object.create(response), response);
    return new Response(res);
  }
}
