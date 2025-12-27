'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertTriangle, Users, ClipboardList, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const recentActivity = [
  {
    subject: 'Test activity',
    employee: 'Mitchell Admin',
    technician: 'Aka Foster',
    category: 'Computer',
    stage: 'New Request',
    company: 'My Company',
  },
  {
    subject: 'Printer Jam Issue',
    employee: 'Sarah Chen',
    technician: 'Marc Demo',
    category: 'Office Equipment',
    stage: 'In Progress',
    company: 'My Company',
  },
  {
    subject: 'AC Unit Maintenance',
    employee: 'John Smith',
    technician: 'Aka Foster',
    category: 'HVAC',
    stage: 'Repaired',
    company: 'My Company',
  },
]

export default function DashboardPage() {
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
      <div className="grid gap-4 md:grid-cols-3">
        {/* Critical Equipment Card */}
        <Card className="border-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Equipment
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">5 Units</div>
            <p className="text-xs text-muted-foreground mt-1">
              Health &lt; 30%
            </p>
            <div className="mt-4 rounded-md bg-red-500/10 p-2 text-xs text-red-500">
              ⚠️ Needs immediate attention
            </div>
          </CardContent>
        </Card>

        {/* Technician Load Card */}
        <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Technician Load
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">85%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilized
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">85/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-blue-600" />
              </div>
              <p className="text-xs text-blue-400">Assign Carefully</p>
            </div>
          </CardContent>
        </Card>

        {/* Open Requests Card */}
        <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Requests
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>12 Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-400">3 Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest maintenance requests and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Technician</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Company</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentActivity.map((activity, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <td className="py-4 font-medium">{activity.subject}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {activity.employee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.employee}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-blue-500/20">
                            {activity.technician.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.technician}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{activity.category}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          activity.stage === 'New Request'
                            ? 'info'
                            : activity.stage === 'In Progress'
                            ? 'purple'
                            : 'success'
                        }
                      >
                        {activity.stage}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {activity.company}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-emerald-500">
              -8% improvement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-emerald-500">
              +2.5% increase
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
