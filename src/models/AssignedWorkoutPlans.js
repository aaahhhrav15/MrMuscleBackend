// src/models/AssignedWorkoutPlan.js
const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  notes:    { type: String, default: '' },
  reps:     { type: Number, required: true },
  restTime: { type: Number, required: true }, // seconds
  sets:     { type: Number, required: true },
}, { _id: true });

const DaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  exercises: { type: [ExerciseSchema], default: [] },
}, { _id: true });

const WeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  days:       { type: [DaySchema], default: [] },
}, { _id: true });

const EmbeddedPlanSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  goal:     { type: String, required: true },
  level:    { type: String, required: true },
  name:     { type: String, required: true },
  weeks:    { type: [WeekSchema], default: [] },
}, { _id: false });

const AssignedWorkoutPlanSchema = new mongoose.Schema({
  gymId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', index: true, required: true },
  memberId:   { type: String, index: true, required: true }, // NOTE: schema uses string here
  memberName: { type: String, default: '' },
  planId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  plan:       { type: EmbeddedPlanSchema, required: true },
  startDate:  { type: Date, required: true },
  status:     { type: String, enum: ['active','paused','completed','cancelled'], default: 'active' },
  notes:      { type: String, default: '' },
}, {
  timestamps: true,
  collection: 'assignedworkoutplans',
});

// Fast “current plan” lookups
AssignedWorkoutPlanSchema.index({ memberId: 1, status: 1, createdAt: -1 });
AssignedWorkoutPlanSchema.index({ memberId: 1, startDate: -1 });

module.exports = mongoose.model('AssignedWorkoutPlan', AssignedWorkoutPlanSchema);
