import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, FileText, Image } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  isSearching: boolean;
  resultCount?: number;
}

export interface SearchFilters {
  messageType?: 'all' | 'text' | 'image' | 'file';
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  sender?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear, 
  isSearching, 
  resultCount 
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    messageType: 'all'
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), filters);
    }
  };

  const handleClear = () => {
    setQuery('');
    setFilters({ messageType: 'all' });
    onClear();
    searchInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query.trim(), newFilters);
    }
  };

  const hasActiveFilters = filters.messageType !== 'all' || 
                          filters.dateRange?.start || 
                          filters.dateRange?.end || 
                          filters.sender;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cari pesan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-sm"
        />
        
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ml-2 p-1 rounded transition-colors ${
            hasActiveFilters || showFilters
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Filter pencarian"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Clear Button */}
        {(query || hasActiveFilters) && (
          <button
            onClick={handleClear}
            className="ml-1 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {isSearching && query && (
        <div className="mt-2 text-xs text-gray-600 px-3">
          {resultCount !== undefined ? (
            resultCount > 0 ? (
              `${resultCount} pesan ditemukan`
            ) : (
              'Tidak ada pesan ditemukan'
            )
          ) : (
            'Mencari...'
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div 
          ref={filtersRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-10"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">Filter Pencarian</h4>
          
          {/* Message Type Filter */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2">Tipe Pesan</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Semua', icon: null },
                { value: 'text', label: 'Teks', icon: FileText },
                { value: 'image', label: 'Gambar', icon: Image },
                { value: 'file', label: 'File', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('messageType', value)}
                  className={`flex items-center px-3 py-1.5 rounded text-xs transition-colors ${
                    filters.messageType === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2">Rentang Tanggal</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
                placeholder="Dari"
              />
              <input
                type="date"
                value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
                placeholder="Sampai"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilters({ messageType: 'all' });
                if (query.trim()) {
                  onSearch(query.trim(), { messageType: 'all' });
                }
              }}
              className="w-full text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
