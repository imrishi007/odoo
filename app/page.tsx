'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardPage from '@/components/pages/DashboardPage'
import { isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  if (!isClient || !isAuthenticated()) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  )
}
