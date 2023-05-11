/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('tickets_history', function(table) {
      table.increments('id').primary();
      table.text('comment');
      table.json('image');
      table.integer('ticket_id');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.integer('created_by_id').notNullable();
      table.string('created_by_name').notNullable();
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('ticket_history');
};
