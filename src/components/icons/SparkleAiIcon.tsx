import * as React from "react";

const SparkleAiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={props.width || 24}
    height={props.height || 24}
    style={{ display: "block", margin: "auto" }}
    {...props}
  >
    <defs>
      <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="10%" stopColor="#0070f3" /> {/* Blue */}
        <stop offset="40%" stopColor="#10b981" /> {/* Green */}
        <stop offset="80%" stopColor="#f59e42" /> {/* Orange */}
      </linearGradient>
    </defs>
    <path
      fill="url(#sparkle-gradient)"
      d="M12 2C11 6 8 9 4 10c4 1 7 4 8 8 1-4 4-7 8-8-4-1-7-4-8-8zm6 3c-.5 2-2 3.5-4 4 2 .5 3.5 2 4 4 .5-2 2-3.5 4-4-2-.5-3.5-2-4-4z"
    />
  </svg>
);

export default SparkleAiIcon;
