// src/routes/assignedWorkouts.js
const express = require('express');
const AssignedWorkoutPlan = require('../models/AssignedWorkoutPlans');
const auth = require('../middleware/auth');

const router = express.Router();

/** Helper: base match for this user (and gym if present) */
function baseMatch(req) {
  const match = { memberId: String(req.userId) };
  if (req.userGymId) match.gymId = req.userGymId;
  return match;
}

/**
 * GET /workouts/assigned/plan
 * Latest *active* assigned plan for the logged-in user.
 * Fallback: if no active, returns latest by createdAt.
 */
router.get('/plan', auth, async (req, res) => {
  try {
    const match = baseMatch(req);

    // Prefer "active". If none, fallback to latest any-status document.
    let doc = await AssignedWorkoutPlan.findOne({ ...match, status: 'active' })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    if (!doc) {
      doc = await AssignedWorkoutPlan.findOne(match).sort({ createdAt: -1 }).lean();
    }
    if (!doc) return res.status(404).json({ error: 'No assigned workout plan found for user, please contact the trainer for assistance.' });

    return res.json({
      _id: doc._id,
      gymId: doc.gymId,
      memberId: doc.memberId,
      memberName: doc.memberName,
      planId: doc.planId,
      startDate: doc.startDate,
      status: doc.status,
      plan: doc.plan, // includes name, goal, level, duration, weeks[...]
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      notes: doc.notes || ''
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /workouts/assigned/plans
 * All assigned plans for this user (newest first).
 * Optional query: ?status=active|paused|completed|cancelled  & ?limit=&skip=
 */
router.get('/plans', auth, async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;
    const match = baseMatch(req);
    if (status) match.status = status;

    const docs = await AssignedWorkoutPlan.find(match)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 100))
      .select('_id gymId memberId memberName planId status startDate createdAt updatedAt plan.name plan.goal plan.level plan.duration')
      .lean();

    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /workouts/assigned/week/:weekNumber
 * Week from the user's current (latest active) assigned plan.
 */
router.get('/week/:weekNumber', auth, async (req, res) => {
  try {
    const weekNumber = Number(req.params.weekNumber);
    const match = baseMatch(req);

    let doc = await AssignedWorkoutPlan.findOne({ ...match, status: 'active' })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
    if (!doc) doc = await AssignedWorkoutPlan.findOne(match).sort({ createdAt: -1 }).lean();
    if (!doc) return res.status(404).json({ error: 'No assigned plan found' });

    const week = (doc.plan?.weeks || []).find(w => Number(w.weekNumber) === weekNumber);
    if (!week) return res.status(404).json({ error: 'Week not found' });

    res.json({
      assignedId: doc._id,
      planId: doc.planId,
      planMeta: {
        name: doc.plan?.name,
        goal: doc.plan?.goal,
        level: doc.plan?.level,
        duration: doc.plan?.duration
      },
      week
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /workouts/assigned/day/:weekNumber/:dayNumber
 * Day’s exercises from the user's current (latest active) assigned plan.
 */
router.get('/day/:weekNumber/:dayNumber', auth, async (req, res) => {
  try {
    const weekNumber = Number(req.params.weekNumber);
    const dayNumber  = Number(req.params.dayNumber);
    const match = baseMatch(req);

    let doc = await AssignedWorkoutPlan.findOne({ ...match, status: 'active' })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
    if (!doc) doc = await AssignedWorkoutPlan.findOne(match).sort({ createdAt: -1 }).lean();
    if (!doc) return res.status(404).json({ error: 'No assigned plan found' });

    const week = (doc.plan?.weeks || []).find(w => Number(w.weekNumber) === weekNumber);
    if (!week) return res.status(404).json({ error: 'Week not found' });

    const day = (week.days || []).find(d => Number(d.dayNumber) === dayNumber);
    if (!day) return res.status(404).json({ error: 'Day not found' });

    res.json({
      assignedId: doc._id,
      planId: doc.planId,
      planMeta: {
        name: doc.plan?.name,
        goal: doc.plan?.goal,
        level: doc.plan?.level,
        duration: doc.plan?.duration
      },
      weekNumber,
      dayNumber,
      exercises: day.exercises || []
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
