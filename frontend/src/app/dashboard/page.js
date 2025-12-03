// src/app/dashboard/page.js
"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    // UI State
    const [search, setSearch] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');

        if (!token) {
            router.push('/login');
            return;
        }

        setUserEmail(email);
        fetchTasks(token);
    }, []);

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get('https://intern-1u6c.onrender.com/api/tasks', {
                headers: { Authorization: token }
            });

            let allTasks = res.data;
            const now = new Date();

            // AUTO-DETECT MISSED TASKS
            // We check if a task is pending but the date has passed (yesterday or older)
            // We use Promise.all to handle multiple updates efficiently
            await Promise.all(allTasks.map(async (task) => {
                const taskDate = new Date(task.dueDate);
                // Check if date is in the past AND it's not today
                if (task.status === 'pending' && taskDate < now && taskDate.getDate() !== now.getDate()) {
                    // Update Backend
                    await axios.put(`https://intern-1u6c.onrender.com/api/tasks/${task._id}`,
                        { status: 'missed' },
                        { headers: { Authorization: token } }
                    );
                    // Update Local Data immediately so UI reflects it
                    task.status = 'missed';
                }
            }));

            setTasks(allTasks);

        } catch (err) {
            console.error("Error fetching tasks:", err);
            // CRITICAL FIX: If token is invalid (403 or 401), force logout
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                router.push('/login');
            }
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('https://intern-1u6c.onrender.com/api/tasks',
                { title, description, dueDate },
                { headers: { Authorization: token } }
            );
            // Reset Form
            setTitle('');
            setDescription('');
            setDueDate('');
            fetchTasks(token);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`https://intern-1u6c.onrender.com/api/tasks/${id}`,
                { status: newStatus },
                { headers: { Authorization: token } }
            );
            fetchTasks(token);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://intern-1u6c.onrender.com/api/tasks/${id}`, {
                headers: { Authorization: token }
            });
            fetchTasks(token);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    // --- FILTERING & SORTING LOGIC ---

    // 1. Filter by Search (Title)
    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Sort by Date (Earliest deadline at the top)
    const sortedTasks = filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // 3. Split into Categories
    const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
    const completedTasks = sortedTasks.filter(t => t.status === 'completed');
    const missedTasks = sortedTasks.filter(t => t.status === 'missed');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-md z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        Task Manager
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden sm:block font-medium">{userEmail}</span>
                        <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition duration-300">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto w-full p-6">

                {/* ADD TASK FORM */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Create New Task</h2>
                    <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text" placeholder="Task Title (e.g., Complete Report)" required
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            value={title} onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text" placeholder="Description (Optional)"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            type="date" required
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md">
                            + Add Task
                        </button>
                    </form>
                </div>

                {/* SEARCH BAR */}
                <div className="mb-8 relative">
                    <input
                        type="text"
                        placeholder="Search tasks by name..."
                        className="w-full p-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* 3 COLUMN LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. PENDING SECTION */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[300px]">
                        <h3 className="font-bold text-blue-800 mb-4 text-center text-lg bg-blue-100 py-2 rounded-lg shadow-sm">
                            PENDING ({pendingTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingTasks.map(task => (
                                <TaskCard
                                    key={task._id} task={task}
                                    onComplete={() => updateStatus(task._id, 'completed')}
                                    onDelete={() => handleDelete(task._id)}
                                    type="pending"
                                />
                            ))}
                            {pendingTasks.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No pending tasks.</p>}
                        </div>
                    </div>

                    {/* 2. COMPLETED SECTION */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 min-h-[300px]">
                        <h3 className="font-bold text-green-800 mb-4 text-center text-lg bg-green-100 py-2 rounded-lg shadow-sm">
                            COMPLETED ({completedTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {completedTasks.map(task => (
                                <TaskCard
                                    key={task._id} task={task}
                                    onDelete={() => handleDelete(task._id)}
                                    type="completed"
                                />
                            ))}
                            {completedTasks.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No completed tasks yet.</p>}
                        </div>
                    </div>

                    {/* 3. MISSED SECTION */}
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 min-h-[300px]">
                        <h3 className="font-bold text-red-800 mb-4 text-center text-lg bg-red-100 py-2 rounded-lg shadow-sm">
                            MISSED ({missedTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {missedTasks.map(task => (
                                <TaskCard
                                    key={task._id} task={task}
                                    onComplete={() => updateStatus(task._id, 'completed')}
                                    onDelete={() => handleDelete(task._id)}
                                    type="missed"
                                />
                            ))}
                            {missedTasks.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Great! No missed tasks.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Sub-component for individual Task Cards
function TaskCard({ task, onComplete, onDelete, type }) {
    const dateStr = new Date(task.dueDate).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="p-4 rounded-lg shadow-sm border bg-white hover:shadow-md transition duration-200 relative group flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 leading-tight">{task.title}</h4>
            </div>

            {task.description && <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>}

            <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${type === 'missed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                    📅 {dateStr}
                </span>

                <div className="flex gap-2">
                    {/* Show Complete button only for Pending or Missed tasks */}
                    {(type === 'pending' || type === 'missed') && (
                        <button
                            onClick={onComplete}
                            className="text-green-600 hover:text-white hover:bg-green-600 border border-green-200 text-xs font-bold px-3 py-1 rounded transition duration-200"
                            title="Mark as Done"
                        >
                            Done
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 transition duration-200"
                        title="Delete Task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}