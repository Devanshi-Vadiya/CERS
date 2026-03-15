import React, { useState } from 'react';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { Lock, Phone, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
    const { sendPasswordReset } = useEmergencySystem();
    const [phone, setPhone] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            // 🟢 Overwrites the old password in Firestore
            await sendPasswordReset(phone, newPass);
            setIsDone(true);
        } catch (error) {
            alert("Reset failed. Please verify your phone number.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isDone) {
        return (
            <div className="min-h-screen bg-[#1a1c20] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
                    <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-slate-800">Password Updated</h2>
                    <p className="text-slate-500 mt-2">You can now close this tab and return to the login screen.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1c20] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <ShieldCheck className="text-blue-600" size={32} />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-center text-slate-800 mb-2">Reset Password</h2>
                <p className="text-slate-500 text-center mb-8">Enter your phone number to set a new password.</p>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="relative">
                        <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input
                            required type="tel" placeholder="Registered Phone Number"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input
                            required type="password" placeholder="New Password"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                            value={newPass} onChange={(e) => setNewPass(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input
                            required type="password" placeholder="Confirm New Password"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                            value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;