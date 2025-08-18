// src/routes/nutrition.js
const express = require('express');
const NutritionPlan = require('../models/nutritionPlans');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /nutrition/plan
 * Returns the *latest* plan for the authenticated user.
 */
router.get('/plan', auth, async (req, res) => {
  try {
    const match = { user_id: req.userId };
    // If you enforce tenant boundaries, also include: match.gymId = req.userGymId

    const plan = await NutritionPlan.findOne(match).sort({ createdAt: -1 }).lean();
    if (!plan) return res.status(404).json({ error: 'No nutrition plan found' });

    // Compute totals from items (server-side guarantee)
    const totals = (plan.meals || []).reduce((acc, m) => {
      for (const it of (m.items || [])) {
        acc.calories += it.calories || 0;
        acc.protein  += it.protein  || 0;
        acc.carbs    += it.carbs    || 0;
        acc.fat      += it.fat      || 0;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return res.json({
      _id: plan._id,
      plan_name: plan.plan_name,
      targets: {
        calories: plan.total_calories,
        protein:  plan.protein_target,
        carbs:    plan.carbs_target,
        fat:      plan.fat_target,
      },
      totals,
      created_date: plan.created_date,
      meals: (plan.meals || []).map(m => ({
        meal_type: m.meal_type,
        time: m.time,
        calories: m.calories,
        items: (m.items || []).map(i => ({
          food_name: i.food_name,
          quantity: i.quantity,
          calories: i.calories,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat,
        })),
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /nutrition/plans
 * Lists all plans for the authenticated user (debugging / history).
 */
router.get('/plans', auth, async (req, res) => {
  try {
    const match = { user_id: req.userId };
    const plans = await NutritionPlan.find(match).sort({ createdAt: -1 }).lean();
    res.json(plans);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
