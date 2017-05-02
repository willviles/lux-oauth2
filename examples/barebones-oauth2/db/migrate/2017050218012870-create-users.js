export function up(schema) {
  return schema.createTable('users', table => {
    table.increments('id');

    table.timestamps();

    table.string('first_name')
      .index()
      .notNullable();

    table.string('last_name')
      .index()
      .notNullable();

    table.string('email')
      .index()
      .notNullable();

    table.string('password');

    table.index('created_at');
    table.index('updated_at');
  });
}

export function down(schema) {
  return schema.dropTable('users');
}
