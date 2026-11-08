/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('customers', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('shop_id').notNullable().references('id').inTable('shops').onDelete('CASCADE');
        table.string('customer_name', 100).notNullable();
        table.string('customer_contact', 20);
        table.specificType('current_liability', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
        table.specificType('total_spendings', 'NUMERIC(10, 2)').notNullable().defaultTo(0.00);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTableIfExists('customers')
};
