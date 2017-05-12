import OAuthServer from 'oauth2-server';
import snakeCase from 'lodash.snakecase';

const { Request } = OAuthServer;

export default class OAuth2Request {
  constructor(request, req = {}) {
    req = Object.assign(Object.create(request), request);

    req.headers = Array.from(request.headers).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

    req.headers['content-type'] = 'application/x-www-form-urlencoded';

    req.body = Object.keys(request.params).reduce((obj, key) => {
      obj[snakeCase(key)] = request.params[key];
      return obj;
    }, {})

    req.query = req.body;

    return new Request(req);
  }
}
