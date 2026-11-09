/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Create the Measurement Units Table
  await knex.schema.createTable('measurement_units', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('shop_id').nullable().references('id').inTable('shops').onDelete('CASCADE');
    table.string('unit_name', 100).notNullable();
    table.string('unit_abbreviation', 20).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 2. Apply Case-Insensitive Partial Unique Indexes using Raw SQL
  await knex.raw(`
    CREATE UNIQUE INDEX unique_global_unit 
    ON measurement_units (LOWER(unit_name)) 
    WHERE shop_id IS NULL;
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX unique_shop_unit 
    ON measurement_units (shop_id, LOWER(unit_name)) 
    WHERE shop_id IS NOT NULL;
  `);

  // 3. Link Products Table (With RESTRICT and NUMERIC(12, 3) Scale calibration)
  await knex.schema.alterTable('products', (table) => {
    // ON DELETE RESTRICT: Prevents a user from deleting a unit if products are actively using it
    table.uuid('unit_id')
      .nullable()
      .references('id')
      .inTable('measurement_units')
      .onDelete('RESTRICT');
      
    // Enlarge precision matrix to safely support massive inventory limits
    table.specificType('stock_quantity', 'NUMERIC(12, 3)').alter().defaultTo(0.000);
  });

  // 4. Link Order Items Table with Historic Text Snapshots & Scale matching
  await knex.schema.alterTable('order_items', (table) => {
    // ON DELETE SET NULL: If a unit is deleted, historic item lines keep their text snapshots intact
    table.uuid('unit_id')
      .nullable()
      .references('id')
      .inTable('measurement_units')
      .onDelete('SET NULL');
      
    table.string('unit_snapshot_name', 100);
    table.string('unit_snapshot_abbreviation', 20);
    table.specificType('quantity', 'NUMERIC(12, 3)').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('order_items', (table) => {
    table.integer('quantity').alter();
    table.dropColumn('unit_snapshot_abbreviation');
    table.dropColumn('unit_snapshot_name');
    table.dropColumn('unit_id');
  });

  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('unit_id');
    table.integer('stock_quantity').alter();
  });

  await knex.schema.dropTableIfExists('measurement_units');
};
