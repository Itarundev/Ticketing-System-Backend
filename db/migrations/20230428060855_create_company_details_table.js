/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('company_details', function(table) {
      table.increments('id').primary();
      table.string('brand_name');
      table.string('contact_person');
      table.string('project');
      table.string('mobile_no').notNullable();;
      table.json('address');
      table.string('email').unique();
      table.string('password');
      table.boolean('is_admin').defaultTo(false);
      table.integer('created_by_id');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
