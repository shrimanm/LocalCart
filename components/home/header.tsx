"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/providers"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notifications/notification-bell"


export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get current search from URL
  useEffect(() => {
    const currentPath = window.location.pathname
    const currentSearch = new URLSearchParams(window.location.search).get('search')
    if (currentPath === '/home' && currentSearch) {
      setSearchQuery(currentSearch)
    }
  }, [router])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Fetch suggestions when user types
    if (searchQuery.length > 1) {
      setLoading(true)
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
          const data = await response.json()
          const productSuggestions = data.products.map((p: any) => p.name).slice(0, 5)
          setSuggestions(productSuggestions)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          setLoading(false)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  const handleSearch = (query: string = searchQuery) => {
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      // Save to recent searches
      const updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      
      setShowSuggestions(false)
      setSearchQuery(trimmedQuery) // Keep the search term visible
      router.push(`/home?search=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const clearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    router.push('/home')
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex-shrink-0 flex items-center space-x-2">
            <img src="/logo.png" alt="LocalCart Logo" className="h-12 w-12" />
            <h1 className="text-2xl font-black text-red-700">LocalCart</h1>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-4 pr-16 py-2 w-full"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch()}
                  className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-900"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {/* Recent Searches */}
                  {searchQuery.length === 0 && recentSearches.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                        <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-xs">
                          Clear All
                        </Button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchQuery(search)
                            handleSearch(search)
                          }}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <Clock className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm">{search}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Live Suggestions */}
                  {searchQuery.length > 0 && (
                    <div className="p-3">
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-900 mx-auto"></div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleSearch(suggestion)}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                          >
                            <Search className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3" ref={searchRef}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-4 pr-16 py-2 w-full"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch()}
                className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-900"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Mobile Search Suggestions */}
            {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {/* Recent Searches */}
                {searchQuery.length === 0 && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Recent</span>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-xs h-6">
                        Clear
                      </Button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchQuery(search)
                          handleSearch(search)
                        }}
                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded text-sm"
                      >
                        <Clock className="h-3 w-3 text-gray-400 mr-2" />
                        <span>{search}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Live Suggestions */}
                {searchQuery.length > 0 && (
                  <div className="p-2">
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSearch(suggestion)}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded text-sm"
                        >
                          <Search className="h-3 w-3 text-gray-400 mr-2" />
                          <span>{suggestion}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-xs">
                        No suggestions
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
