exports.up = function(knex) {
    return knex.schema.createTable('tickets', function(table) {
      table.increments('id').primary();
      table.integer('support_type').notNullable();;
      table.integer('support_relatedto').notNullable();;
      table.string('title').notNullable();;
      table.text('description').notNullable();;
      table.text('facing_issue_on').notNullable();;
      table.json('image');
      table.integer('createdBy').notNullable();;
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.enu('status', ['pending', 'inprogress', 'resolved']).notNullable().defaultTo('pending');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('tickets');
  };
  