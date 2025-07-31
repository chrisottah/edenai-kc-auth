'use client';
import { useAuth } from '@/app/hooks/useAuth';

export default function HomePage() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-6">Eden AI</h1>
                    <a
                        href="/auth"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Login with KingsChat
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Welcome to Eden AI, {user?.name}!</h1>
                <p className="mb-2">Email: {user?.email}</p>
                <p className="mb-2">Username: @{user?.username}</p>
                {user?.profilePicture && (
                    <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full mx-auto mb-4"
                    />
                )}
                <button
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}