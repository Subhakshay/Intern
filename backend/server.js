// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Intern')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- UPDATED MODEL ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String }, 
    dueDate: { type: Date, required: true }, 
    status: { type: String, default: 'pending' }, 
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

// Register & Login 
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

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET);
            res.json({ token, email: user.email });
        } else {
            return res.status(401).send('Invalid password');
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

// Get Tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
    const tasks = await Task.find({ userId: req.user._id});
    res.json(tasks);
});

// Create Task 
app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { title, description, dueDate } = req.body;
    const task = new Task({
        title,
        description,
        dueDate,
        status: 'pending',
        userId: req.user._id,
        Email: req.user.email
    });
    await task.save();
    res.status(201).json(task);
});

// Update Task Status (New Route for Completed/Missed)
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(task);
});

// Delete Task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));