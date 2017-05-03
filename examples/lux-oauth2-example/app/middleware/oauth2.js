import { OAuth2BaseServer, OAuth2PasswordGrantType } from 'lux-oauth2';

import OAuthAccessToken from 'app/models/oauth-access-token';
import OAuthClient from 'app/models/oauth-client';
import OAuthRefreshToken from 'app/models/oauth-refresh-token';
import User from 'app/models/user';

class OAuth2Server extends OAuth2BaseServer {
  static models = {
    accessToken: OAuthAccessToken,
    client: OAuthClient,
    refreshToken: OAuthRefreshToken,
    user: User
  };

  static grantTypes = [
    OAuth2PasswordGrantType
  ];

}

export default new OAuth2Server();
