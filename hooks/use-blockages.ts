import { useState, useEffect, useCallback } from 'react'
import { blockagesApi, type Blockage, Position } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define an interface that combines the old field names with the new ones for transition
interface BlockageWithLegacyFields extends Blockage {
  startNode?: { x: number; y: number; }; // Legacy field
  endNode?: { x: number; y: number; }; // Legacy field
}

// Define pagination parameters
interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  direction?: string;
}

export function useBlockages(paginationParams?: PaginationParams) {
  const [blockages, setBlockages] = useState<BlockageWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast()

  // Extract pagination values to use in dependencies
  const page = paginationParams?.page;
  const size = paginationParams?.size;
  const sortBy = paginationParams?.sortBy;
  const direction = paginationParams?.direction;

  const fetchBlockages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Set up pagination parameters
      const isPaginated = !!paginationParams;
      const { page, size, sortBy, direction } = paginationParams || { page: 0, size: 10 };
      
      const response = await blockagesApi.list5(undefined, undefined, undefined, isPaginated, page, size, sortBy, direction)
      
      const responseData = response.data;
      
      // Handle paginated response
      if (isPaginated && responseData && typeof responseData === 'object' && 'content' in responseData) {
        const { content, totalElements, totalPages: pages } = responseData as { content: Blockage[]; totalElements: number; totalPages: number };
        
        // Convert the line points to start and end nodes for compatibility
        const mappedBlockages = content.map((blockage: Blockage) => {
          // Create a blockage with legacy fields
          const blockageWithLegacy: BlockageWithLegacyFields = {
            ...blockage
          }
          
          // Parse linePoints if available to extract start and end nodes
          if (blockage.linePoints) {
            try {
              const points = blockage.linePoints.split('-')
              if (points.length === 2) {
                const startCoords = points[0].split(',')
                const endCoords = points[1].split(',')
                
                if (startCoords.length === 2 && endCoords.length === 2) {
                  blockageWithLegacy.startNode = {
                    x: parseFloat(startCoords[0]),
                    y: parseFloat(startCoords[1])
                  }
                  
                  blockageWithLegacy.endNode = {
                    x: parseFloat(endCoords[0]),
                    y: parseFloat(endCoords[1])
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing blockage line points:', e)
            }
          }
          
          return blockageWithLegacy
        });
        
        setBlockages(mappedBlockages);
        setTotalItems(totalElements || content.length);
        setTotalPages(pages || 1);
      } else {
        // Handle non-paginated response (backward compatibility)
        const blockagesData = Array.isArray(responseData) ? responseData : [responseData].filter(Boolean)
        const mappedBlockages = blockagesData.map(blockage => {
          // Create a blockage with legacy fields
          const blockageWithLegacy: BlockageWithLegacyFields = {
            ...blockage
          }
          
          // Parse linePoints if available to extract start and end nodes
          if (blockage.linePoints) {
            try {
              const points = blockage.linePoints.split('-')
              if (points.length === 2) {
                const startCoords = points[0].split(',')
                const endCoords = points[1].split(',')
                
                if (startCoords.length === 2 && endCoords.length === 2) {
                  blockageWithLegacy.startNode = {
                    x: parseFloat(startCoords[0]),
                    y: parseFloat(startCoords[1])
                  }
                  
                  blockageWithLegacy.endNode = {
                    x: parseFloat(endCoords[0]),
                    y: parseFloat(endCoords[1])
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing blockage line points:', e)
            }
          }
          
          return blockageWithLegacy
        });
        
        setBlockages(mappedBlockages);
        setTotalItems(mappedBlockages.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar bloqueos'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, size, sortBy, direction, toast])

  useEffect(() => {
    fetchBlockages()
  }, [fetchBlockages])

  const createBlockage = async (blockageData: Partial<BlockageWithLegacyFields>) => {
    try {
      // Convert from old format to new format if necessary
      const newBlockageData: Partial<Blockage> = { ...blockageData }
      
      // If startNode and endNode are provided, convert to linePoints format
      if (blockageData.startNode && blockageData.endNode) {
        newBlockageData.linePoints = `${blockageData.startNode.x},${blockageData.startNode.y}-${blockageData.endNode.x},${blockageData.endNode.y}`
        
        // Also create the lines array for the API
        newBlockageData.lines = [
          { x: blockageData.startNode.x, y: blockageData.startNode.y } as Position,
          { x: blockageData.endNode.x, y: blockageData.endNode.y } as Position
        ]
      }
      
      const response = await blockagesApi.create5(newBlockageData as Blockage)
      await fetchBlockages() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Bloqueo creado exitosamente',
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear bloqueo'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const deleteBlockage = async (id: string) => {
    try {
      await blockagesApi.delete4(id)
      await fetchBlockages() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Bloqueo eliminado exitosamente',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar bloqueo'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const updateBlockage = async (id: string, blockageData: Partial<BlockageWithLegacyFields>) => {
    try {
      // Convert from old format to new format if necessary
      const newBlockageData: Partial<Blockage> = { ...blockageData }
      
      // If startNode and endNode are provided, convert to linePoints format
      if (blockageData.startNode && blockageData.endNode) {
        newBlockageData.linePoints = `${blockageData.startNode.x},${blockageData.startNode.y}-${blockageData.endNode.x},${blockageData.endNode.y}`
        
        // Also create the lines array for the API
        newBlockageData.lines = [
          { x: blockageData.startNode.x, y: blockageData.startNode.y } as Position,
          { x: blockageData.endNode.x, y: blockageData.endNode.y } as Position
        ]
      }
      
      const response = await blockagesApi.update3(id, newBlockageData as Blockage)
      await fetchBlockages() // Refresh the list
      toast({
        title: 'Éxito',
        description: 'Bloqueo actualizado exitosamente',
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar bloqueo'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  const createBulkBlockages = async (blockagesData: Partial<BlockageWithLegacyFields>[]) => {
    try {
      // Convert all blockages from old format to new format if necessary
      const blockageDTOs = blockagesData.map(blockageData => {
        const blockageDTO: Partial<Blockage> = { ...blockageData }
        
        // If startNode and endNode are provided, convert to linePoints format
        if (blockageData.startNode && blockageData.endNode) {
          blockageDTO.linePoints = `${blockageData.startNode.x},${blockageData.startNode.y}-${blockageData.endNode.x},${blockageData.endNode.y}`
          
          // Also create the lines array for the API
          blockageDTO.lines = [
            { x: blockageData.startNode.x, y: blockageData.startNode.y } as Position,
            { x: blockageData.endNode.x, y: blockageData.endNode.y } as Position
          ]
        }
        
        return blockageDTO
      })
      
      const response = await blockagesApi.createBulk1(blockageDTOs as Blockage[])
      await fetchBlockages() // Refresh the list
      toast({
        title: 'Éxito',
        description: `${blockageDTOs.length} bloqueos creados exitosamente`,
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear bloqueos en masa'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  return {
    blockages,
    loading,
    error,
    refetch: fetchBlockages,
    createBlockage,
    deleteBlockage,
    updateBlockage,
    createBulkBlockages,
    totalItems,
    totalPages,
  }
}

export function useActiveBlockages() {
  const [blockages, setBlockages] = useState<BlockageWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchActiveBlockages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the current date to get active blockages - la fecha ya se convierte a UTC al usar toISOString()
      const now = new Date().toISOString()
      const response = await blockagesApi.list5(now)
      
      // Convert the line points to start and end nodes for compatibility
      const blockagesData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
      const mappedBlockages = blockagesData.map(blockage => {
        // Create a blockage with legacy fields
        const blockageWithLegacy: BlockageWithLegacyFields = {
          ...blockage
        }
        
        // Parse linePoints if available to extract start and end nodes
        if (blockage.linePoints) {
          try {
            const points = blockage.linePoints.split('-')
            if (points.length === 2) {
              const startCoords = points[0].split(',')
              const endCoords = points[1].split(',')
              
              if (startCoords.length === 2 && endCoords.length === 2) {
                blockageWithLegacy.startNode = {
                  x: parseFloat(startCoords[0]),
                  y: parseFloat(startCoords[1])
                }
                
                blockageWithLegacy.endNode = {
                  x: parseFloat(endCoords[0]),
                  y: parseFloat(endCoords[1])
                }
              }
            }
          } catch (e) {
            console.error('Error parsing blockage line points:', e)
          }
        }
        
        return blockageWithLegacy
      })
      
      setBlockages(mappedBlockages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar bloqueos activos'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchActiveBlockages()
  }, [fetchActiveBlockages])

  return { 
    blockages, 
    loading, 
    error,
    refetch: fetchActiveBlockages 
  }
}
