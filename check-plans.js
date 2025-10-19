const Database = require('./control-plane/lib/database');

async function checkPlans() {
  const db = new Database();
  try {
    await db.connect();
    const plans = await db.query('SELECT id, name, price_monthly, price_yearly FROM subscription_plans ORDER BY sort_order');
    console.log('Current subscription plans:');
    plans.forEach(plan => {
      console.log(`${plan.name}: ${plan.price_monthly} monthly / ${plan.price_yearly} yearly`);
    });
    await db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPlans();