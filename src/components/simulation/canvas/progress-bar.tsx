import { Rect } from "react-konva";

interface ProgressBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  percentage?: number;
  value?: number;
  color: string;
  background?: string;
  strokeWidth?: number;
}

/**
 * ProgressBar component for showing percentage-based values
 * Renders a background bar and a filled bar based on percentage
 */
export const ProgressBar = ({
  x,
  y,
  width,
  height,
  percentage,
  value,
  color,
  background = "rgba(0, 0, 0, 0.3)",
  strokeWidth = 0,
}: ProgressBarProps) => {
  // Calculate percentage from value or use provided percentage
  let finalPercentage = percentage;
  if (value !== undefined) {
    finalPercentage = value; // assuming value is already between 0-1
  }
  
  // Ensure percentage is between 0 and 1
  const clampedPercentage = Math.min(Math.max(finalPercentage || 0, 0), 1);
  
  return (
    <>
      {/* Background bar */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={background}
        cornerRadius={1}
        stroke={strokeWidth > 0 ? "rgba(0, 0, 0, 0.15)" : ""}
        strokeWidth={strokeWidth}
      />
      
      {/* Filled bar */}
      <Rect
        x={x}
        y={y}
        width={width * clampedPercentage}
        height={height}
        fill={color}
        cornerRadius={1}
      />
    </>
  );
}; 