import { Model } from 'lux-framework';

class OauthClient extends Model {

  static hasMany = {
    accessTokens: {
      model: 'oauthAccessToken',
      inverse: 'oauthClient'
    },
    refreshTokens: {
      model: 'oauthRefreshToken',
      inverse: 'oauthClient'
    }
  };
  
}

export default OauthClient;
