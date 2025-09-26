import React from "react";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = "Loading...",
  className = "",
}) => (
  <div
    className={`absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 pointer-events-none ${className}`}
  >
    <svg
      className="animate-spin h-6 w-6 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
    <span className="ml-2 text-blue-600 text-xs font-semibold">{label}</span>
  </div>
);

export default LoadingSpinner;
