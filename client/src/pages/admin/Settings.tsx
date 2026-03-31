import { useMemo, useState } from 'react';
import { Bell, Building2, RotateCcw, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';

type AdminSettings = {
    company: {
        name: string;
        supportEmail: string;
        supportPhone: string;
        address: string;
    };
    notifications: {
        emailAlerts: boolean;
        rentalUpdates: boolean;
        weeklySummary: boolean;
        paymentAlerts: boolean;
    };
    security: {
        loginAlerts: boolean;
        twoFactorRequired: boolean;
        sessionTimeoutMinutes: number;
    };
    preferences: {
        defaultCurrency: 'USD' | 'RWF';
        dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
        autoRefreshSeconds: number;
        exchangeRateRwfPerUsd: number;
    };
};

const STORAGE_KEY = 'adminSettings';

const DEFAULT_SETTINGS: AdminSettings = {
    company: {
        name: 'SN Machinery',
        supportEmail: 'support@snmachinery.com',
        supportPhone: '+250 788 000 000',
        address: 'Kigali, Rwanda'
    },
    notifications: {
        emailAlerts: true,
        rentalUpdates: true,
        weeklySummary: true,
        paymentAlerts: true
    },
    security: {
        loginAlerts: true,
        twoFactorRequired: false,
        sessionTimeoutMinutes: 60
    },
    preferences: {
        defaultCurrency: 'USD',
        dateFormat: 'DD/MM/YYYY',
        autoRefreshSeconds: 30,
        exchangeRateRwfPerUsd: 1458.8
    }
};

const Settings = () => {
    const [settings, setSettings] = useState<AdminSettings>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return DEFAULT_SETTINGS;

        try {
            const parsed = JSON.parse(saved) as AdminSettings;
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
                notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
                security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
                preferences: { ...DEFAULT_SETTINGS.preferences, ...parsed.preferences }
            };
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            return DEFAULT_SETTINGS;
        }
    });
    const [lastSavedAt, setLastSavedAt] = useState<string>('');

    const isDirty = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS) || !!localStorage.getItem(STORAGE_KEY);
    }, [settings]);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setLastSavedAt(new Date().toLocaleString());
        alert('Settings saved successfully.');
    };

    const handleReset = () => {
        if (!confirm('Reset all settings to defaults?')) return;
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
        setLastSavedAt('');
    };

    const toggleNotification = (key: keyof AdminSettings['notifications']) => {
        setSettings((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const toggleSecurity = (key: 'loginAlerts' | 'twoFactorRequired') => {
        setSettings((prev) => ({
            ...prev,
            security: {
                ...prev.security,
                [key]: !prev.security[key]
            }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-2">Manage admin configuration, notifications, and security preferences.</p>
                    {lastSavedAt && <p className="text-xs text-green-600 mt-2">Last saved: {lastSavedAt}</p>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 size={18} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                            <input
                                value={settings.company.name}
                                onChange={(e) => setSettings((prev) => ({ ...prev, company: { ...prev.company, name: e.target.value } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Support Email</label>
                            <input
                                type="email"
                                value={settings.company.supportEmail}
                                onChange={(e) => setSettings((prev) => ({ ...prev, company: { ...prev.company, supportEmail: e.target.value } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Support Phone</label>
                            <input
                                value={settings.company.supportPhone}
                                onChange={(e) => setSettings((prev) => ({ ...prev, company: { ...prev.company, supportPhone: e.target.value } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Address</label>
                            <textarea
                                value={settings.company.address}
                                onChange={(e) => setSettings((prev) => ({ ...prev, company: { ...prev.company, address: e.target.value } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell size={18} className="text-amber-600" />
                        <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            ['emailAlerts', 'Email alerts for important events'],
                            ['rentalUpdates', 'Rental status updates'],
                            ['weeklySummary', 'Weekly summary reports'],
                            ['paymentAlerts', 'Payment and invoice alerts']
                        ].map(([key, label]) => (
                            <label key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                <span className="text-sm text-gray-700">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[key as keyof AdminSettings['notifications']]}
                                    onChange={() => toggleNotification(key as keyof AdminSettings['notifications'])}
                                    className="h-4 w-4"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        <h2 className="text-lg font-bold text-gray-900">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                            <span className="text-sm text-gray-700">Send login alerts</span>
                            <input
                                type="checkbox"
                                checked={settings.security.loginAlerts}
                                onChange={() => toggleSecurity('loginAlerts')}
                                className="h-4 w-4"
                            />
                        </label>
                        <label className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                            <span className="text-sm text-gray-700">Require two-factor authentication</span>
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactorRequired}
                                onChange={() => toggleSecurity('twoFactorRequired')}
                                className="h-4 w-4"
                            />
                        </label>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                min={5}
                                max={240}
                                value={settings.security.sessionTimeoutMinutes}
                                onChange={(e) => setSettings((prev) => ({
                                    ...prev,
                                    security: {
                                        ...prev.security,
                                        sessionTimeoutMinutes: Number(e.target.value || 60)
                                    }
                                }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <SlidersHorizontal size={18} className="text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">System Preferences</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Default Currency</label>
                            <select
                                value={settings.preferences.defaultCurrency}
                                onChange={(e) => setSettings((prev) => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        defaultCurrency: e.target.value as 'USD' | 'RWF'
                                    }
                                }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            >
                                <option value="USD">USD</option>
                                <option value="RWF">RWF</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Date Format</label>
                            <select
                                value={settings.preferences.dateFormat}
                                onChange={(e) => setSettings((prev) => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        dateFormat: e.target.value as AdminSettings['preferences']['dateFormat']
                                    }
                                }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Auto-refresh interval (seconds)</label>
                            <input
                                type="number"
                                min={10}
                                max={300}
                                value={settings.preferences.autoRefreshSeconds}
                                onChange={(e) => setSettings((prev) => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        autoRefreshSeconds: Number(e.target.value || 30)
                                    }
                                }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Exchange Rate (RWF per 1 USD)</label>
                            <input
                                type="number"
                                min={1}
                                step="0.01"
                                value={settings.preferences.exchangeRateRwfPerUsd}
                                onChange={(e) => setSettings((prev) => ({
                                    ...prev,
                                    preferences: {
                                        ...prev.preferences,
                                        exchangeRateRwfPerUsd: Number(e.target.value || DEFAULT_SETTINGS.preferences.exchangeRateRwfPerUsd)
                                    }
                                }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {!isDirty && (
                <div className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg p-3">
                    Settings are currently at default values.
                </div>
            )}
        </div>
    );
};

export default Settings;
