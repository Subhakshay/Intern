// src/app/page.js
"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegistering ? 'http://localhost:5000/api/register' : 'http://localhost:5000/api/login';

        try {
            const res = await axios.post(endpoint, { email, password });
            if (!isRegistering) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userEmail', res.data.email);
                router.push('/dashboard');
            } else {
                alert('Registration successful! Please login.');
                setIsRegistering(false);
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">{isRegistering ? 'Register' : 'Login'}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {isRegistering ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm cursor-pointer text-blue-500" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                </p>
            </div>
        </div>
    );
}