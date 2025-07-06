import { useState, useEffect, useCallback } from 'react'
import { blockagesApi, type Blockage } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

// Define an interface that combines the old field names with the new ones for transition
interface BlockageWithLegacyFields extends Blockage {
  startNode?: { x: number; y: number; }; // Legacy field
  endNode?: { x: number; y: number; }; // Legacy field
}

export function useBlockages() {
  const [blockages, setBlockages] = useState<BlockageWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBlockages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await blockagesApi.list5()
      
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
  }, [toast])

  useEffect(() => {
    fetchBlockages()
  }, [fetchBlockages])

  const createBlockage = async (blockageData: Partial<BlockageWithLegacyFields>) => {
    try {
      // Convert from old format to new format if necessary
      const newBlockageData = { ...blockageData }
      
      // If startNode and endNode are provided, convert to linePoints format
      if (blockageData.startNode && blockageData.endNode) {
        newBlockageData.linePoints = `${blockageData.startNode.x},${blockageData.startNode.y}-${blockageData.endNode.x},${blockageData.endNode.y}`
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

  const deleteBlockage = async (id: number) => {
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

  const updateBlockage = async (id: number, blockageData: Partial<BlockageWithLegacyFields>) => {
    try {
      // Convert from old format to new format if necessary
      const newBlockageData = { ...blockageData }
      
      // If startNode and endNode are provided, convert to linePoints format
      if (blockageData.startNode && blockageData.endNode) {
        newBlockageData.linePoints = `${blockageData.startNode.x},${blockageData.startNode.y}-${blockageData.endNode.x},${blockageData.endNode.y}`
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

  return {
    blockages,
    loading,
    error,
    refetch: fetchBlockages,
    createBlockage,
    deleteBlockage,
    updateBlockage,
  }
}

export function useActiveBlockages() {
  const [blockages, setBlockages] = useState<BlockageWithLegacyFields[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchActiveBlockages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use the current date to get active blockages
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
    }

    fetchActiveBlockages()
  }, [toast])

  return { blockages, loading, error }
}
