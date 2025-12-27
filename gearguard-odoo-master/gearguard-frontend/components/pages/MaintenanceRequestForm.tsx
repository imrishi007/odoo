'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Check,
  Circle,
  Sparkles,
  Calendar,
  Clock,
  Star,
  Wrench,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const stages = [
  { name: 'New Request', value: 'new', icon: FileText },
  { name: 'In Progress', value: 'progress', icon: Wrench },
  { name: 'Repaired', value: 'repaired', icon: Check },
  { name: 'Scrap', value: 'scrap', icon: Circle },
]

export default function MaintenanceRequestForm() {
  const [currentStage, setCurrentStage] = useState(0)
  const [maintenanceType, setMaintenanceType] = useState('corrective')
  const [priority, setPriority] = useState(2)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header with Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              placeholder="Enter request subject..."
              className="h-12 text-2xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0"
              defaultValue="Test Activity"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Wrench className="mr-2 h-4 w-4" />
              Create Work Order
            </Button>
          </div>
        </div>

        {/* Pipeline Status Bar */}
        <Card className="overflow-hidden">
          <div className="flex items-center">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              const isActive = index === currentStage
              const isCompleted = index < currentStage
              
              return (
                <React.Fragment key={stage.value}>
                  <button
                    onClick={() => setCurrentStage(index)}
                    className={cn(
                      'flex flex-1 items-center gap-3 px-6 py-4 transition-all',
                      isActive && 'bg-blue-500/10',
                      !isActive && !isCompleted && 'opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                        isActive && 'border-blue-500 bg-blue-500 text-white',
                        isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                        !isActive && !isCompleted && 'border-border'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={cn('text-sm font-medium', isActive && 'text-blue-500')}>
                      {stage.name}
                    </span>
                  </button>
                  {index < stages.length - 1 && (
                    <div className="h-[1px] w-8 bg-border" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Form Content - 2 Column Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Created By */}
              <div className="space-y-2">
                <Label>Created By</Label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600">
                      MA
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Mitchell Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Admin Department
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <div className="relative">
                  <select
                    id="equipment"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option>Acer Laptop/LP/203/19281928</option>
                    <option>Samsung Monitor 15"</option>
                    <option>HP Printer Pro</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select equipment to auto-fill category and team
                </p>
              </div>

              {/* Category (Auto-filled) */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value="Computers"
                  readOnly
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from equipment
                </p>
              </div>

              {/* Maintenance Type */}
              <div className="space-y-2">
                <Label>Maintenance Type</Label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMaintenanceType('corrective')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all',
                      maintenanceType === 'corrective'
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <Circle
                      className={cn(
                        'h-4 w-4',
                        maintenanceType === 'corrective' && 'fill-current'
                      )}
                    />
                    <span className="font-medium">Corrective</span>
                  </button>
                  <button
                    onClick={() => setMaintenanceType('preventive')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all',
                      maintenanceType === 'preventive'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <Circle
                      className={cn(
                        'h-4 w-4',
                        maintenanceType === 'preventive' && 'fill-current'
                      )}
                    />
                    <span className="font-medium">Preventive</span>
                  </button>
                </div>
              </div>

              {/* Request Date */}
              <div className="space-y-2">
                <Label htmlFor="request-date">Request Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="request-date"
                    type="date"
                    defaultValue="2025-12-18"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team */}
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <select
                  id="team"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>Internal Maintenance</option>
                  <option>Metrology</option>
                  <option>Subcontractor</option>
                </select>
              </div>

              {/* Technician */}
              <div className="space-y-2">
                <Label htmlFor="technician">Technician</Label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600">
                      AF
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Aka Foster</div>
                    <div className="text-xs text-muted-foreground">
                      Senior Technician
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Scheduled Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    defaultValue="2025-12-28T14:30"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Hours)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    defaultValue="4"
                    className="pl-10"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setPriority(index)}
                      className="group rounded-lg border-2 border-border p-4 transition-all hover:border-amber-500/50"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          index <= priority
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-muted-foreground group-hover:text-amber-500/50'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {priority === 0 && 'Low Priority'}
                  {priority === 1 && 'Medium Priority'}
                  {priority === 2 && 'High Priority'}
                </p>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  defaultValue="My Company (San Francisco)"
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Card>
        <Tabs defaultValue="notes" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Instructions
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <TabsContent value="notes" className="mt-0 space-y-4">
              <Textarea
                placeholder="Add notes about this maintenance request..."
                className="min-h-[150px]"
              />
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Generate AI Summary
                </Button>
                <div className="text-xs text-muted-foreground">
                  Use AI to summarize key points from your notes
                </div>
              </div>
            </TabsContent>
            <TabsContent value="instructions" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Power off the equipment safely</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Inspect all connections and cables</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Document any issues found</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Add Step
              </Button>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
