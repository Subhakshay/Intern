// src/app/page.js
import Link from 'next/link';

export default function LandingPage() {
    // You can replace this URL with any image from your public folder later
    const imageUrl = "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

            {/* Main Container - Flex Column on Mobile, Row on Desktop */}
            <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Left Section (Text Content) */}
                <div className="w-full md:w-1/2 text-center md:text-left">

                    {/* 1. Title */}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight">
                        Welcome to <br />
                        <span className="text-blue-600">Task Manager</span>
                    </h1>

                    {/* 2. MOBILE IMAGE (Visible on Mobile only, hidden on md screens) */}
                    <div className="block md:hidden mb-8">
                        <img
                            src={imageUrl}
                            alt="Task Management Mobile"
                            className="w-full max-w-sm mx-auto rounded-xl shadow-lg rotate-2 hover:rotate-0 transition duration-500"
                        />
                    </div>

                    {/* 3. Description */}
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                        Streamline your workflow, manage your daily goals, and boost your productivity with our secure and intuitive platform.
                    </p>

                    {/* 4. Buttons */}
                    <div className="flex gap-4 justify-center md:justify-start">
                        <Link href="/login">
                            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition transform hover:-translate-y-1">
                                Login
                            </button>
                        </Link>
                        <Link href="/signup">
                            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md border border-blue-200 hover:bg-gray-50 transition transform hover:-translate-y-1">
                                Sign Up
                            </button>
                        </Link>
                    </div>

                    <div className="mt-8 text-sm text-gray-500 font-medium">
                        Want to track your tasks? Get started today.
                    </div>
                </div>

                {/* Right Section (DESKTOP IMAGE - Hidden on Mobile, Visible on md screens) */}
                <div className="hidden md:block w-full md:w-1/2">
                    <img
                        src={imageUrl}
                        alt="Task Management Desktop"
                        className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition duration-700 border-4 border-white"
                    />
                </div>

            </div>
        </div>
    );
}