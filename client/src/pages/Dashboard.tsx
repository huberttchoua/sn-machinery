import { lazy, Suspense } from 'react';
import { MetricCard } from '../components/MetricCard';
import { Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createApiUrl } from '../lib/api';

const LiveMap = lazy(() => import('../components/LiveMap').then((m) => ({ default: m.LiveMap })));

type Activity = {
    id: number;
    title: string;
    time: string;
};

type MachineRecord = {
    id: number;
    status: string;
};

type RentalRecord = {
    id: number;
    status: string;
    machine?: { name?: string };
    updatedAt?: string;
    createdAt?: string;
};

const DEFAULT_METRICS = {
    totalFleet: '-',
    available: '-',
    activeRentals: '-',
    maintenance: '-'
};

const Dashboard = () => {
    const [metrics, setMetrics] = useState(DEFAULT_METRICS);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [shouldLoadMap, setShouldLoadMap] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            const token = localStorage.getItem('token');

            try {
                const [machinesRes, rentalsRes] = await Promise.all([
                    fetch(createApiUrl('/api/machines')),
                    fetch(createApiUrl('/api/rentals'), {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const machinesData: unknown = machinesRes.ok ? await machinesRes.json() : [];
                const rentalsData: unknown = rentalsRes.ok ? await rentalsRes.json() : [];

                const machines = Array.isArray(machinesData) ? (machinesData as MachineRecord[]) : [];
                const rentals = Array.isArray(rentalsData) ? (rentalsData as RentalRecord[]) : [];

                const totalFleet = machines.length;
                const available = machines.filter(machine => machine.status === 'Available').length;
                const maintenance = machines.filter(machine => machine.status === 'Maintenance').length;
                const activeRentals = rentals.filter(rental => rental.status === 'Active').length;

                setMetrics({
                    totalFleet: String(totalFleet),
                    available: String(available),
                    activeRentals: String(activeRentals),
                    maintenance: String(maintenance)
                });

                const latestActivities = rentals
                    .slice()
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 5)
                    .map((rental) => ({
                        id: rental.id,
                        title: `${rental.machine?.name || 'Machine'} rental is ${rental.status}`,
                        time: rental.updatedAt || rental.createdAt
                            ? new Date(rental.updatedAt || rental.createdAt as string).toLocaleString()
                            : 'Recently'
                    }));

                setActivities(latestActivities);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                setMetrics(DEFAULT_METRICS);
                setActivities([]);
            }
        };

        void loadDashboardData();

        const refreshInterval = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            void loadDashboardData();
        }, 60000);

        const handleFocus = () => {
            void loadDashboardData();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        let timeoutId: number | undefined;

        const requestIdle = (globalThis as { requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number }).requestIdleCallback;
        const cancelIdle = (globalThis as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

        if (typeof requestIdle === 'function') {
            const idleId = requestIdle(() => setShouldLoadMap(true), { timeout: 1500 });
            return () => {
                if (typeof cancelIdle === 'function') {
                    cancelIdle(idleId);
                }
            };
        }

        timeoutId = setTimeout(() => setShouldLoadMap(true), 500);
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. Here is what's happening today.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Total Fleet"
                    value={metrics.totalFleet}
                    icon={Truck}
                    trend=""
                    trendUp={true}
                    color="blue"
                />
                <MetricCard
                    label="Available Machines"
                    value={metrics.available}
                    icon={CheckCircle}
                    trend=""
                    trendUp={false}
                    color="green"
                />
                <MetricCard
                    label="Active Rentals"
                    value={metrics.activeRentals}
                    icon={Clock}
                    trend=""
                    trendUp={true}
                    color="purple"
                />
                <MetricCard
                    label="Maintenance"
                    value={metrics.maintenance}
                    icon={AlertTriangle}
                    color="orange"
                />
            </div>

            {/* Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Live Fleet Tracking</h3>
                    {shouldLoadMap ? (
                        <Suspense fallback={<div className="h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50" />}>
                            <LiveMap />
                        </Suspense>
                    ) : (
                        <div className="h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50" />
                    )}
                </div>

                {/* Recent Activity / Notifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No recent activity to display.</p>
                        ) : (
                            activities.map((a) => (
                                <div key={a.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                                        <p className="text-xs text-gray-500">{a.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
