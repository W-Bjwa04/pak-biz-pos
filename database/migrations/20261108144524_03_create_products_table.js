/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('products', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
        table.uuid('type_id').notNullable().references('id').inTable('product_types');
        table.string('product_name', 150).notNullable();
        table.specificType('purchase_price', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
        table.specificType('selling_price', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
        table.integer('stock_quantity').notNullable().defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTableIfExists('products')
};
