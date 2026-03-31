import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(createApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Ask app to show splash after navigation
                localStorage.setItem('showSplashNext', 'true');

                // Redirect based on role
                if (data.user.role === 'Admin') {
                    navigate('/admin');
                } else {
                    navigate('/customer');
                }
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-12 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="bg-secondary-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">Welcome Back</h1>
                    <p className="text-secondary-500 mt-2">Sign in to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-secondary-900 focus:ring-2 focus:ring-secondary-900/10 outline-none transition-all"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-bold text-secondary-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-primary-600 hover:underline">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-secondary-900 focus:ring-2 focus:ring-secondary-900/10 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="w-full bg-secondary-900 hover:bg-secondary-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-secondary-900/20 transition-all transform active:scale-[0.98]">
                        Sign In
                    </button>

                    <p className="text-center text-sm text-secondary-500">
                        Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
