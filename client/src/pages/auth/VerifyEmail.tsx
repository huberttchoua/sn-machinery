import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    
    // Redirect if direct access without email
    if (!email) {
        // Maybe redirect to login or show error?
        // navigate('/login'); 
        // For now, let's keep it but show empty or instructions
    }

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => /^\d$/.test(char))) {
             const newCode = [...code];
             pastedData.forEach((char, index) => {
                 if (index < 6) newCode[index] = char;
             });
             setCode(newCode);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(createApiUrl('/api/auth/verify-email'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            });
            
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Wait a moment for success animation
                setTimeout(() => {
                    navigate('/customer'); // Or based on role
                }, 1000);
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-12 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-secondary-900">Verify Your Email</h1>
                    <p className="text-secondary-500 mt-2">
                        We sent a code to <span className="font-semibold text-secondary-800">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-secondary-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button 
                        disabled={isLoading}
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Verifying...' : (
                            <>
                                Verify Email <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    
                    <div className="text-center">
                        <p className="text-sm text-secondary-500">
                            Didn't receive code? <button type="button" className="text-primary-600 font-bold hover:underline">Resend</button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
