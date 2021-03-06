export function up(schema) {
  return schema.createTable('oauth_access_tokens', table => {
    table.increments('id');

    table.timestamps();

    table.string('access_token')
      .notNullable();

    table.dateTime('expires')
      .notNullable();

    table.integer('user_id')
      .notNullable()
      .index();

    table.integer('oauth_client_id')
      .notNullable()
      .index();

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('oauth_access_tokens');
}
