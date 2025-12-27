'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ClipboardList, TrendingUp, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { logout } from '@/lib/auth'

interface DashboardStats {
  total_equipment: number
  equipment_by_status: Record<string, number>
  total_requests: number
  requests_by_stage: Record<string, number>
  requests_by_priority: Record<string, number>
}

interface RecentRequest {
  id: string
  subject: string
  priority: string
  stage: string
  equipment_name?: string
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, requestsData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getRecentRequests(10)
      ])
      setStats(statsData)
      setRecentRequests(requestsData)
      setError('')
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Failed to load dashboard data')
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const criticalEquipment = stats?.equipment_by_status?.['critical'] || 0
  const pendingRequests = stats?.requests_by_stage?.['New Request'] || 0
  const inProgressRequests = stats?.requests_by_stage?.['In Progress'] || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your maintenance operations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Equipment Card */}
        <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Equipment
            </CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats?.total_equipment || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assets tracked
            </p>
          </CardContent>
        </Card>

        {/* Critical Equipment Card */}
        <Card className="border-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Equipment
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{criticalEquipment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Needs attention
            </p>
            {criticalEquipment > 0 && (
              <div className="mt-4 rounded-md bg-red-500/10 p-2 text-xs text-red-500">
                ⚠️ Requires immediate action
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Requests
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        {/* In Progress Card */}
        <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Progress
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Requests</CardTitle>
          <CardDescription>Latest requests from the system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent requests</p>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{request.subject}</p>
                    {request.equipment_name && (
                      <p className="text-sm text-muted-foreground">
                        Equipment: {request.equipment_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        request.priority === 'High'
                          ? 'destructive'
                          : request.priority === 'Medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {request.priority}
                    </Badge>
                    <Badge
                      variant={
                        request.stage === 'New Request'
                          ? 'default'
                          : request.stage === 'In Progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {request.stage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
