'use client';

export default function LogoutButton() {
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <button onClick={handleLogout} className="text-zinc-400 hover:text-white transition w-full text-left px-4 py-2">
            Logout
        </button>
    );
}
