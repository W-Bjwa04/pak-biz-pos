/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('order_items', (table) => {
    table.dropColumn('unit_snapshot_name');
    table.dropColumn('unit_snapshot_abbreviation');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Re-add the columns if you ever need to rollback this step later
  await knex.schema.alterTable('order_items', (table) => {
    table.string('unit_snapshot_name', 100);
    table.string('unit_snapshot_abbreviation', 20);
  });
};
