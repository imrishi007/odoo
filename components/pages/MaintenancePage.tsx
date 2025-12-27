'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, Search, Filter, AlertCircle, Clock, CheckCircle, 
  XCircle, Wrench, Calendar 
} from 'lucide-react'
import { apiClient } from '@/lib/api'

interface MaintenanceRequest {
  id: string
  subject: string
  description?: string
  equipment_name?: string
  priority: string
  stage: string
  scheduled_date?: string
  created_at: string
  assigned_to?: string
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipment_id: '',
    maintenance_type: 'corrective',
    priority: '3',
    scheduled_date: ''
  })
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    fetchRequests()
    fetchEquipment()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [searchTerm, filterStage, filterPriority, requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMaintenanceRequests()
      setRequests(data)
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipment = async () => {
    try {
      console.log('Fetching equipment...')
      const data = await apiClient.getEquipment()
      console.log('Equipment data received:', data)
      console.log('Equipment count:', data?.length)
      setEquipment(data)
    } catch (err) {
      console.error('Failed to load equipment:', err)
    }
  }

  const handleCreateRequest = async () => {
    if (!formData.subject || !formData.equipment_id) {
      alert('Please fill in required fields: Subject and Equipment')
      return
    }

    try {
      setCreateLoading(true)
      const requestData = {
        subject: formData.subject,
        description: formData.description,
        equipment_id: parseInt(formData.equipment_id),
        maintenance_type: formData.maintenance_type,
        priority: formData.priority,
        scheduled_date: formData.scheduled_date || null
      }
      
      await apiClient.createMaintenanceRequest(requestData)
      
      // Reset form and reload
      setFormData({
        subject: '',
        description: '',
        equipment_id: '',
        maintenance_type: 'corrective',
        priority: '3',
        scheduled_date: ''
      })
      setShowCreateForm(false)
      
      // Reload requests
      await fetchRequests()
      
      alert('Maintenance request created successfully!')
    } catch (err: any) {
      console.error('Failed to create request:', err)
      alert(`Failed to create request: ${err.message || 'Unknown error'}`)
    } finally {
      setCreateLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStage !== 'all') {
      filtered = filtered.filter(req => req.stage === filterStage)
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(req => req.priority === filterPriority)
    }

    setFilteredRequests(filtered)
  }

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'completed':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' }> = {
      '1': { label: 'Critical', variant: 'destructive' },
      '2': { label: 'High', variant: 'destructive' },
      '3': { label: 'Medium', variant: 'default' },
      '4': { label: 'Low', variant: 'secondary' },
    }
    const config = priorityMap[priority] || { label: `P${priority}`, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStageBadge = (stage: string) => {
    const stageColors: Record<string, string> = {
      'draft': 'bg-gray-500',
      'submitted': 'bg-yellow-500',
      'in_progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'closed': 'bg-green-700',
      'cancelled': 'bg-red-500',
    }
    return (
      <Badge className={stageColors[stage.toLowerCase()] || 'bg-gray-500'}>
        {stage.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => ['draft', 'submitted'].includes(r.stage.toLowerCase())).length,
    inProgress: requests.filter(r => r.stage.toLowerCase() === 'in_progress').length,
    completed: requests.filter(r => ['completed', 'closed'].includes(r.stage.toLowerCase())).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage and track all maintenance activities</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Stages</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Priorities</option>
                <option value="1">Critical</option>
                <option value="2">High</option>
                <option value="3">Medium</option>
                <option value="4">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No maintenance requests found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStageIcon(request.stage)}
                        <h3 className="font-semibold">{request.subject}</h3>
                      </div>
                      
                      {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-sm">
                        {request.equipment_name && (
                          <span className="text-muted-foreground">
                            Equipment: <span className="font-medium">{request.equipment_name}</span>
                          </span>
                        )}
                        {request.scheduled_date && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.scheduled_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getPriorityBadge(request.priority)}
                      {getStageBadge(request.stage)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Maintenance Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject *</label>
                  <Input 
                    placeholder="Enter request subject" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Equipment *</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                  >
                    <option value="">Select Equipment</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} - {eq.serial_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md min-h-[100px] bg-background"
                    placeholder="Describe the maintenance issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Maintenance Type</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                    >
                      <option value="corrective">Corrective</option>
                      <option value="preventive">Preventive</option>
                      <option value="predictive">Predictive</option>
                      <option value="breakdown">Breakdown</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="1">Critical</option>
                      <option value="2">High</option>
                      <option value="3">Medium</option>
                      <option value="4">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Scheduled Date (Optional)</label>
                  <Input 
                    type="date" 
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false)
                      setFormData({
                        subject: '',
                        description: '',
                        equipment_id: '',
                        maintenance_type: 'corrective',
                        priority: '3',
                        scheduled_date: ''
                      })
                    }}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
