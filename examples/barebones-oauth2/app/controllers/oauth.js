import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class OauthController extends Controller {
  params = [
    'grantType',
    'username',
    'password'
  ]

  query = [
    'data'
  ]

  token(request, response) {
    return OAuth2Server.requestToken(request, response);
  }
}

export default OauthController;
