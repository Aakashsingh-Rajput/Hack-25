"use client";

import {
  Bell,
  Mic,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useRef, useCallback, useEffect } from "react";
import { speechToText } from "@/ai/flows/speech-to-text";
import { ChakraLoader } from "../ui/loader";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { LanguageSelector } from "./language-selector";
import { useSearch } from "@/hooks/use-search";
import { artisans, opportunities } from "@/lib/data";
import { EnhancedSearch } from "@/components/ui/enhanced-search";

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Combine artisans and opportunities for comprehensive search
  const allSearchableItems = [...artisans, ...opportunities];

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredItems,
    searchStats,
    availableSkills,
    availableLocations,
    availableTypes,
    availableStatuses,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearFilters,
  } = useSearch({
    items: allSearchableItems,
    initialSortOrder: 'desc'
  });

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const result = await speechToText({
              audio: base64Audio,
              prompt: "Transcribe the following audio for a search query on a job and skills platform.",
            });
            setSearchQuery(result.text);
          } catch (error) {
            console.error("Error transcribing audio:", error);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Handle search result navigation
  const handleSearchResultClick = (item: any) => {
    if (item.craft) {
      // It's an artisan - navigate to collaboration page
      window.location.href = '/collaboration';
    } else if (item.title) {
      // It's an opportunity - navigate to opportunities page
      window.location.href = '/opportunities';
    }
  };

  // Close enhanced search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.enhanced-search-container')) {
        setShowEnhancedSearch(false);
      }
    };

    if (showEnhancedSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEnhancedSearch]);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8 sticky top-0 z-10">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1 relative">
        {/* Enhanced Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for skills, artisans, or jobs..."
            className="w-full appearance-none bg-transparent pl-8 pr-20 md:w-4/5 lg:w-3/5 xl:w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowEnhancedSearch(true)}
          />
          <div className="absolute right-2.5 top-1.5 flex items-center gap-1">
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleMicClick}
            >
              {isRecording ? <ChakraLoader className="h-4 w-4 text-primary" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setShowEnhancedSearch(!showEnhancedSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Search Dropdown */}
        {showEnhancedSearch && (
          <div className="enhanced-search-container absolute top-full left-0 right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg p-4">
            <EnhancedSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              availableSkills={availableSkills}
              availableLocations={availableLocations}
              availableTypes={availableTypes}
              availableStatuses={availableStatuses}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              searchStats={searchStats}
              onClearFilters={clearFilters}
              placeholder="Search for skills, artisans, or jobs..."
              showAdvancedFilters={true}
              showSortOptions={true}
              showStats={true}
            />
            
            {/* Search Results Preview */}
            {filteredItems.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Quick Results ({filteredItems.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredItems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchResultClick(item)}
                      className="p-2 hover:bg-muted rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {item.craft ? (
                            <span className="text-xs">👨‍🎨</span>
                          ) : (
                            <span className="text-xs">💼</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.name || item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.craft || item.company} • {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredItems.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{filteredItems.length - 5} more results
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isAuthenticated ? (
        <>
          <LanguageSelector />
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || '/placeholder-avatar.jpg'} alt={user?.name || 'User'} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
