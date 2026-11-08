/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('liability_payments', (table) => {
        table.increments('id').primary();
        table.uuid('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
        table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
        table.specificType('amount_paid', 'NUMERIC(10, 2)').notNullable();
        table.timestamp('payment_date').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTableIfExists('liability_payments')
};
