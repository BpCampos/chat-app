'use client'
import RegisterAndLogin from '@/components/RegisterAndLoginForm'
import { UserContextProvider } from '@/context/UserContext'

export default function Home() {
  return (
    <UserContextProvider>
      <RegisterAndLogin />
    </UserContextProvider>
  )
}
