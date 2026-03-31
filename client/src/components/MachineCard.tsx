import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import type { Machine } from '../types';

export const MachineCard = ({ machine, onRent, displayCurrency = 'USD', exchangeRate = 1458.80 }: { machine: Machine, onRent: (id: number) => void, displayCurrency?: 'USD' | 'RWF', exchangeRate?: number }) => {
    const convertUSDtoRWF = (usd: number): number => {
        return Math.round(usd * exchangeRate * 100) / 100;
    };

    return (
        <div className="group bg-white rounded-2xl border border-secondary-100 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/3] bg-secondary-50 overflow-hidden">
                {machine.imageUrl ? (
                    <img
                        src={machine.imageUrl}
                        alt={machine.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100">
                        <span className="text-4xl font-bold opacity-20">SN</span>
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-secondary-700 shadow-sm">
                    {machine.type}
                </div>
                {machine.status !== 'Available' && (
                    <div className="absolute inset-0 bg-secondary-900/50 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-4 py-2 rounded-full font-bold">
                            {machine.status}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-secondary-900 line-clamp-2">{machine.name}</h3>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400 text-xs">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-xs text-secondary-400">4.9 (24 reviews)</span>
                </div>

                <div className="flex items-center gap-4 mb-6 text-sm text-secondary-500">
                    <div className="flex items-center gap-1.5">
                        <Shield size={14} className="text-primary-500" />
                        <span>Insured</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary-500" />
                        <span>Instant Booking</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-secondary-50">
                    <div>
                        <p className="text-xs text-secondary-500 font-medium uppercase tracking-wide">Daily Rate</p>
                        <div className="flex flex-col">
                            {displayCurrency === 'USD' ? (
                                <>
                                    <span className="text-xl font-bold text-primary-600">${machine.dailyRate}<span className="text-sm font-normal text-secondary-400">/day</span></span>
                                    <span className="text-sm font-medium text-secondary-500">RWF {convertUSDtoRWF(machine.dailyRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xl font-bold text-primary-600">RWF {convertUSDtoRWF(machine.dailyRate).toLocaleString('en-US', {maximumFractionDigits: 0})}<span className="text-sm font-normal text-secondary-400">/day</span></span>
                                    <span className="text-sm font-medium text-secondary-500">${machine.dailyRate}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => onRent(machine.id)}
                        disabled={machine.status !== 'Available'}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${machine.status === 'Available'
                            ? 'bg-gray-900 text-white hover:bg-blue-600 shadow-lg shadow-gray-900/20 hover:shadow-blue-600/30'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {machine.status === 'Available' ? 'Rent Now' : 'Unavailable'}
                        {machine.status === 'Available' && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
