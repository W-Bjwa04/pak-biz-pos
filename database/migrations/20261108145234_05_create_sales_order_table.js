/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('sales_order', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
        table.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL');
        table.specificType('total_amount', 'NUMERIC(10, 2)').notNullable();
        table.specificType('amount_paid', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
        table.specificType('liability_amount', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
        table.timestamp('payment_date').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTableIfExists('sales_order')
};
