export default {
  development: {
    driver: 'sqlite3',
    database: 'lux_oauth2_example_dev'
  },

  test: {
    driver: 'sqlite3',
    database: 'lux_oauth2_example_test'
  },

  production: {
    driver: 'sqlite3',
    database: 'lux_oauth2_example_prod'
  }
};
