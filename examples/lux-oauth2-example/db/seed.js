import bCrypt from 'bcrypt-nodejs';

import OAuthClient from '../app/models/oauth-client';
import User from '../app/models/user';

export default async function seed(trx) {

  // OAuth Client
  await OAuthClient.transacting(trx).create({
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    grants: JSON.stringify(['password', 'refresh_token'])
  });

  // User
  await User.transacting(trx).create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@user.com',
    password: bCrypt.hashSync('password')
  });

}
