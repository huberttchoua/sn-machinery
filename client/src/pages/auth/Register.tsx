import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { createApiUrl } from '../../lib/api';

const Register = () => {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<'Individual' | 'Business'>('Individual');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        businessEmail: '',
        businessAddress: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: 'Weak',
        color: 'bg-gray-200'
    });

    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const validatePassword = (pass: string) => {
        const reqs = {
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            lower: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        };
        setRequirements(reqs);

        let score = 0;
        if (reqs.length) score++;
        if (reqs.upper) score++;
        if (reqs.lower) score++;
        if (reqs.number) score++;
        if (reqs.special) score++;

        let label = 'Weak';
        let color = 'bg-red-500';

        if (score <= 2) {
            label = 'Weak';
            color = 'bg-red-500';
        } else if (score === 3 || score === 4) {
            label = 'Medium';
            color = 'bg-yellow-500';
        } else if (score === 5) {
            label = 'Strong';
            color = 'bg-green-500';
        }

        if (pass.length === 0) {
            label = '';
            color = 'bg-gray-200';
            score = 0;
        }

        setPasswordStrength({ score, label, color });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (passwordStrength.score < 5) {
            alert("Please ensure password satisfies all strength criteria (Score 5/5).");
            return;
        }

        if (accountType === 'Business' && (!formData.businessName || !formData.businessEmail || !formData.businessAddress)) {
            alert("Please fill in all business information");
            return;
        }

        try {
            const response = await fetch(createApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    accountType,
                    businessName: accountType === 'Business' ? formData.businessName : undefined,
                    businessEmail: accountType === 'Business' ? formData.businessEmail : undefined,
                    businessAddress: accountType === 'Business' ? formData.businessAddress : undefined
                })
            });
            const data = await response.json();

            if (response.ok) {
                // Navigate to verification page with email
                navigate('/verify-email', { state: { email: formData.email } });
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 md:p-12 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">Create Account</h1>
                    <p className="text-secondary-500 mt-2">Join SN Machinery to manage rentals.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Account Type Selection */}
                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-2">Account Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setAccountType('Individual')}
                                className={`p-3 rounded-xl border-2 transition-all font-semibold ${accountType === 'Individual'
                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                    : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                                    }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('Business')}
                                className={`p-3 rounded-xl border-2 transition-all font-semibold ${accountType === 'Business'
                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                    : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                                    }`}
                            >
                                Business
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-secondary-700 block mb-1">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-secondary-700 block mb-1">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-1">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-1">Phone Number</label>
                        <input
                            name="phoneNumber"
                            type="tel"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all pr-12"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-secondary-700 block mb-1">Retype Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Business Fields (Conditional) */}
                    {accountType === 'Business' && (
                        <div className="space-y-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                            <h3 className="font-bold text-secondary-900">Business Information</h3>
                            <div>
                                <label className="text-sm font-bold text-secondary-700 block mb-1">Business Name</label>
                                <input
                                    name="businessName"
                                    type="text"
                                    required={accountType === 'Business'}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="Your Business Name"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-secondary-700 block mb-1">Business Email</label>
                                <input
                                    name="businessEmail"
                                    type="email"
                                    required={accountType === 'Business'}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="business@example.com"
                                    value={formData.businessEmail}
                                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-secondary-700 block mb-1">Business Address</label>
                                <input
                                    name="businessAddress"
                                    type="text"
                                    required={accountType === 'Business'}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="123 Business St, City, Country"
                                    value={formData.businessAddress}
                                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="p-4 bg-secondary-50 rounded-xl space-y-3 border border-secondary-100">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-secondary-500">
                                <span>Strength</span>
                                <span className={`${passwordStrength.label === 'Strong' ? 'text-green-600' :
                                    passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>{passwordStrength.label}</span>
                            </div>
                            <div className="h-2 w-full bg-secondary-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`flex items-center gap-1.5 ${requirements.length ? 'text-green-600' : 'text-secondary-400'}`}>
                                    {requirements.length ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-secondary-300" />}
                                    <span>Min 8 chars</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${requirements.upper ? 'text-green-600' : 'text-secondary-400'}`}>
                                    {requirements.upper ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-secondary-300" />}
                                    <span>Uppercase</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${requirements.lower ? 'text-green-600' : 'text-secondary-400'}`}>
                                    {requirements.lower ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-secondary-300" />}
                                    <span>Lowercase</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${requirements.number ? 'text-green-600' : 'text-secondary-400'}`}>
                                    {requirements.number ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-secondary-300" />}
                                    <span>Number</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${requirements.special ? 'text-green-600' : 'text-secondary-400'}`}>
                                    {requirements.special ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-secondary-300" />}
                                    <span>Symbol</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-[0.98]">
                        Create Account
                    </button>

                    <p className="text-center text-sm text-secondary-500">
                        Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;

