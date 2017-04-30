# lux-oauth2
OAuth2 authentication middleware for [Lux](https://github.com/postlight/lux) API framework.

## Install

    $ npm install --save lux-oauth2

## Usage
An example usage of using lux-oauth2 is shown below.

```javascript
import { Controller } from 'lux-framework';
import oauth2 from 'lux-oauth2';

class ApplicationController extends Controller {
  beforeAction = [
    oauth2
  ];
}
```

[lux-unless](https://github.com/nickschot/lux-unless) can be used to keep certain endpoints from being authorized by lux-oauth2.

```javascript
import { Controller } from 'lux-framework';
import oauth2 from 'lux-oauth2';
import unless from 'lux-unless';

class ApplicationController extends Controller {
  beforeAction = [
    unless({ path: ['/users/login'] }, oauth2)
  ];
}
```

## Options

## Related Modules

- [node-oauth2-server](https://github.com/oauthjs/node-oauth2-server) - OAuth2 server in Node.js.
- [lux-unless](https://github.com/nickschot/lux-unless) - Conditionally skip a middleware.

## Tests

    $ npm install
    $ npm test

## License
This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
