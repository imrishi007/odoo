'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Plus, Settings, Trash2, Eye } from 'lucide-react'

const equipment = [
  {
    id: 1,
    name: 'Samsung Monitor 15"',
    employee: 'Tejas Modi',
    department: 'Admin',
    serialNumber: 'MT/125/227F8837',
    technician: 'Mitchell Admin',
    category: 'Monitors',
    company: 'My Company (San Francisco)',
  },
  {
    id: 2,
    name: 'Acer Laptop',
    employee: 'Bhaumik P',
    department: 'Technician',
    serialNumber: 'MT/122/11112222',
    technician: 'Marc Demo',
    category: 'Computers',
    company: 'My Company (San Francisco)',
  },
  {
    id: 3,
    name: 'HP LaserJet Pro',
    employee: 'Sarah Chen',
    department: 'Sales',
    serialNumber: 'HP/456/88990011',
    technician: 'Aka Foster',
    category: 'Printers',
    company: 'My Company (San Francisco)',
  },
  {
    id: 4,
    name: 'CNC Machine Model X',
    employee: 'Production Team',
    department: 'Production',
    serialNumber: 'CNC/789/55667788',
    technician: 'Marc Demo',
    category: 'Machinery',
    company: 'My Company (San Francisco)',
  },
]

export default function EquipmentPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground">
            Manage all company assets and equipment
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Equipment
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, serial number, or category..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Equipment ({filteredEquipment.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Equipment Name</th>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Serial Number</th>
                  <th className="pb-3 font-medium">Technician</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredEquipment.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer ${
                      selectedEquipment === item.id ? 'bg-blue-500/10' : ''
                    }`}
                    onClick={() => setSelectedEquipment(item.id)}
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {item.employee
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.employee}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{item.department}</Badge>
                    </td>
                    <td className="py-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {item.serialNumber}
                      </code>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-blue-500/20 text-xs">
                            {item.technician
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.technician}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary">{item.category}</Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">{item.company}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            // View details
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Edit
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipment Categories</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-gradient-to-br from-blue-500/5 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Computers</h3>
                  <p className="text-sm text-muted-foreground">
                    Responsible: OdooBot
                  </p>
                </div>
                <Badge variant="info">24 Units</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-gradient-to-br from-purple-500/5 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Software</h3>
                  <p className="text-sm text-muted-foreground">
                    Responsible: OdooBot
                  </p>
                </div>
                <Badge variant="purple">12 Licenses</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Monitors</h3>
                  <p className="text-sm text-muted-foreground">
                    Responsible: Mitchell Admin
                  </p>
                </div>
                <Badge variant="success">18 Units</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
