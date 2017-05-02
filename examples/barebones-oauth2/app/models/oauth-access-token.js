import { Model } from 'lux-framework';

class OauthAccessToken extends Model {

  static belongsTo = {
    user: {
      inverse: 'accessTokens'
    },
    oauthClient: {
      inverse: 'accessTokens'
    }
  };

}

export default OauthAccessToken;
