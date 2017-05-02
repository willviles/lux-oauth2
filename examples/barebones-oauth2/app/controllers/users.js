import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class UsersController extends Controller {
  beforeAction = [
    OAuth2Server.authenticatedRoute
  ];
}

export default UsersController;
