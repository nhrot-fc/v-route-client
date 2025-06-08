"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Minus, 
  Plus, 
  Truck, 
  Package, 
  Warehouse as WarehouseIcon, 
  Building, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Ban, 
  Info 
} from "lucide-react"

// Tipos para los elementos del mapa
type MapElement = {
  id: string
  type: "vehicle" | "warehouse" | "customer" | "mainWarehouse" | "package" | "blockedRoad"
  x: number
  y: number
  label: string
  status?: string
  direction?: "north" | "south" | "east" | "west"
  details?: string
}

// Tipo para las rutas
type Route = {
  id: string
  from: string
  to: string
  color: string
  waypoints?: { x: number, y: number }[]
}

// Tipo para carreteras bloqueadas
type BlockedRoad = {
  id: string
  from: { x: number, y: number }
  to: { x: number, y: number }
  label: string
  details: string
}

// Datos de ejemplo para las rutas
const routes: Route[] = [
  { 
    id: "route1", 
    from: "main", 
    to: "c1",
    color: "#10b981",
    waypoints: [
      { x: 10, y: 20 },
      { x: 10, y: 30 },
      { x: 25, y: 30 },
      { x: 25, y: 40 }
    ]
  },
  { 
    id: "route2", 
    from: "main", 
    to: "c3",
    color: "#3b82f6",
    waypoints: [
      { x: 10, y: 20 },
      { x: 20, y: 20 },
      { x: 35, y: 20 },
      { x: 35, y: 25 }
    ]
  },
  { 
    id: "route3", 
    from: "wh2", 
    to: "c2",
    color: "#f59e0b",
    waypoints: [
      { x: 50, y: 15 },
      { x: 50, y: 30 },
      { x: 45, y: 30 }
    ]
  }
]

// Carreteras bloqueadas (ahora como aristas entre nodos)
const blockedRoads: BlockedRoad[] = [
  { 
    id: "block1", 
    from: { x: 20, y: 20 }, 
    to: { x: 20, y: 30 }, 
    label: "Carretera bloqueada", 
    details: "Obras en la vía - Bloqueado hasta 16/05/2025" 
  },
  { 
    id: "block2", 
    from: { x: 40, y: 10 }, 
    to: { x: 50, y: 10 }, 
    label: "Carretera bloqueada", 
    details: "Accidente - Bloqueado temporalmente" 
  },
  { 
    id: "block3", 
    from: { x: 35, y: 25 }, 
    to: { x: 45, y: 25 }, 
    label: "Carretera bloqueada", 
    details: "Mantenimiento - Bloqueado hasta 20/04/2025" 
  }
]

// Datos de ejemplo para el mapa
const mapElements: MapElement[] = [
  { id: "main", type: "mainWarehouse", x: 10, y: 20, label: "Almacén Principal", details: "Capacidad: 5000 paquetes | Ocupación: 73%" },
  { id: "wh1", type: "warehouse", x: 30, y: 40, label: "Almacén Secundario Norte", details: "Capacidad: 2000 paquetes | Ocupación: 45%" },
  { id: "wh2", type: "warehouse", x: 50, y: 15, label: "Almacén Secundario Este", details: "Capacidad: 2500 paquetes | Ocupación: 62%" },
  { id: "v1", type: "vehicle", x: 25, y: 40, label: "ABC-123", status: "en-ruta", direction: "south", details: "Conductor: Juan Pérez | Capacidad: 50 | Carga actual: 32 | Destino: Cliente Norte" },
  { id: "v2", type: "vehicle", x: 35, y: 25, label: "DEF-456", status: "en-ruta", direction: "east", details: "Conductor: María López | Capacidad: 35 | Carga actual: 28 | Destino: Centro Comercial" },
  { id: "v3", type: "vehicle", x: 45, y: 30, label: "STU-901", status: "en-ruta", direction: "west", details: "Conductor: Carlos Ruiz | Capacidad: 40 | Carga actual: 15 | Destino: Las Palmas" },
  { id: "v4", type: "vehicle", x: 10, y: 30, label: "MNO-567", status: "averiado", direction: "north", details: "Conductor: Pedro Gómez | Capacidad: 45 | Carga actual: 0 | AVERIADO: Motor sobrecalentado" },
  { id: "v5", type: "vehicle", x: 15, y: 15, label: "XYZ-789", status: "en-ruta", direction: "east", details: "Conductor: Ana Martínez | Capacidad: 30 | Carga actual: 25 | Destino: Planta Industrial Sur" },
  { id: "v6", type: "vehicle", x: 40, y: 35, label: "GHI-234", status: "en-ruta", direction: "north", details: "Conductor: Luis Rodríguez | Capacidad: 55 | Carga actual: 40 | Destino: Condominio Vista Hermosa" },
  { id: "v7", type: "vehicle", x: 55, y: 20, label: "JKL-567", status: "en-ruta", direction: "south", details: "Conductor: Carmen Sánchez | Capacidad: 45 | Carga actual: 30 | Destino: Empresa Comercial Centro" },
  { id: "c1", type: "customer", x: 25, y: 40, label: "Planta Industrial Norte", details: "Pedidos pendientes: 3 | Última entrega: 08:15" },
  { id: "c2", type: "customer", x: 45, y: 30, label: "Condominio Las Palmas", details: "Pedidos pendientes: 1 | Última entrega: 09:30" },
  { id: "c3", type: "customer", x: 35, y: 25, label: "Empresa Comercial Centro", details: "Pedidos pendientes: 5 | Última entrega: 08:45" },
  { id: "c4", type: "customer", x: 20, y: 10, label: "Planta Industrial Sur", details: "Pedidos pendientes: 2 | Última entrega: 10:15" },
  { id: "c5", type: "customer", x: 15, y: 35, label: "Condominio Vista Hermosa", details: "Pedidos pendientes: 4 | Última entrega: 09:10" },
  { id: "p1", type: "package", x: 25, y: 35, label: "Paquete #4523", details: "Peso: 8kg | Contenido: Repuestos | Destino: Planta Industrial Norte" },
  { id: "p2", type: "package", x: 40, y: 25, label: "Paquete #7842", details: "Peso: 5kg | Contenido: Electrónicos | Destino: Centro Comercial" },
  { id: "p3", type: "package", x: 35, y: 15, label: "Paquete #9156", details: "Peso: 12kg | Contenido: Alimentos | Destino: Las Palmas" },
  { id: "p4", type: "package", x: 10, y: 25, label: "Paquete #1234", details: "Peso: 3kg | Contenido: Documentos | Destino: Empresa Comercial Centro" },
  { id: "p5", type: "package", x: 45, y: 20, label: "Paquete #5678", details: "Peso: 7kg | Contenido: Ropa | Destino: Condominio Vista Hermosa" },
  { id: "p6", type: "package", x: 30, y: 30, label: "Paquete #9012", details: "Peso: 15kg | Contenido: Muebles | Destino: Planta Industrial Sur" },
  { id: "p7", type: "package", x: 15, y: 40, label: "Paquete #3456", details: "Peso: 4kg | Contenido: Electrónicos | Destino: Planta Industrial Norte" },
  { id: "p8", type: "package", x: 50, y: 35, label: "Paquete #7890", details: "Peso: 9kg | Contenido: Alimentos | Destino: Condominio Las Palmas" }
]

export function SimulationMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(15) // Aumentado de 10 a 15 para mayor resolución
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)
  const [hoveredElement, setHoveredElement] = useState<MapElement | null>(null)
  const [selectedBlockedRoad, setSelectedBlockedRoad] = useState<BlockedRoad | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Asegurar que el canvas ocupe el 100% del contenedor
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width, height })
      }
    }

    // Actualizar tamaño inicial
    updateCanvasSize()

    // Actualizar cuando cambie el tamaño de la ventana
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  // Precargar imágenes para iconos
  const [iconsLoaded, setIconsLoaded] = useState(false)
  const iconImages = useRef<Record<string, HTMLImageElement>>({})

  useEffect(() => {
    const loadIcons = async () => {
      // Crear una función para cargar una imagen
      const loadImage = (name: string, src: string): Promise<[string, HTMLImageElement]> => {
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve([name, img])
          img.src = src
          return img
        })
      }

      // Cargar todas las imágenes en paralelo
      const iconPromises = [
        loadImage("warehouse", "/icons/warehouse.svg"),
        loadImage("mainWarehouse", "/icons/main-warehouse.svg"),
        loadImage("package", "/icons/package.svg"),
        loadImage("customer", "/icons/customer.svg"),
        loadImage("vehicleNorth", "/icons/truck-north.svg"),
        loadImage("vehicleSouth", "/icons/truck-south.svg"),
        loadImage("vehicleEast", "/icons/truck-east.svg"),
        loadImage("vehicleWest", "/icons/truck-west.svg"),
        loadImage("blockedRoad", "/icons/blocked-road.svg")
      ]

      try {
        const loadedIcons = await Promise.all(iconPromises)
        const iconMap: Record<string, HTMLImageElement> = {}
        loadedIcons.forEach(([name, img]) => {
          iconMap[name] = img
        })
        iconImages.current = iconMap
        setIconsLoaded(true)
      } catch (error) {
        console.error("Error cargando iconos:", error)
        // Continuar aunque no se carguen los iconos, usaremos formas básicas
        setIconsLoaded(true)
      }
    }

    loadIcons()
  }, [])

  // Dibujar el mapa
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar el tamaño del canvas
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar la cuadrícula
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Dibujar líneas verticales
    for (let x = 0; x <= 70; x++) {
      const canvasX = x * zoom + pan.x
      ctx.beginPath()
      ctx.moveTo(canvasX, pan.y)
      ctx.lineTo(canvasX, 50 * zoom + pan.y)
      ctx.stroke()
    }

    // Dibujar líneas horizontales
    for (let y = 0; y <= 50; y++) {
      const canvasY = y * zoom + pan.y
      ctx.beginPath()
      ctx.moveTo(pan.x, canvasY)
      ctx.lineTo(70 * zoom + pan.x, canvasY)
      ctx.stroke()
    }

    // Dibujar coordenadas en los ejes
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px sans-serif"
    for (let x = 0; x <= 70; x += 5) {
      const canvasX = x * zoom + pan.x
      ctx.fillText(`${x}`, canvasX, pan.y + 15)
    }
    for (let y = 0; y <= 50; y += 5) {
      const canvasY = y * zoom + pan.y
      ctx.fillText(`${y}`, pan.x + 5, canvasY + 4)
    }

    // Dibujar rutas primero para que estén detrás de los elementos
    routes.forEach(route => {
      if (route.waypoints && route.waypoints.length > 1) {
        ctx.strokeStyle = route.color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        // Dibujar la línea entre waypoints
        const startX = route.waypoints[0].x * zoom + pan.x
        const startY = (50 - route.waypoints[0].y) * zoom + pan.y
        ctx.moveTo(startX, startY)
        
        for (let i = 1; i < route.waypoints.length; i++) {
          const x = route.waypoints[i].x * zoom + pan.x
          const y = (50 - route.waypoints[i].y) * zoom + pan.y
          ctx.lineTo(x, y)
        }
        
        ctx.stroke()
        
        // Dibujar pequeñas flechas de dirección en la ruta
        for (let i = 1; i < route.waypoints.length; i++) {
          const prevX = route.waypoints[i-1].x * zoom + pan.x
          const prevY = (50 - route.waypoints[i-1].y) * zoom + pan.y
          const x = route.waypoints[i].x * zoom + pan.x
          const y = (50 - route.waypoints[i].y) * zoom + pan.y
          
          // Punto medio donde dibujar la flecha
          const midX = (prevX + x) / 2
          const midY = (prevY + y) / 2
          
          // Ángulo de la línea
          const angle = Math.atan2(y - prevY, x - prevX)
          
          // Dibujar la flecha
          ctx.save()
          ctx.translate(midX, midY)
          ctx.rotate(angle)
          
          // Triángulo
          ctx.beginPath()
          ctx.moveTo(5, 0)
          ctx.lineTo(-2, 4)
          ctx.lineTo(-2, -4)
          ctx.closePath()
          ctx.fillStyle = route.color
          ctx.fill()
          
          ctx.restore()
        }
      }
    })

    // Dibujar carreteras bloqueadas (ahora como aristas)
    blockedRoads.forEach(road => {
      const fromX = road.from.x * zoom + pan.x
      const fromY = (50 - road.from.y) * zoom + pan.y
      const toX = road.to.x * zoom + pan.x
      const toY = (50 - road.to.y) * zoom + pan.y
      
      // Dibujar la línea bloqueada
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 4
      ctx.setLineDash([5, 5]) // Línea punteada
      ctx.stroke()
      ctx.setLineDash([]) // Restaurar línea sólida
      
      // Dibujar símbolo de prohibido en el punto medio
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      
      // Círculo rojo con símbolo de prohibido
      ctx.beginPath()
      ctx.arc(midX, midY, 12, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)"
      ctx.fill()
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.stroke()

      // Línea diagonal de prohibido
      ctx.beginPath()
      ctx.moveTo(midX - 8, midY - 8)
      ctx.lineTo(midX + 8, midY + 8)
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Dibujar etiqueta si está seleccionada
      if (selectedBlockedRoad?.id === road.id) {
        const textWidth = ctx.measureText(road.label).width
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillRect(midX + 14, midY - 8, textWidth + 8, 16)
        
        ctx.fillStyle = "#1f2937"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(road.label, midX + 18, midY)
      }
    })

    // Dibujar elementos del mapa
    mapElements.forEach((element) => {
      // Skip customer elements - don't render them
      if (element.type === "customer") return;
      
      const x = element.x * zoom + pan.x
      const y = (50 - element.y) * zoom + pan.y // Invertir Y para que 0 esté abajo

      ctx.save()

      const isHighlighted = selectedElement?.id === element.id || hoveredElement?.id === element.id
      const scale = isHighlighted ? 1.2 : 1
      const zoomScale = zoom / 15 // Scale based on zoom level (15 is the default)

      // Dibujar círculo de selección para elementos seleccionados o con hover
      if (isHighlighted) {
        ctx.beginPath()
        ctx.arc(x, y, 22 * scale * zoomScale, 0, Math.PI * 2) // Bigger selection circle
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
        ctx.fill()
      }

      // Intentar usar imagenes cargadas, si no usar formas básicas
      const drawImage = (imageName: string, size: number) => {
        const img = iconImages.current[imageName]
        if (img) {
          const scaledSize = size * scale * zoomScale
          ctx.drawImage(img, x - scaledSize / 2, y - scaledSize / 2, scaledSize, scaledSize)
          return true
        }
        return false
      }

      // Dibujar icono según el tipo
      switch (element.type) {
        case "mainWarehouse":
          if (!drawImage("mainWarehouse", 40)) { // Increased base size
            ctx.fillStyle = "#1e40af"
            ctx.beginPath()
            const scaledSize = 20 * scale * zoomScale
            ctx.rect(x - scaledSize, y - scaledSize, scaledSize * 2, scaledSize * 2)
            ctx.fill()
          }
          break;
        case "warehouse":
          if (!drawImage("warehouse", 36)) { // Increased base size
            ctx.fillStyle = "#3b82f6"
            ctx.beginPath()
            const scaledSize = 18 * scale * zoomScale
            ctx.rect(x - scaledSize, y - scaledSize, scaledSize * 2, scaledSize * 2)
            ctx.fill()
          }
          break;
        case "vehicle":
          const directionMap = {
            "north": "vehicleNorth",
            "south": "vehicleSouth",
            "east": "vehicleEast",
            "west": "vehicleWest"
          }
          const vehicleImage = element.direction ? directionMap[element.direction] : "vehicleEast"
          
          if (!drawImage(vehicleImage, 36)) { // Increased base size
            // Si no hay imagen, usar círculo con flecha direccional
            ctx.fillStyle = element.status === "en-ruta" ? "#10b981" : "#ef4444"
            ctx.beginPath()
            const radius = 15 * scale * zoomScale
            ctx.arc(x, y, radius, 0, Math.PI * 2) // Bigger circle
            ctx.fill()
            
            // Dibujar flecha para dirección
            ctx.beginPath()
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 2 * zoomScale
            
            const arrowSize = 6 * zoomScale
            
            if (element.direction === "north") {
              ctx.moveTo(x, y - arrowSize)
              ctx.lineTo(x, y + arrowSize)
              ctx.moveTo(x - arrowSize * 0.7, y - arrowSize * 0.3)
              ctx.lineTo(x, y - arrowSize)
              ctx.lineTo(x + arrowSize * 0.7, y - arrowSize * 0.3)
            } else if (element.direction === "south") {
              ctx.moveTo(x, y - arrowSize)
              ctx.lineTo(x, y + arrowSize)
              ctx.moveTo(x - arrowSize * 0.7, y + arrowSize * 0.3)
              ctx.lineTo(x, y + arrowSize)
              ctx.lineTo(x + arrowSize * 0.7, y + arrowSize * 0.3)
            } else if (element.direction === "east") {
              ctx.moveTo(x - arrowSize, y)
              ctx.lineTo(x + arrowSize, y)
              ctx.moveTo(x + arrowSize * 0.3, y - arrowSize * 0.7)
              ctx.lineTo(x + arrowSize, y)
              ctx.lineTo(x + arrowSize * 0.3, y + arrowSize * 0.7)
            } else { // west
              ctx.moveTo(x - arrowSize, y)
              ctx.lineTo(x + arrowSize, y)
              ctx.moveTo(x - arrowSize * 0.3, y - arrowSize * 0.7)
              ctx.lineTo(x - arrowSize, y)
              ctx.lineTo(x - arrowSize * 0.3, y + arrowSize * 0.7)
            }
            
            ctx.stroke()
          }
          break;
        case "package":
          if (!drawImage("package", 30)) { // Increased base size
            // Dibujar un cuadrado con una "P"
            ctx.fillStyle = "#8b5cf6"
            ctx.beginPath()
            const scaledSize = 15 * scale * zoomScale
            ctx.rect(x - scaledSize, y - scaledSize, scaledSize * 2, scaledSize * 2)
            ctx.fill()
            
            ctx.fillStyle = "#ffffff"
            ctx.font = `${16 * scale * zoomScale}px sans-serif` // Font size scales with zoom
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("P", x, y)
          }
          break;
      }

      // Dibujar etiquetas para los elementos destacados o si hay hover/selección
      if (isHighlighted || element.type === "mainWarehouse" || element.type === "warehouse") {
        // Fondo semitransparente para la etiqueta
        ctx.font = `${14 * Math.min(zoomScale, 1.5)}px sans-serif` // Scale font with zoom, but with a max
        const textWidth = ctx.measureText(element.label).width
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillRect(x + 18 * zoomScale, y - 10 * zoomScale, textWidth + 10, 20 * zoomScale) // Scale with zoom
        
        // Texto de la etiqueta
        ctx.fillStyle = "#1f2937"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(element.label, x + 23 * zoomScale, y) // Adjusted position
      }

      ctx.restore()
    })
  }, [zoom, pan, selectedElement, hoveredElement, selectedBlockedRoad, canvasSize])

  // Manejar zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 3, 30)) // Aumentado de 2 a 3 y máximo de 20 a 30
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 3, 8)) // Aumentado de 2 a 3 y mínimo de 5 a 8
  }

  // Encontrar elemento en coordenadas
  const findElementAtCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    // Comprobar en todos los elementos
    return mapElements.find((element) => {
      const elementX = element.x * zoom + pan.x
      const elementY = (50 - element.y) * zoom + pan.y
      const distance = Math.sqrt(Math.pow(elementX - x, 2) + Math.pow(elementY - y, 2))
      return distance < 16 // Radio de detección de clic aumentado de 12 a 16
    })
  }

  // Encontrar carretera bloqueada en coordenadas
  const findBlockedRoadAtCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return blockedRoads.find((road) => {
      const fromX = road.from.x * zoom + pan.x
      const fromY = (50 - road.from.y) * zoom + pan.y
      const toX = road.to.x * zoom + pan.x
      const toY = (50 - road.to.y) * zoom + pan.y
      
      // Calcular distancia del punto a la línea
      const A = x - fromX
      const B = y - fromY
      const C = toX - fromX
      const D = toY - fromY
      
      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      
      if (lenSq !== 0) {
        param = dot / lenSq
      }
      
      let xx, yy
      
      if (param < 0) {
        xx = fromX
        yy = fromY
      } else if (param > 1) {
        xx = toX
        yy = toY
      } else {
        xx = fromX + param * C
        yy = fromY + param * D
      }
      
      const dx = x - xx
      const dy = y - yy
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      return distance < 10 // Radio de detección para carreteras bloqueadas
    })
  }

  // Manejar eventos del mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const clickedElement = findElementAtCoordinates(e.clientX, e.clientY)
    const clickedBlockedRoad = findBlockedRoadAtCoordinates(e.clientX, e.clientY)

    if (clickedElement) {
      setSelectedElement(clickedElement)
      setSelectedBlockedRoad(null)
    } else if (clickedBlockedRoad) {
      setSelectedBlockedRoad(clickedBlockedRoad)
      setSelectedElement(null)
    } else {
      setSelectedElement(null)
      setSelectedBlockedRoad(null)
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Actualizar elemento seleccionado en hover
    const hoveredElement = findElementAtCoordinates(e.clientX, e.clientY)
    if (hoveredElement && hoveredElement.id !== selectedElement?.id) {
      setHoveredElement(hoveredElement)
    }
    if (!hoveredElement) {
      setHoveredElement(null)
    }
    // Si está arrastrando, mover el mapa
    if (!isDragging) return

    setPan((prev) => ({
      x: prev.x + (e.clientX - dragStart.x),
      y: prev.y + (e.clientY - dragStart.y),
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div ref={containerRef} className="relative border rounded-md overflow-hidden bg-white h-full w-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false)
          setHoveredElement(null)
        }}
        style={{ cursor: hoveredElement || selectedBlockedRoad ? 'pointer' : isDragging ? 'grabbing' : 'grab' }}
      />

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-sm backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1e40af] rounded-sm"></div>
            <span className="text-xs">Almacén Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3b82f6] rounded-sm"></div>
            <span className="text-xs">Almacén Secundario</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#10b981] rounded-full"></div>
            <span className="text-xs">Vehículo en Ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-full"></div>
            <span className="text-xs">Vehículo Averiado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#8b5cf6] rounded-sm"></div>
            <span className="text-xs">Paquete</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-red-100 border border-red-500">
              <Ban className="h-3 w-3 text-red-500" />
            </div>
            <span className="text-xs">Carretera Bloqueada</span>
          </div>
        </div>
      </div>

      {/* Panel de detalles para elementos seleccionados */}
      {selectedElement && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-md shadow-md border max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm flex items-center gap-1">
              {selectedElement.type === "mainWarehouse" && <WarehouseIcon className="h-4 w-4" />}
              {selectedElement.type === "warehouse" && <Building className="h-4 w-4" />}
              {selectedElement.type === "vehicle" && <Truck className="h-4 w-4" />}
              {selectedElement.type === "customer" && <User className="h-4 w-4" />}
              {selectedElement.type === "package" && <Package className="h-4 w-4" />}
              {selectedElement.label}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setSelectedElement(null)}
            >
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Coordenadas: ({selectedElement.x}, {selectedElement.y})
          </p>
          
          {selectedElement.details && (
            <div className="mt-2 text-xs border-t pt-2">
              <p className="text-muted-foreground">{selectedElement.details}</p>
            </div>
          )}
          
          {selectedElement.type === "vehicle" && (
            <div className="mt-2">
              <Button variant="destructive" size="sm" className="w-full text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Simular Avería
              </Button>
            </div>
          )}
          
          {(selectedElement.type === "customer" || selectedElement.type === "warehouse" || selectedElement.type === "mainWarehouse") && (
            <div className="mt-2">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Info className="mr-1 h-3 w-3" />
                Ver Más Detalles
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Panel de detalles para carreteras bloqueadas */}
      {selectedBlockedRoad && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-md shadow-md border max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm flex items-center gap-1">
              <Ban className="h-4 w-4 text-red-500" />
              {selectedBlockedRoad.label}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setSelectedBlockedRoad(null)}
            >
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Desde: ({selectedBlockedRoad.from.x}, {selectedBlockedRoad.from.y}) 
            Hasta: ({selectedBlockedRoad.to.x}, {selectedBlockedRoad.to.y})
          </p>
          
          {selectedBlockedRoad.details && (
            <div className="mt-2 text-xs border-t pt-2">
              <p className="text-muted-foreground">{selectedBlockedRoad.details}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
