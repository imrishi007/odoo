'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, QrCode, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Maintenance', href: '/maintenance' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Reporting', href: '/reporting' },
  { name: 'Teams', href: '/teams' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const breadcrumbs = React.useMemo(() => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0) return [{ name: 'Dashboard', href: '/' }]
    
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + paths.slice(0, index + 1).join('/'),
    }))
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-[#0f0f0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/60">
        <div className="flex h-16 items-center gap-6 px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">GG</span>
            </div>
            <span className="text-lg font-semibold">GearGuard</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Search Bar */}
          <div className="ml-auto flex w-full max-w-md items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets, requests..."
                className="pl-10 pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">Mitchell Admin</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
            <Avatar>
              <AvatarImage src="/avatars/mitchell.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                MA
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="border-t border-border/50 bg-[#0a0a0a]/50 px-6 py-2">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Link
                  href={crumb.href}
                  className={cn(
                    'transition-colors',
                    index === breadcrumbs.length - 1
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  )
}
