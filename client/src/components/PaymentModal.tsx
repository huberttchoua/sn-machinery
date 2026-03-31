import { X, CreditCard, Lock } from 'lucide-react';

import { useState } from 'react';

export const PaymentModal = ({ amount, onClose, onSuccess }: { amount: number, onClose: () => void, onSuccess: () => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate payment delay
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-gray-900 text-white p-6 pb-20 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">Secure Payment</h3>
                            <p className="text-gray-400 text-sm mt-1">Complete your transaction</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                </div>

                <div className="px-6 -mt-12 relative z-20">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6 text-center">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">Total Amount</p>
                        <p className="text-3xl font-bold text-gray-900">${amount.toLocaleString()}</p>
                    </div>

                    <form onSubmit={handlePay} className="space-y-4 pb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input required type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-gray-900 font-medium placeholder:font-normal" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Expiry</label>
                                <input required type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-gray-900 font-medium placeholder:font-normal" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">CVC</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input required type="text" placeholder="123" className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-gray-900 font-medium placeholder:font-normal" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><span>Pay Now</span> <Lock size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Lock size={10} /> Encrypted and Secure
                    </p>
                </div>
            </div>
        </div>
    );
};
