import React from "react";
import { Line, Text } from "react-konva";
import { MAP_X_MIN, MAP_X_MAX, MAP_Y_MIN, MAP_Y_MAX } from "./types";

interface GridProps {
  width: number;
  height: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Grid component for displaying coordinate grid on the canvas
 * Includes axis labels and handles proper positioning based on pan and zoom
 */
export const Grid = ({
  width,
  height,
  cellSize,
  offsetX,
  offsetY,
}: GridProps) => {
  const gridLines = [];
  
  // Vertical lines - only within MAP_X_MIN and MAP_X_MAX range
  for (let i = MAP_X_MIN; i <= MAP_X_MAX; i++) {
    const x = i * cellSize + offsetX;
    if (x < 0 || x > width) continue;
    
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[x, 0, x, height]}
        stroke={i % 5 === 0 ? "#d1d5db" : "#e5e7eb"}
        strokeWidth={i % 5 === 0 ? 0.8 : 0.5}
      />
    );
    
    // Add coordinate labels every 5 units
    if (i % 5 === 0) {
      gridLines.push(
        <Text
          key={`v-text-${i}`}
          x={x}
          y={15}
          text={`${i}`}
          fontSize={10}
          fill="#6b7280"
          align="center"
        />
      );
    }
  }
  
  // Horizontal lines - only within MAP_Y_MIN and MAP_Y_MAX range
  for (let i = MAP_Y_MIN; i <= MAP_Y_MAX; i++) {
    const y = i * cellSize + offsetY;
    if (y < 0 || y > height) continue;
    
    gridLines.push(
      <Line
        key={`h-${i}`}
        points={[0, y, width, y]}
        stroke={i % 5 === 0 ? "#d1d5db" : "#e5e7eb"}
        strokeWidth={i % 5 === 0 ? 0.8 : 0.5}
      />
    );
    
    // Add coordinate labels every 5 units
    if (i % 5 === 0) {
      gridLines.push(
        <Text
          key={`h-text-${i}`}
          x={5}
          y={y - 5}
          text={`${MAP_Y_MAX - i}`} // Show Y values in reverse to match 0 at bottom
          fontSize={10}
          fill="#6b7280"
        />
      );
    }
  }
  
  return <>{gridLines}</>;
}; 