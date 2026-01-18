'use client';

interface CompletionRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
}

export default function CompletionRing({
    percentage,
    size = 120,
    strokeWidth = 8,
    showPercentage = false,
}: CompletionRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Color based on completion
    const getColor = () => {
        if (percentage === 100) return '#10b981'; // green
        if (percentage >= 70) return '#3b82f6'; // blue
        if (percentage >= 40) return '#f59e0b'; // orange
        return '#ef4444'; // red
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>

            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                        {percentage}%
                    </span>
                </div>
            )}
        </div>
    );
}
