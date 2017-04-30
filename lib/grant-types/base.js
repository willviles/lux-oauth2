import snakeCase from 'lodash.snakecase';

class OAuth2BaseGrantType {
  constructor() {
    const id = new RegExp(/^(OAuth2)(.*)(GrantType)/).exec(this.constructor.name)[2];
    if (!id) {
      throw new Error(`Please follow the OAuth2 naming convention of 'OAuth2<name>GrantType'`);
    }
    this.id = snakeCase(id);
  }

}

export default OAuth2BaseGrantType;
