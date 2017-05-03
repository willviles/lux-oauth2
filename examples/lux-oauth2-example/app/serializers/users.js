import { Serializer } from 'lux-framework';

class UsersSerializer extends Serializer {
  attributes = [
    'firstName',
    'lastName',
    'email'
  ];
  
}

export default UsersSerializer;
