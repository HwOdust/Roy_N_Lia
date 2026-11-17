import { createContext, useContext } from 'react'

export const WorldContext = createContext(null)

export function useWorldId() {
  return useContext(WorldContext)
}