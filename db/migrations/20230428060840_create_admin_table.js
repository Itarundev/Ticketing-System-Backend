/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('admin', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();;
      table.string('mobile_no').notNullable();;
      table.string('email').unique().notNullable();;
      table.string('password').notNullable();;
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
