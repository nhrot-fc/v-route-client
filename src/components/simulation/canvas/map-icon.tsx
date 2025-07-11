import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface MapIconProps {
  src: string;
  x: number;
  y: number;
  size: number;
}

/**
 * MapIcon component for displaying icons on the simulation canvas
 * Handles image loading and proper positioning
 */
export const MapIcon = ({ src, x, y, size }: MapIconProps) => {
  const [image] = useImage(src);
  return (
    <KonvaImage
      image={image}
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      shadowColor="rgba(0,0,0,0.3)"
      shadowBlur={5}
      shadowOffset={{ x: 2, y: 2 }}
      shadowOpacity={0.5}
    />
  );
}; 