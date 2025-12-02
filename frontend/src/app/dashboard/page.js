// src/app/dashboard/page.js
"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [search, setSearch] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();

    // Fetch tasks on load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        if (!token) return router.push('/');

        setUserEmail(email);
        fetchTasks(token);
    }, []);

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get('http://localhost:5000/api/tasks', {
                headers: { Authorization: token }
            });
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/tasks', { title: newTask }, {
                headers: { Authorization: token }
            });
            setNewTask('');
            fetchTasks(token);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
            headers: { Authorization: token }
        });
        fetchTasks(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    // Filter tasks based on search
    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <nav className="flex justify-between items-center bg-white p-4 shadow mb-6 rounded">
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Hello, {userEmail}</span>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Logout</button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-black">Add New Task</h2>
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Task title..."
                            className="flex-1 p-2 border rounded text-black"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Add</button>
                    </form>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full p-2 border rounded text-black"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {filteredTasks.map(task => (
                        <div key={task._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                            <span className="text-gray-800">{task.title}</span>
                            <button onClick={() => handleDelete(task._id)} className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && <p className="text-center text-gray-500">No tasks found.</p>}
                </div>
            </div>
        </div>
    );
}