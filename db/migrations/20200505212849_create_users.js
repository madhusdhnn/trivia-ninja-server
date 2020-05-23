exports.up = function (knex) {
   return knex.schema.createTable('users', t => {
      t.string('user_id').primary();
      t.string('username').unique().notNullable();
      t.boolean('is_active').defaultTo(true).notNullable();
      t.string('trivia_api_token').unique('trivia_api_token_unique').notNullable();
      t.dateTime('created_at', {useTz: true}).notNullable();
   });
};

exports.down = function (knex) {
   return knex.schema.dropTable('users');
};
