'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile, uploadProfilePicture } from '@/lib/firebase/firestore';
import { validateUsername, isUsernameAvailable, generateUsername } from '@/lib/firebase/username';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ProfileOnboardingProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function ProfileOnboarding({ onComplete, onSkip }: ProfileOnboardingProps) {
    const { user, userData } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form data - Required fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    // Optional fields
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
        userData?.photoURL || null
    );

    // Load existing data
    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setUsername(userData.username || generateUsername(userData.name || user?.email || 'user'));
        }
    }, [userData, user]);

    // Check if required fields are filled
    const canProceed = name.trim().length >= 2 && username.trim().length >= 3;

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

    const handleSubmit = async () => {
        if (!user || !canProceed) return;

        // Validate username
        const validation = validateUsername(username.trim());
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid username');
            return;
        }

        // Check username availability (only if different from current)
        if (username.trim().toLowerCase() !== userData?.username?.toLowerCase()) {
            const available = await isUsernameAvailable(username.trim());
            if (!available) {
                toast.error('Username is already taken');
                return;
            }
        }

        setLoading(true);

        try {
            let photoURL = userData?.photoURL;

            // Upload profile picture if provided
            if (profilePic) {
                photoURL = await uploadProfilePicture(profilePic, user.uid);
            }

            // Update profile with required and optional fields
            await updateUserProfile(user.uid, {
                name: name.trim(),
                username: username.trim().toLowerCase(),
                bio: bio.trim(),
                location: location.trim(),
                website: website.trim(),
                twitter: twitter.trim(),
                linkedin: linkedin.trim(),
                photoURL,
            });

            toast.success('Profile updated successfully!');
            onComplete();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        if (!canProceed) {
            toast.error('Please fill in your name and username before continuing');
            return;
        }
        onSkip();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">Complete Your Profile</h2>
                            <p className="text-gray-600 mt-1">
                                {!canProceed ? 'Name and username are required to continue' : 'Tell us about yourself to get the most out of Artelipi'}
                            </p>
                        </div>
                        <button
                            onClick={handleSkip}
                            disabled={!canProceed}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            title={!canProceed ? 'Fill required fields first' : 'Skip for now'}
                        >
                            Skip for now
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6">
                    {/* Name - REQUIRED */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="input-field"
                            required
                        />
                        {name.trim().length > 0 && name.trim().length < 2 && (
                            <p className="text-xs text-red-500 mt-1">Name must be at least 2 characters</p>
                        )}
                    </div>

                    {/* Username - REQUIRED */}
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
                        {username.trim().length > 0 && username.trim().length < 3 && (
                            <p className="text-xs text-red-500 mt-1">Username must be at least 3 characters</p>
                        )}
                    </div>

                    {/* Profile Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Profile Picture
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="relative">
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
                                        {name?.charAt(0).toUpperCase() || userData?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="btn-primary cursor-pointer inline-block">
                                    Upload Photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    JPG, PNG or GIF. Max size 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell readers about yourself in a few sentences..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., San Francisco, CA"
                            className="input-field"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Social Links (Optional)</h3>

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
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex justify-between items-center">
                    <button
                        onClick={handleSkip}
                        disabled={!canProceed}
                        className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        title={!canProceed ? 'Fill required fields first' : ''}
                    >
                        I'll do this later
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !canProceed}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}
