import { faker } from '@faker-js/faker'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // 1. Wipe out existing data records in strict reverse relational dependency order
  await knex('liability_payments').del();
  await knex('order_items').del();
  await knex('sales_order').del(); // Matched to your precise singular table design
  await knex('customers').del();
  await knex('products').del();
  await knex('product_types').del();
  await knex('shops').del();
  
  // NOTE: We do NOT wipe out 'measurement_units' because they are managed via your master data migration file!

  // 2. Fetch the pre-seeded global measurement units from the database
  const units = await knex('measurement_units').select('*');
  const unitMap = {};
  units.forEach(u => {
    unitMap[u.unit_name.toLowerCase()] = u;
  });

  // Safe structural fallback references matching your data registry strings
  const kgUnit = unitMap['kilogram'] || units[0];
  const litreUnit = unitMap['litre'] || units[0];
  const packUnit = unitMap['pack'] || units[0];

  // 3. Seed the primary localized retail shop context instance
  const [shop] = await knex('shops').insert({
    shop_name: 'Bismillah Karyana Store',
    owner_name: 'Kamran Khan',
    address: 'Main Ferozpur Road, Lahore'
  }).returning('*');

  // 4. Define realistic local category types
  const categoriesData = [
    { type_name: 'Karyana & Grocery' },
    { type_name: 'Beverages & Snacks' },
    { type_name: 'Dairy Products' }
  ];

  for (let category of categoriesData) {
    const [insertedCategory] = await knex('product_types').insert({
      shop_id: shop.id,
      type_name: category.type_name
    }).returning('*');

    // Define items linked directly to their structural relational measurement keys
    let productsWithUnits = [];

    if (category.type_name === 'Karyana & Grocery') {
      productsWithUnits = [
        { name: 'Tapal Danedar 430g', unitObj: packUnit },
        { name: 'Sugar (1kg)', unitObj: kgUnit },
        { name: 'Daal Chana (1kg)', unitObj: kgUnit },
        { name: 'Sufi Sunflower Oil 1L', unitObj: litreUnit }
      ];
    } else if (category.type_name === 'Beverages & Snacks') {
      productsWithUnits = [
        { name: 'Pepsi 1.5L', unitObj: litreUnit },
        { name: 'Gourmet Cola 2L', unitObj: litreUnit },
        { name: 'Lays Masala Big Pack', unitObj: packUnit }
      ];
    } else {
      productsWithUnits = [
        { name: 'Khula Doodh (1L)', unitObj: litreUnit },
        { name: 'Dahi (1kg)', unitObj: kgUnit },
        { name: 'Olpers Milk 1L', unitObj: packUnit }
      ];
    }

    for (let pItem of productsWithUnits) {
      const purchasePrice = parseFloat(faker.commerce.price({ min: 50, max: 600, dec: 2 }));
      const sellingPrice = parseFloat((purchasePrice * 1.12).toFixed(2)); // Realistic 12% retail markup

      await knex('products').insert({
        shop_id: shop.id,
        type_id: insertedCategory.id,
        unit_id: pItem.unitObj.id, // Normalized relation reference
        product_name: pItem.name,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        stock_quantity: faker.number.int({ min: 40, max: 150 })
      });
    }
  }

  // 5. Provision regular customer ledger pages (Khata Directory Profiles)
  const pakNames = ['Zahid Mahmood', 'Muhammad Asif', 'Tariq Jameel', 'Bilal Ahmed', 'Sajid Ali'];
  const customerIds = [];

  for (let name of pakNames) {
    const [customer] = await knex('customers').insert({
      shop_id: shop.id,
      customer_name: name,
      customer_contact: '0300' + faker.string.numeric(7),
      current_liability: 0.00,
      total_spendings: 0.00
    }).returning('*');

    customerIds.push(customer.id);
  }

  // Fetch compiled products database arrays for basket checkouts loop simulation
  const products = await knex('products').select('*');

  // 6. SIMULATE TRANSACTIONS CHECKOUT HISTORY
  for (let i = 0; i < 15; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    // Numeric fractions support real-world loose product metrics sales safely
    const quantity = parseFloat(faker.number.float({ min: 1, max: 3, multipleOf: 0.25 }).toFixed(3));
    const totalAmount = parseFloat((randomProduct.selling_price * quantity).toFixed(2));

    const isCashSale = Math.random() > 0.4;
    const selectedCustomerId = isCashSale ? null : customerIds[Math.floor(Math.random() * customerIds.length)];

    let amountPaid = totalAmount;
    let liabilityAmount = 0.00;

    if (!isCashSale) {
      amountPaid = parseFloat((totalAmount * 0.3).toFixed(2));
      liabilityAmount = parseFloat((totalAmount - amountPaid).toFixed(2));
    }

    const [order] = await knex('sales_order').insert({
      shop_id: shop.id,
      customer_id: selectedCustomerId,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      liability_amount: liabilityAmount
    }).returning('*');

    // Insert purchase item lines matching your minimal target schema parameters
    await knex('order_items').insert({
      order_id: order.id,
      product_id: randomProduct.id,
      unit_id: randomProduct.unit_id, // Normalized tracking mapping reference
      quantity: quantity,
      unit_price: randomProduct.selling_price
    });

    if (!isCashSale && selectedCustomerId) {
      await knex('customers')
        .where('id', selectedCustomerId)
        .increment('current_liability', liabilityAmount)
        .increment('total_spendings', totalAmount);
    }
  }

  // 7. SIMULATE KHATA CREDITS REPAYMENT SETTLEMENT BALANCE VISITS (Udhaar Wapsi)
  const debtors = await knex('customers').where('current_liability', '>', 0);

  for (const debtor of debtors) {
    const repaymentAmount = parseFloat((debtor.current_liability * 0.5).toFixed(2));

    await knex('liability_payments').insert({
      shop_id: shop.id,
      customer_id: debtor.id,
      amount_paid: repaymentAmount
    });

    await knex('customers')
      .where('id', debtor.id)
      .decrement('current_liability', repaymentAmount);
  }
};
