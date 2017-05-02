export default {
  development: {
    driver: 'sqlite3',
    database: 'barebones_oauth2_dev'
  },

  test: {
    driver: 'sqlite3',
    database: 'barebones_oauth2_test'
  },

  production: {
    driver: 'sqlite3',
    database: 'barebones_oauth2_prod'
  }
};
