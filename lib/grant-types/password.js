import OAuth2BaseGrantType from './base';

class OAuth2PasswordGrantType extends OAuth2BaseGrantType {
  static methods = [
    'getAccessToken',
    'getClient',
    'getRefreshToken',
    'getUser',
    'revokeToken',
    'saveToken',
    'validateScope'
  ];

}

export default OAuth2PasswordGrantType;
