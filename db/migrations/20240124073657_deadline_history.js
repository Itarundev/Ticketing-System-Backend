/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('deadline_history', function(table) {
        table.increments('id').primary();
        table.string('ticket_id').notNullable();
        table.string('reason').notNullable();
        table.string('deadline_date').notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('deadline_history');
};
