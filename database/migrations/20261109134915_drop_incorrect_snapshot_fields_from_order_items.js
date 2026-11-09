/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Force clear any cached transaction locks on the postgres server side
  await knex.raw('COMMIT;'); 
  await knex.raw('ALTER TABLE "order_items" DROP COLUMN IF EXISTS "unit_snapshot_abbrevation";');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('order_items', (table) => {
    table.string('unit_snapshot_name', 100);
    table.string('unit_snapshot_abbrevation', 20);
  });
};
