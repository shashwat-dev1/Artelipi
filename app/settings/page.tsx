'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { updateUserProfile, uploadProfilePicture } from '@/lib/firebase/firestore';
import { validateUsername, isUsernameAvailable } from '@/lib/firebase/username';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompletionRing from '@/components/profile/CompletionRing';
import toast from 'react-hot-toast';
import Image from 'next/image';
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

export default function SettingsPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Password change state
    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [longBio, setLongBio] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say' | ''>('');
    const [location, setLocation] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [medium, setMedium] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    const countries = countryList().getData();
    const states = country ? (statesByCountry[country] || []) : [];

    // Load user data
    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setUsername(userData.username || '');
            setBio(userData.bio || '');
            setLongBio(userData.longBio || '');
            setGender(userData.gender || '');
            setLocation(userData.location || '');
            setCountry(userData.country || '');
            setState(userData.state || '');
            setCity(userData.city || '');
            setWebsite(userData.website || '');
            setTwitter(userData.twitter || '');
            setLinkedin(userData.linkedin || '');
            setMedium(userData.medium || '');
            setProfilePicPreview(userData.photoURL || null);
        }
    }, [userData]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setProfilePic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setProfilePic(null);
        setProfilePicPreview(null);
    };

    const handleSave = async () => {
        if (!user) return;

        // Validate username only if it changed
        const currentUsername = userData?.username?.trim().toLowerCase() || '';
        const newUsername = username.trim().toLowerCase();

        if (newUsername !== currentUsername) {
            const validation = validateUsername(newUsername);
            if (!validation.valid) {
                toast.error(validation.error || 'Invalid username');
                return;
            }

            const available = await isUsernameAvailable(newUsername);
            if (!available) {
                toast.error('Username is already taken');
                return;
            }
        }

        setSaving(true);

        try {
            let photoURL: string | null | undefined = userData?.photoURL;

            // Upload profile picture if changed
            if (profilePic) {
                photoURL = await uploadProfilePicture(profilePic, user.uid);
            } else if (profilePicPreview === null) {
                // User removed photo
                photoURL = null;
            }

            // Update profile
            await updateUserProfile(user.uid, {
                name: name.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim().toLowerCase(),
                bio: bio.trim(),
                longBio: longBio.trim(),
                ...(gender && { gender }),
                location: location.trim(),
                country,
                state,
                city: city.trim(),
                website: website.trim(),
                twitter: twitter.trim(),
                linkedin: linkedin.trim(),
                medium: medium.trim(),
                ...(photoURL !== undefined && { photoURL }),
            });

            toast.success('Profile updated successfully!');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!user) return;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setChangingPassword(true);

        try {
            // Re-authenticate user with current password
            const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            toast.success('Password updated successfully!');

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                toast.error('Current password is incorrect');
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error('Please log out and log in again to change your password');
            } else {
                toast.error(error.message || 'Failed to update password');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Settings</h1>
                        <p className="text-gray-600">Manage your profile and account settings</p>
                    </div>

                    {/* Profile Completion */}
                    {userData && userData.profileCompletionPercentage < 100 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <div className="flex items-center gap-6">
                                <CompletionRing
                                    percentage={userData.profileCompletionPercentage}
                                    size={80}
                                    strokeWidth={6}
                                    showPercentage
                                />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        Complete Your Profile ({userData.profileCompletionPercentage}%)
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Add more information to help readers learn about you
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                        {/* Profile Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-6">
                                {profilePicPreview ? (
                                    <Image
                                        src={profilePicPreview}
                                        alt="Profile"
                                        width={100}
                                        height={100}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {userData?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="btn-primary cursor-pointer inline-block text-center">
                                        Upload Photo
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    {profilePicPreview && (
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="btn-secondary text-sm"
                                        >
                                            Remove Photo
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG or GIF. Max size 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username *
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
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Your profile will be at artelipi.com/@{username || 'username'}
                            </p>
                        </div>

                        {/* Short Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                Short Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="A brief description about yourself (shown on cards)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[80px]"
                                maxLength={200}
                            />
                            <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
                        </div>

                        {/* Long Bio */}
                        <div>
                            <label htmlFor="longBio" className="block text-sm font-medium text-gray-700 mb-2">
                                About (Extended Bio)
                            </label>
                            <textarea
                                id="longBio"
                                value={longBio}
                                onChange={(e) => setLongBio(e.target.value)}
                                placeholder="Tell readers more about yourself (shown on profile page)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                                maxLength={700}
                            />
                            <p className="text-xs text-gray-500 mt-1">{longBio.length}/700 characters</p>
                        </div>

                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value as any)}
                                className="input-field"
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
                                    Country
                                </label>
                                <select
                                    id="country"
                                    value={country}
                                    onChange={(e) => {
                                        setCountry(e.target.value);
                                        setState(''); // Reset state when country changes
                                    }}
                                    className="input-field"
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

                        {/* Social Links */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Social Links</h3>

                            {/* Website */}
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    id="website"
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    className="input-field"
                                />
                            </div>

                            {/* Twitter */}
                            <div>
                                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                                    Twitter
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        @
                                    </span>
                                    <input
                                        id="twitter"
                                        type="text"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        placeholder="username"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                                    LinkedIn
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        linkedin.com/in/
                                    </span>
                                    <input
                                        id="linkedin"
                                        type="text"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="username"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Medium */}
                            <div>
                                <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-2">
                                    Medium
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        medium.com/@
                                    </span>
                                    <input
                                        id="medium"
                                        type="text"
                                        value={medium}
                                        onChange={(e) => setMedium(e.target.value)}
                                        placeholder="username"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Change Section */}
                        {user?.email && !user?.providerData?.some(p => p.providerId === 'google.com') && (
                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                                <p className="text-sm text-gray-600">
                                    Update your password to keep your account secure
                                </p>

                                {/* Current Password */}
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="input-field"
                                    />
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                        className="input-field"
                                        minLength={6}
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="input-field"
                                    />
                                </div>

                                {/* Change Password Button */}
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {changingPassword ? 'Changing Password...' : 'Change Password'}
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button
                                onClick={() => router.push('/')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !name.trim() || !username.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
