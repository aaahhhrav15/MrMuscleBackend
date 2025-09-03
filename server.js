require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const nutritionRoutes = require('./src/routes/nutrition');
const assignedWorkoutRoutes = require('./src/routes/assignedWorkouts');
const accountabilityRoutes = require('./src/routes/accountability');
const resultsRoutes = require('./src/routes/results');
const reelsRouter = require('./src/routes/reels');
const productsRouter = require('./src/routes/products');
const s3Routes = require('./src/routes/s3');
const gymsRoutes = require('./src/routes/gyms');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Mongo connected to db:', mongoose.connection.name);
    console.log('Mongo uri host:', mongoose.connection.host);
  })
  .catch((e) => { console.error('Mongo error', e); process.exit(1); });


app.get('/health', (_, res) => res.json({ ok: true }));

app.use(morgan('combined'));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/workouts/assigned', assignedWorkoutRoutes);
app.use('/accountability', accountabilityRoutes);
app.use('/results', resultsRoutes);
app.use('/reels', reelsRouter);
app.use('/products', productsRouter);
app.use('/s3', s3Routes);
app.use('/gyms', gymsRoutes);


app.listen(process.env.PORT, () => console.log('API on :' + process.env.PORT));
