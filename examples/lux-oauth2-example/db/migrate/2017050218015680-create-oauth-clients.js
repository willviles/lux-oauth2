export function up(schema) {
  return schema.createTable('oauth_clients', table => {
    table.increments('id');

    table.timestamps();

    table.string('client_id')
      .notNullable()
      .index();

    table.string('client_secret')
      .notNullable();

    table.string('redirect_uri');

    table.jsonb('grants');

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('oauth_clients');
}
