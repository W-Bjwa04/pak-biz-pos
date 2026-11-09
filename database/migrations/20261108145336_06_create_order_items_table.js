/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('order_items', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('order_id').notNullable().references('id').inTable('sales_order').onDelete('CASCADE');
        table.uuid('product_id').notNullable().references('id').inTable('products');
        table.integer('quantity').notNullable();
        table.specificType('unit_price', 'NUMERIC(10, 2)').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTableIfExists('order_items')
};
