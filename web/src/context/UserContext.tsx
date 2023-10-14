import { api } from '@/lib/api'
import { PropsWithChildren, createContext, useEffect, useState } from 'react'

export const UserContext = createContext<any>({})

export function UserContextProvider({ children }: PropsWithChildren) {
  const [username, setUsername] = useState(null)
  const [id, setId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/profile')
      setId(response.data.userId)
      setUsername(response.data.username)
    }
    fetchData()
  }, [])

  return <UserContext.Provider value={{ username, setUsername, id, setId }}>{children}</UserContext.Provider>
}
