<img src="https://cloud.githubusercontent.com/assets/2046935/25653846/97a92a0e-2fe6-11e7-9a11-180708ff0f18.png" width="150" height="70">

![Download count all time](https://img.shields.io/npm/dt/lux-oauth2.svg) [![npm](https://img.shields.io/npm/v/lux-oauth2.svg)](https://www.npmjs.com/package/lux-oauth2) [![Gitter](https://img.shields.io/gitter/room/postlight/lux.svg?style=flat-square)](https://gitter.im/postlight/lux)

**Lux OAuth2** is an [OAuth2](https://oauth.net/2/) authentication server & middleware for [Lux](https://github.com/postlight/lux) API framework.

## Install

    $ npm install --save lux-oauth2

## Usage
Lux OAuth2 has been built with extension in mind. More grant types will soon be available out-of-the-box, along with details of how to define your own custom grant types.

**Currently, Lux OAuth2 only supports a `password` with `refresh_token` grant type flow.**

---

### 1. Database
Ready your database with the required models listed below. Check out the [example app](https://github.com/willviles/lux-oauth2/tree/master/examples/barebones-oauth2) for more guidance.

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
Initialize a new OAuth2 server instance. Ensure to add all the required models and any grant types you wish to use.

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

The token endpoint will require a `POST` action. OAuth2 recommends using the `/oauth/token` route.

```js
// app/routes.js
this.resource('oauth', {
  only: []
}, function(){
  this.post('/token', 'token');
});
```

The payload sent to the server must be wrapped in a `data` attribute. The following controller setup allows the parameters through to the controller, where the `requestToken` function is then called.

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
Add the authenticate action to the application controller's `beforeAction` array to ensure the OAuth2 server attempts to authenticate a user for each request.

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

This adds an `oauth2` object to the request, containing an `isAuthenticated` boolean value and the `currentUser`.

```js
console.log(request.oauth2);
// => { isAuthenticated: true, currentUser: User }
```

### 5. Authenticated route
Add the `authenticatedRoute` action to any resource you wish to protect.

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

Keep certain endpoints from requiring authentication using [lux-unless](https://github.com/nickschot/lux-unless).

```js
beforeAction = [
  unless({ path: ['/users/stats'] }, OAuth2Server.authenticatedRoute)
];
```

## Options

### Server Options

The following additional options can be set on the OAuth2 server.

```js
class OAuth2Server extends OAuth2BaseServer {
  accessTokenLifetime = 3600;
  refreshTokenLifetime = 1209600;
}
```

### Overriding methods

If you need to override one of the OAuth2Server's core methods, simply redefine the method in the OAuth2Server.

```js
class OAuth2Server extends OAuth2BaseServer {
  getUser = async (email, password, done) => {
    // add your custom method of retrieving the user...
  }
}
```

### Custom Grant types

Coming soon™...

## Example

    $ cd /examples/barebones-oauth2
    $ npm install
    $ lux db:create && lux db:migrate && lux db:seed
    $ lux serve

Use the [Lux OAuth2 Example Postman Collection](https://github.com/willviles/lux-oauth2/blob/master/examples/barebones-oauth2/test/lux-oauth2-example.postman_collection.json) to check the following:
- Request a token as the test user.
- Try modifying test user `email` & `password` sent to the token endpoint to check credentials errors.
- Use the `refresh_token` value to auth via refresh token.
- Try to access `/users` to find it requires authentication.
- Add `Bearer <YOUR_ACCESS_TOKEN>` to the `Authorization` header to access the `/users` data.

## Tests

    $ npm install
    $ npm test

## Related Modules

- [node-oauth2-server](https://github.com/oauthjs/node-oauth2-server) - OAuth2 server in Node.js.
- [lux-unless](https://github.com/nickschot/lux-unless) - Conditionally skip a middleware.

## License
This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
