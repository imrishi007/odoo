'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const events = [
  {
    id: 1,
    title: 'CNC Machine Preventive Check',
    date: '2025-12-15',
    time: '10:00',
    type: 'preventive',
    technician: 'Marc Demo',
  },
  {
    id: 2,
    title: 'HVAC System Inspection',
    date: '2025-12-18',
    time: '14:00',
    type: 'preventive',
    technician: 'Aka Foster',
  },
  {
    id: 3,
    title: 'Printer Repair',
    date: '2025-12-20',
    time: '09:00',
    type: 'corrective',
    technician: 'Mitchell Admin',
  },
  {
    id: 4,
    title: 'Monthly Server Maintenance',
    date: '2025-12-28',
    time: '16:00',
    type: 'preventive',
    technician: 'Marc Demo',
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)) // December 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 18))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get calendar days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = []
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    })
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    })
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((event) => event.date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date(2025, 11, 18)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and track preventive maintenance
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Main Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(new Date(year, month - 1, 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(2025, 11, 1))}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(new Date(year, month + 1, 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayInfo, index) => {
                  const dayEvents = getEventsForDate(dayInfo.date)
                  const hasEvents = dayEvents.length > 0

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dayInfo.date)}
                      className={cn(
                        'relative min-h-[80px] rounded-lg border-2 p-2 text-left transition-all hover:border-blue-500/50',
                        dayInfo.isCurrentMonth
                          ? 'border-border bg-card'
                          : 'border-transparent bg-muted/20 opacity-50',
                        isToday(dayInfo.date) &&
                          'border-blue-500 bg-blue-500/10',
                        isSelected(dayInfo.date) &&
                          'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50'
                      )}
                    >
                      <div
                        className={cn(
                          'mb-1 text-sm font-medium',
                          isToday(dayInfo.date) && 'text-blue-500'
                        )}
                      >
                        {dayInfo.day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              'truncate rounded px-1 py-0.5 text-[10px] font-medium',
                              event.type === 'preventive'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-red-500/20 text-red-400'
                            )}
                          >
                            {event.time}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No maintenance scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'rounded-lg border-l-4 bg-card p-3 shadow-sm',
                        event.type === 'preventive'
                          ? 'border-blue-500'
                          : 'border-red-500'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {event.time} • {event.technician}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.type === 'preventive' ? 'info' : 'warning'
                          }
                        >
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Preventive Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Corrective Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-blue-500" />
                <span className="text-sm">Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monday</span>
                  <Badge variant="info">2 Tasks</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wednesday</span>
                  <Badge variant="info">1 Task</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Friday</span>
                  <Badge variant="warning">1 Task</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
