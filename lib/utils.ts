import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date) {
  return `${formatDate(date)} a las ${formatTime(date)}`
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("es-ES").format(number)
}

export function formatCurrency(number: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(number)
}

/**
 * Download data as a CSV file
 * @param data - Array of objects to convert to CSV
 * @param filename - Name for the downloaded file
 */
export function downloadToCSV(data: Record<string, any>[], filename: string) {
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      // For each row, get values in the same order as headers
      headers.map(header => {
        const value = row[header];
        // Handle different value types
        if (value === null || value === undefined) return '';
        
        // Escape quotes and wrap in quotes if it contains commas or quotes
        const cellValue = String(value).replace(/"/g, '""');
        return `"${cellValue}"`;
      }).join(',')
    )
  ].join('\n');
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger the download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
