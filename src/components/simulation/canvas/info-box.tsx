import React from "react";
import { Group, Rect, Text } from "react-konva";

interface InfoBoxProps {
  title: string;
  details: Array<{ label: string; value: string; color?: string }>;
  color?: string;
  x: number;
  y: number;
  width?: number;
}

/**
 * InfoBox component for showing detailed tooltips on hover
 * Displays a title header and a list of labeled details
 */
export const InfoBox = ({
  title,
  details,
  color = "#1e40af",
  x,
  y,
  width = 200,
}: InfoBoxProps) => {
  const lineHeight = 18;
  const padding = 10;
  const headerHeight = 22;
  const totalHeight = headerHeight + details.length * lineHeight + padding * 2;
  
  return (
    <Group>
      {/* Main container */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={totalHeight}
        fill="rgba(255, 255, 255, 0.95)"
        stroke={color}
        strokeWidth={1}
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={8}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.5}
      />
      
      {/* Title bar */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={headerHeight}
        fill={color}
        cornerRadius={4}
        cornerRadiusBottomLeft={0}
        cornerRadiusBottomRight={0}
      />
      
      <Text
        x={x + padding}
        y={y + 5}
        text={title}
        fontSize={12}
        fontStyle="bold"
        fill="#ffffff"
      />
      
      {/* Details */}
      {details.map((detail, idx) => (
        <React.Fragment key={idx}>
          {/* Label */}
          <Text
            x={x + padding}
            y={y + headerHeight + idx * lineHeight + padding}
            text={`${detail.label}:`}
            fontSize={11}
            fontStyle="bold"
            fill="#4b5563"
          />
          {/* Value */}
          <Text
            x={x + 70 + padding}
            y={y + headerHeight + idx * lineHeight + padding}
            text={detail.value}
            fontSize={11}
            fill={detail.color || "#000000"}
          />
        </React.Fragment>
      ))}
    </Group>
  );
}; 