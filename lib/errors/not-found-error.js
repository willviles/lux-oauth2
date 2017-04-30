import createServerError from './create-server-error';

class NotFoundError extends Error {
  constructor(message) {
    super(message);

    return this;
  }
}

export default createServerError(NotFoundError, 404);
