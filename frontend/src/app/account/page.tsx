'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) { router.push('/auth/login'); return; }
        usersApi.getProfile().then((res) => {
            const p = res.data.data;
            if (p) {
                setProfile(p);
                setFirstName(p.first_name || '');
                setLastName(p.last_name || '');
                setPhone(p.phone || '');
            }
        }).catch(() => { });
    }, [isAuthenticated, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await usersApi.updateProfile({ firstName, lastName, phone });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // handle error
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="card p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-3xl font-bold">{user?.email?.[0]?.toUpperCase()}</span>
                            </div>
                            <p className="font-semibold text-gray-900">{user?.email}</p>
                            <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-error' : 'badge-success'}`}>
                                {user?.role}
                            </span>
                            <button onClick={handleLogout} className="w-full mt-4 text-sm text-red-500 hover:text-red-700 transition-colors">
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="md:col-span-2">
                        <div className="card p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input id="first-name" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input id="last-name" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input className="input bg-gray-50" value={user?.email || ''} disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                                </div>
                                <button id="save-profile-btn" type="submit" disabled={saving} className={`btn-primary px-8 py-3 ${saved ? 'bg-green-500' : ''}`}>
                                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
