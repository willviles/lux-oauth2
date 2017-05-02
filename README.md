Lux OAuth2 ![Download count all time](https://img.shields.io/npm/dt/lux-oauth2.svg) [![npm](https://img.shields.io/npm/v/lux-oauth2.svg)](https://www.npmjs.com/package/lux-oauth2)
======

[OAuth2](https://oauth.net/2/) authentication server & middleware for [Lux](https://github.com/postlight/lux) API framework, built upon [node-oauth2-server](https://github.com/oauthjs/node-oauth2-server).

## Install

    $ npm install --save lux-oauth2

## Usage
Lux OAuth2 has been built with extension in mind. More grant types will soon be available out-of-the-box, along with details of how to define your own custom grant types.

**Currently however, Lux OAuth2 only supports a `password` with `refresh_token` grant type flow.**

### 1. Database
Firstly, ready your database with the right tables and columns. The models listed below are required. Check out the [example app](https://github.com/willviles/lux-oauth2/tree/master/examples/barebones-oauth2) for more guidance.

- `user`
([Model](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/app/models/user.js) | [Migration](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/db/migrate/2017050218012870-create-users.js))
- `oauth-access-token`
([Model](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/app/models/oauth-access-token.js) |
[Migration](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/db/migrate/2017050218014329-create-oauth-access-tokens.js))
- `oauth-client`
([Model](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/app/models/oauth-client.js) | [Migration](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/db/migrate/2017050218015680-create-oauth-clients.js) | [Seed](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/db/seed.js#L8-L13))
- `oauth-refresh-token`
([Model](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/app/models/oauth-refresh-token.js) | [Migration](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/db/migrate/2017050218013236-create-oauth-refresh-tokens.js))

### 2. OAuth2 Server
Next, initialize a new OAuth2 server instance. Ensure to pass the server all the required models and `OAuth2PasswordGrantType` in the `grantTypes` array.

```js
// app/middleware/oauth2.js
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
```

### 3. Token route

A `POST` action will be required so the OAuth2 server can spit back a token. OAuth2 recommends using `/oauth/token`, but the `requestToken` action may be called anywhere.

```js
// app/routes.js
this.resource('oauth', {
  only: []
}, function(){
  this.post('/token', 'token');
});
```

Presently, the payload sent to the server must be wrapped in a `data` attribute, with the following controller setup:

```js
// app/controllers/oauth.js
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
```

### 4. Authenticate
The OAuth2 server will attempt to authenticate each request. Add the authenticate action to the ApplicationController's `beforeAction` to ensure it is called first.

```js
import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class ApplicationController extends Controller {
  beforeAction = [
    OAuth2Server.authenticate
  ];
}

export default ApplicationController;
```

The authenticate action adds an `oauth2` object to the `request`, to be used in any action thereafter. For example:

```js
console.log(request.oauth2);
// => { isAuthenticated: true, currentUser: User }
```

### 5. Authenticated route
To put a resource behind an authenticated barrier, simply add the authenticatedRoute action to any resource you wish to protect.

```js
// app/controllers/user.js
import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class UsersController extends Controller {
  beforeAction = [
    OAuth2Server.authenticatedRoute
  ];
}

export default UsersController;
```

Keep certain endpoints from requiring authentication using [lux-unless](https://github.com/nickschot/lux-unless):

```js
// app/controllers/user.js
import { Controller } from 'lux-framework';
import OAuth2Server from 'app/middleware/oauth2';

class UsersController extends Controller {
  beforeAction = [
    unless({ path: ['/users/stats'] }, OAuth2Server.authenticatedRoute)
  ];
}

export default UsersController;
```

## Options

### Server Options

The following additional options can be set on the OAuth2 server:

```js
class OAuth2Server extends OAuth2BaseServer {
  accessTokenLifetime = 3600;
  refreshTokenLifetime = 1209600;
}
```

### Overriding methods

If an edge case arises where the OAuth2 server's default methods need to be overridden, simply redefine the method in the OAuth2Server.

```js
class OAuth2Server extends OAuth2BaseServer {
  getUser = async (email, password, done) => {
    // add your custom method of retrieving the user...
  }
}
```

### Custom Grant types

Coming soon™...

## Related Modules

- [node-oauth2-server](https://github.com/oauthjs/node-oauth2-server) - OAuth2 server in Node.js.
- [lux-unless](https://github.com/nickschot/lux-unless) - Conditionally skip a middleware.

## Tests

    $ npm install
    $ npm test

## License
This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
