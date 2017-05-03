import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class ApplicationController extends Controller {
  beforeAction = [
    OAuth2Server.authenticate
  ];
}

export default ApplicationController;
