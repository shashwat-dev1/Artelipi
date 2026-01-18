'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { validateUsername, isUsernameAvailable, generateUsername } from '@/lib/firebase/username';
import toast from 'react-hot-toast';
// @ts-ignore - no types available for this package
import countryList from 'react-select-country-list';

// State data for major countries
const statesByCountry: Record<string, string[]> = {
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Australia': ['New South Wales', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia', 'Australian Capital Territory', 'Northern Territory'],
};

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [saving, setSaving] = useState(false);

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say' | ''>('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');

    const countries = countryList().getData();
    const states = country ? (statesByCountry[country] || []) : [];

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (!loading && user && !user.emailVerified) {
            router.push('/verify-email');
            return;
        }

        if (!loading && userData) {
            // Pre-fill if data exists
            // For Google users, try to split displayName if available
            if (!userData.firstName && !userData.lastName && user?.displayName) {
                const nameParts = user.displayName.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
            } else {
                setFirstName(userData.firstName || '');
                setLastName(userData.lastName || '');
            }

            setUsername(userData.username || generateUsername(user?.displayName || user?.email || 'user'));
            setGender(userData.gender || '');
            setCountry(userData.country || '');
            setState(userData.state || '');
            setCity(userData.city || '');

            // If profile is already complete, redirect to home
            if (userData.firstName && userData.lastName && userData.username) {
                router.push('/');
            }
        }
    }, [user, userData, loading, router]);

    const canSubmit = firstName.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        username.trim().length >= 3 &&
        gender !== '' &&
        country !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !canSubmit) return;

        // Validate username
        const validation = validateUsername(username.trim());
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid username');
            return;
        }

        // Check username availability
        if (username.trim().toLowerCase() !== userData?.username?.toLowerCase()) {
            const available = await isUsernameAvailable(username.trim());
            if (!available) {
                toast.error('Username is already taken');
                return;
            }
        }

        setSaving(true);

        try {
            const displayName = `${firstName.trim()} ${lastName.trim()}`;

            await updateUserProfile(user.uid, {
                name: displayName,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim().toLowerCase(),
                gender,
                country,
                state: state || undefined,
                city: city.trim() || undefined,
            });

            toast.success('Profile completed successfully!');

            // Use window.location to force a full page reload
            // This ensures userData is refreshed before OnboardingWrapper checks it
            window.location.href = '/';
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Just a few more details to get you started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                @
                            </span>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                placeholder="username"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Your profile will be at artelipi.com/{username || 'username'}
                        </p>
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="input-field"
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

                        {/* Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="country"
                                value={country}
                                onChange={(e) => {
                                    setCountry(e.target.value);
                                    setState(''); // Reset state when country changes
                                }}
                                className="input-field"
                                required
                            >
                                <option value="">Select country</option>
                                {countries.map((c: any) => (
                                    <option key={c.value} value={c.label}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State */}
                        {states.length > 0 && (
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                    State/Province
                                </label>
                                <select
                                    id="state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select state/province</option>
                                    {states.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* City */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter your city"
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!canSubmit || saving}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Creating Account...' : 'Create Account'}
                    </button>

                    {!canSubmit && (
                        <p className="text-sm text-red-500 text-center">
                            Please fill in all required fields (*)
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
