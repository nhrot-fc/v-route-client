/**
 * Creates a function that converts map coordinates to screen coordinates
 * based on zoom level and pan position
 */
export const createMapToScreenCoords = (
  zoom: number,
  panX: number,
  panY: number
) => {
  return (x: number, y: number) => {
    return {
      x: x * zoom + panX,
      y: y * zoom + panY,
    };
  };
};

/**
 * Formats a percentage value with color coding
 */
export const formatPercentageValue = (current: number, max: number) => {
  const percentage = (current / max) * 100;

  // Get color based on percentage level
  let color;
  if (percentage <= 20) {
    color = "#ef4444"; // red
  } else if (percentage <= 40) {
    color = "#f97316"; // orange
  } else if (percentage <= 60) {
    color = "#eab308"; // yellow
  } else if (percentage <= 80) {
    color = "#10b981"; // green
  } else {
    color = "#3b82f6"; // blue
  }

  return {
    value: percentage,
    color,
    text: `${current.toFixed(1)}/${max.toFixed(1)}`,
    formattedPercentage: `${Math.round(percentage)}%`,
  };
};

/**
 * Calculates the distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Get color based on GLP percentage
 */
export const getGlpColorLevel = (current: number, capacity: number): string => {
  const percentage = (current / capacity) * 100;
  if (percentage <= 20) return "red";
  if (percentage <= 40) return "orange";
  if (percentage <= 60) return "yellow";
  if (percentage <= 80) return "green";
  return "blue";
};

/**
 * Get order size category
 */
export const getOrderSizeCategory = (volume: number): "small" | "medium" | "large" => {
  if (volume <= 5) return "small";
  if (volume <= 15) return "medium";
  return "large";
}; 