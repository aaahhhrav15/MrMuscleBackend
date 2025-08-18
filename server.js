require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const nutritionRoutes = require('./src/routes/nutrition');

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

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/nutrition', nutritionRoutes);

app.listen(process.env.PORT, () => console.log('API on :' + process.env.PORT));
