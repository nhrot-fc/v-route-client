import { Rect } from "react-konva";

interface ProgressBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  percentage: number;
  color: string;
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
  color,
}: ProgressBarProps) => {
  // Ensure percentage is between 0 and 1
  const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
  
  return (
    <>
      {/* Background bar */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.3)"
        cornerRadius={1}
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