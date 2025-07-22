interface InfoBoxProps {
  title: string;
  details: Array<{ label: string; value: string; color?: string }>;
  color?: string;
  show: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

/**
 * InfoBox component for showing detailed tooltips using standard HTML/Tailwind
 * Displays a title header and a list of labeled details
 */
export const InfoBox = ({
  title,
  details,
  color = "#1e40af",
  show,
  position = "top-right",
}: InfoBoxProps) => {
  if (!show) return null;
  
  // Position classes based on the position prop
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} z-50 w-72 bg-white/95 rounded-lg shadow-lg border overflow-hidden backdrop-blur-sm`}
      style={{ borderColor: color }}
    >
      {/* Header */}
      <div 
        className="px-3 py-2 text-white text-sm font-medium"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      
      {/* Details */}
      <div className="p-3">
        {details.map((detail, idx) => (
          <div key={idx} className="flex justify-between items-center py-1 text-sm">
            <span className="font-medium text-gray-700">{detail.label}:</span>
            <span 
              className="font-medium" 
              style={{ color: detail.color || "#000000" }}
            >
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}; 