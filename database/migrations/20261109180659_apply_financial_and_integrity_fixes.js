/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // =========================================================================
  // 1. ADD TIMESTAMPS & SOFT-DELETE COLUMNS
  // =========================================================================
  
  await knex.schema.alterTable('product_types', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  await knex.schema.alterTable('products', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable(); // Soft-delete column
  });

  await knex.schema.alterTable('customers', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable(); // Soft-delete column
  });

  await knex.schema.alterTable('order_items', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    
    // =========================================================================
    // 2. ENFORCE NOT-NULL QUANTITY ON ORDER ITEMS
    // =========================================================================
    // Note: If you already have rows with NULL quantities, clean them up or default them to 1 first
    table.decimal('quantity', 12, 3).notNullable().alter();
  });

  // =========================================================================
  // 3. APPLY FINANCIAL INTEGRITY & CHECK CONSTRAINTS
  // =========================================================================
  await knex.schema.raw(`
    -- Products table safeguards
    ALTER TABLE products ADD CONSTRAINT chk_purchase_price_positive CHECK (purchase_price >= 0);
    ALTER TABLE products ADD CONSTRAINT chk_selling_price_positive CHECK (selling_price >= 0);
    ALTER TABLE products ADD CONSTRAINT chk_stock_quantity_positive CHECK (stock_quantity >= 0);

    -- Sales Order mathematical validation rules
    ALTER TABLE sales_order ADD CONSTRAINT chk_total_amount_positive CHECK (total_amount >= 0);
    ALTER TABLE sales_order ADD CONSTRAINT chk_amount_paid_positive CHECK (amount_paid >= 0);
    ALTER TABLE sales_order ADD CONSTRAINT chk_liability_amount_positive CHECK (liability_amount >= 0);
    ALTER TABLE sales_order ADD CONSTRAINT chk_amount_paid_limit CHECK (amount_paid <= total_amount);
    ALTER TABLE sales_order ADD CONSTRAINT chk_liability_calculation CHECK (liability_amount = (total_amount - amount_paid));

    -- Order Items pricing safeguard
    ALTER TABLE order_items ADD CONSTRAINT chk_order_item_quantity_positive CHECK (quantity > 0);
    ALTER TABLE order_items ADD CONSTRAINT chk_unit_price_positive CHECK (unit_price >= 0);

    -- Customer credit safeguard
    ALTER TABLE customers ADD CONSTRAINT chk_current_liability_positive CHECK (current_liability >= 0);
    ALTER TABLE customers ADD CONSTRAINT chk_total_spendings_positive CHECK (total_spendings >= 0);

    -- Liability Payments safeguard
    ALTER TABLE liability_payments ADD CONSTRAINT chk_payment_amount_positive CHECK (amount_paid > 0);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Revert all check constraints
  await knex.schema.raw(`
    ALTER TABLE liability_payments DROP CONSTRAINT IF EXISTS chk_payment_amount_positive;
    
    ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_current_liability_positive;
    ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_total_spendings_positive;

    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_item_quantity_positive;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_unit_price_positive;

    ALTER TABLE sales_order DROP CONSTRAINT IF EXISTS chk_total_amount_positive;
    ALTER TABLE sales_order DROP CONSTRAINT IF EXISTS chk_amount_paid_positive;
    ALTER TABLE sales_order DROP CONSTRAINT IF EXISTS chk_liability_amount_positive;
    ALTER TABLE sales_order DROP CONSTRAINT IF EXISTS chk_amount_paid_limit;
    ALTER TABLE sales_order DROP CONSTRAINT IF EXISTS chk_liability_calculation;

    ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_purchase_price_positive;
    ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_selling_price_positive;
    ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_stock_quantity_positive;
  `);

  // Allow quantity to be nullable again
  await knex.schema.alterTable('order_items', (table) => {
    table.decimal('quantity', 12, 3).nullable().alter();
    table.dropColumn('created_at');
  });

  // Remove columns
  await knex.schema.alterTable('customers', (table) => {
    table.dropColumn('deleted_at');
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('deleted_at');
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('product_types', (table) => {
    table.dropColumn('created_at');
  });
};
