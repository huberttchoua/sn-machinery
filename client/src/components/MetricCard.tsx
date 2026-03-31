import { cn } from '../lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string; // class for color
}

export const MetricCard = ({ label, value, icon: Icon, trend, trendUp, color }: MetricCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-lg bg-opacity-10", color ? `bg-${color}-100 text-${color}-600` : "bg-blue-50 text-blue-600")}>
                    <Icon size={24} />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                        {trend}
                    </span>
                    <span className="text-gray-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
};
