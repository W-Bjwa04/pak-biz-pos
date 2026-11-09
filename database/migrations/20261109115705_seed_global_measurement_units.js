/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Define your comprehensive localized master retail reference unit registry
  const globalUnits = [
    // Mass & Weight (Taza Wazan / Khula Sauda)
    { shop_id: null, unit_name: 'Kilogram', unit_abbreviation: 'kg' },
    { shop_id: null, unit_name: 'Gram', unit_abbreviation: 'g' },
    { shop_id: null, unit_name: 'Milligram', unit_abbreviation: 'mg' },
    { shop_id: null, unit_name: 'Metric Ton', unit_abbreviation: 'tonne' },

    // Liquid Volumetric Volume (Mabaap / Liquidaat)
    { shop_id: null, unit_name: 'Litre', unit_abbreviation: 'L' },
    { shop_id: null, unit_name: 'Millilitre', unit_abbreviation: 'ml' },

    // Countable Quantities & Groupings (Ginti / Nosh)
    { shop_id: null, unit_name: 'Piece', unit_abbreviation: 'pcs' },
    { shop_id: null, unit_name: 'Dozen', unit_abbreviation: 'doz' },
    { shop_id: null, unit_name: 'Half Dozen', unit_abbreviation: 'half-doz' },
    { shop_id: null, unit_name: 'Pair', unit_abbreviation: 'pair' },
    { shop_id: null, unit_name: 'Set', unit_abbreviation: 'set' },

    // Standard Commercial Packaging (Dabba / Packing)
    { shop_id: null, unit_name: 'Pack', unit_abbreviation: 'pack' },
    { shop_id: null, unit_name: 'Packet', unit_abbreviation: 'pkt' },
    { shop_id: null, unit_name: 'Box', unit_abbreviation: 'box' },
    { shop_id: null, unit_name: 'Carton', unit_abbreviation: 'ctn' },
    { shop_id: null, unit_name: 'Bottle', unit_abbreviation: 'btl' },
    { shop_id: null, unit_name: 'Can', unit_abbreviation: 'can' },
    { shop_id: null, unit_name: 'Jar', unit_abbreviation: 'jar' },
    { shop_id: null, unit_name: 'Bag', unit_abbreviation: 'bag' },
    { shop_id: null, unit_name: 'Sachet', unit_abbreviation: 'sachet' },
    { shop_id: null, unit_name: 'Roll', unit_abbreviation: 'roll' },

    // Local Subcontinental Wholesale Metrics (Desi Wholesale Markets)
    { shop_id: null, unit_name: 'Bora', unit_abbreviation: 'bora' },
    { shop_id: null, unit_name: 'Peti', 'unit_abbreviation': 'peti' },
    { shop_id: null, unit_name: 'Tokri', 'unit_abbreviation': 'tokri' },
    { shop_id: null, unit_name: 'Bundle', 'unit_abbreviation': 'bundle' },
    { shop_id: null, unit_name: 'Tray', 'unit_abbreviation': 'tray' },
    { shop_id: null, unit_name: 'Sack', 'unit_abbreviation': 'sack' }
  ];

  // Batch insert reference units into the database table
  await knex('measurement_units').insert(globalUnits);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Clean rollback: Delete only systemic global configuration rows where shop_id is NULL
  await knex('measurement_units').whereNull('shop_id').del();
};
