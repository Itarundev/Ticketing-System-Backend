exports.up = function(knex) {
    return knex.schema.createTable('tickets', function(table) {
      table.increments('id').primary();
      table.string('project_name').index();
      table.string('support_type').notNullable();
      table.string('support_related_to').notNullable();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.string('facing_issue_on').notNullable;
      table.json('image');
      table.integer('created_by_id').notNullable();
      table.string('created_by_name').notNullable().index();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.enu('status', ['Pending', 'In Progress', 'Resolved']).notNullable().defaultTo('Pending');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('tickets');
  };
  