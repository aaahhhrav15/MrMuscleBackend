// src/models/NutritionPlan.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  food_name: { type: String, required: true },
  quantity:  { type: String, default: '' },
  calories:  { type: Number, default: 0 },
  protein:   { type: Number, default: 0 },
  carbs:     { type: Number, default: 0 },
  fat:       { type: Number, default: 0 },
}, { _id: true });

const MealSchema = new mongoose.Schema({
  meal_type: { type: String, required: true }, // Breakfast/Lunch/...
  time:      { type: String, default: '' },
  calories:  { type: Number, default: 0 },
  items:     { type: [ItemSchema], default: [] },
}, { _id: true });

const NutritionPlanSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  plan_name:      { type: String, required: true },
  total_calories: { type: Number, default: 0 },
  protein_target: { type: Number, default: 0 },
  carbs_target:   { type: Number, default: 0 },
  fat_target:     { type: Number, default: 0 },
  created_date:   { type: Date },
  meals:          { type: [MealSchema], default: [] },
  gymId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', index: true },
}, {
  timestamps: true,
  collection: 'nutritionplans', // use your existing collection name
});

NutritionPlanSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('NutritionPlan', NutritionPlanSchema);
