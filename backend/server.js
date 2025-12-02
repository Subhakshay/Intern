// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Intern')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- MODELS ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Task = mongoose.model('Task', TaskSchema);

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// 1. Register
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ email: req.body.email, password: hashedPassword });
        await user.save();
        res.status(201).send('User Registered');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('User not found');

    if (await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET);
        res.json({ token, email: user.email });
    } else {
        res.send('Not Allowed');
    }
});

// 3. Get Tasks (Protected)
app.get('/api/tasks', authenticateToken, async (req, res) => {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
});

// 4. Create Task (Protected)
app.post('/api/tasks', authenticateToken, async (req, res) => {
    const task = new Task({ title: req.body.title, userId: req.user._id });
    await task.save();
    res.status(201).json(task);
});

// 5. Delete Task (Protected)
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));