import { Text } from "react-konva";

interface ColoredTextProps {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize?: number;
  fontStyle?: string;
  align?: "left" | "center" | "right";
  width?: number;
}

/**
 * ColoredText component for displaying text with colors
 * Handles proper type safety for Text component props
 */
export const ColoredText = ({
  x,
  y,
  text,
  color,
  fontSize = 10,
  fontStyle = "normal",
  align = "left",
  width,
}: ColoredTextProps) => {
  // Handle undefined width to avoid type errors
  const props: Record<string, unknown> = {
    x,
    y,
    text,
    fontSize,
    fontStyle,
    fill: color,
    align,
  };
  
  if (width !== undefined) {
    props.width = width;
  }
  
  return <Text {...props} />;
}; 