/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

import {faker} from '@faker-js/faker';

export async function seed(knex) {

  // 1. Wipe out existing data records in reverse order to circumvent Foreign Key failures
  await knex('liability_payments').del();
  await knex('order_items').del();
  await knex('sales_order').del();
  await knex('customers').del();
  await knex('products').del();
  await knex('product_types').del();
  await knex('shops').del();

  // 2. Seed a primary localized retail shop instance

  const [shop] = await knex('shops').insert({
    shop_name: 'Bismillah Karyana Store',
    owner_name: 'Kamran Khan',
    address: 'Main Ferozpur Road, Lahore'
  }).returning('*')

  // 3. Define realistic local category types and inventory list lines

  const categoriesData = [
    { type_name: 'Karyana & Grocery' },
    { type_name: 'Beverages & Snacks' },
    { type_name: 'Dairy Products' }
  ]

  for (let category of categoriesData) {
    const [insertedCategory] = await knex('product_types').insert({
      shop_id: shop.id,
      type_name: category.type_name
    }).returning('*')

    // Define items based on category names

    let productNames = []

    if (category.type_name === 'Karyana & Grocery') {
      productNames = ['Tapal Danedar 430g', 'Sugar (1kg)', 'Daal Chana (1kg)', 'Sufi Sunflower Oil 1L'];
    } else if (category.type_name === 'Beverages & Snacks') {
      productNames = ['Pepsi 1.5L', 'Gourmet Cola 2L', 'Lays Masala Big Pack'];
    } else {
      productNames = ['Khula Doodh (1L)', 'Dahi (1kg)', 'Olpers Milk 1L'];
    }

    for (let product of productNames) {
      const purchasePrice = parseFloat(faker.commerce.price({ min: 50, max: 600, dec: 2 }));
      const sellingPrice = parseFloat((purchasePrice * 1.12).toFixed(2)); // 12% Profit 

      await knex('products').insert({
        shop_id: shop.id,
        type_id: insertedCategory.id,
        product_name: product,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        stock_quantity: faker.number.int({ min: 40, max: 150 })
      })
    }
  }

  // 4. Provision dedicated regular customer ledger profiles (Khata Accounts)

  const pakNames = ['Zahid Mahmood', 'Muhammad Asif', 'Tariq Jameel', 'Bilal Ahmed', 'Sajid Ali'];
  const customerIds = [];

  for (let name of pakNames) {
    const [customer] = await knex('customers').insert({
      shop_id: shop.id,
      customer_name: name,
      customer_contact: '0300' + faker.string.numeric(7),
      current_liability: 0.00,
      total_spendings: 0.00
    }).returning('*')

    customerIds.push(customer.id)
  }

  // Fetch all active products to simulate complex basket checkouts
  const products = await knex('products').select('*');

  // 5. SIMULATE MOCK RETAIL CHECKOUT HISTORY

  // We will loop to create 15 historical sales entries spread across random accounts
  for (let i = 0; i < 15; i++) {

    // Pick 1-2 random items for the basket transaction
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = faker.number.int({ min: 1, max: 3 });
    const totalAmount = parseFloat((randomProduct.selling_price * quantity).toFixed(2));

    // 60% probability of a pure Cash sale, 40% probability of an Udhaar/Liability credit sale
    const isCashSale = Math.random() > 0.4;
    const selectedCustomerId = isCashSale ? null : customerIds[Math.floor(Math.random() * customerIds.length)];

    let amountPaid = totalAmount;
    let liabilityAmount = 0.00;

    if (!isCashSale) {
      // Simulate split payment logic: customer pays cash partially, records the rest on their ledger page
      amountPaid = parseFloat((totalAmount * 0.3).toFixed(2));
      liabilityAmount = parseFloat((totalAmount - amountPaid).toFixed(2));
    }

    // Insert master transaction order log
    const [order] = await knex('sales_order').insert({
      shop_id: shop.id,
      customer_id: selectedCustomerId,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      liability_amount: liabilityAmount
    }).returning('*');

    // Insert basket line items
    await knex('order_items').insert({
      order_id: order.id,
      product_id: randomProduct.id,
      quantity: quantity,
      unit_price: randomProduct.selling_price
    });

    // Synchronize current customer running balances if debt was incurred
    if (!isCashSale && selectedCustomerId) {
      await knex('customers')
        .where('id', selectedCustomerId)
        .increment('current_liability', liabilityAmount)
        .increment('total_spendings', totalAmount);
    }
  }

  // 6. SIMULATE KHATA DEBT CLEARANCE VISITS (Udhaar Wapsi Payments)

  // Retrieve debtors who owe more than 0 rupees to simulate partial repayment events
  const debtors = await knex('customers').where('current_liability', '>', 0);

  for (const debtor of debtors) {
    const repaymentAmount = parseFloat((debtor.current_liability * 0.5).toFixed(2)); // Clear 50% of outstanding debt

    await knex('liability_payments').insert({
      shop_id: shop.id,
      customer_id: debtor.id,
      amount_paid: repaymentAmount
    });

    // Deduct exact collected cash from customer metrics profiles
    await knex('customers')
      .where('id', debtor.id)
      .decrement('current_liability', repaymentAmount);
  }

};
