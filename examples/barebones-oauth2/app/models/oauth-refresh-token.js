import { Model } from 'lux-framework';

class OauthRefreshToken extends Model {

  static belongsTo = {
    user: {
      inverse: 'refreshTokens'
    },
    oauthClient: {
      inverse: 'refreshTokens'
    }
  };

}

export default OauthRefreshToken;
