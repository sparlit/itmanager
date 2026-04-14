import * as React from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AdvancedSearchProps {
  onSearch: (params: Record<string, any>) => void;
  onReset?: () => void;
  placeholder?: string;
  filters?: Array<{
    id: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'checkbox';
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
  initialValues?: Record<string, any>;
}

export function AdvancedSearch({
  onSearch,
  onReset,
  placeholder = "Search...",
  filters = [],
  initialValues = {},
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState(initialValues.search || '');
  const [filterValues, setFilterValues] = React.useState<Record<string, any>>(initialValues);
  const [isSearching, setIsSearching] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    const params = { 
      search: searchTerm,
      ...filterValues
    };
    onSearch(params);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterValues({});
    if (onReset) onReset();
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className={`
                flex h-10 w-full rounded-md border border-input bg-background
                px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent
                file:text-sm file:font-medium placeholder:text-muted-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              `}
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  handleSearch();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-muted-foreground/70"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>
        
        {filters.length > 0 && (
          <div className="flex-1 sm:w-auto mt-4 sm:mt-0">
            <div className="space-y-2">
              {filters.map((filter) => {
                const value = filterValues[filter.id];
                
                switch (filter.type) {
                  case 'select':
                    return (
                      <div key={filter.id}>
                        <label className="text-xs font-medium text-muted-foreground mb-1">
                          {filter.label}
                        </label>
                        <Select className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={filter.placeholder || "Select..."} />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {filter.options?.map((option) => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  
                   case 'checkbox':
                     return (
                       <div key={filter.id}>
                         <Checkbox
                           checked={!!value}
                           onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
                         >
                           {filter.label}
                         </Checkbox>
                       </div>
                     );
                  
                  case 'date':
                    return (
                      <div key={filter.id}>
                        <label className="text-xs font-medium text-muted-foreground mb-1">
                          {filter.label}
                        </label>
                        <input
                          type="date"
                          value={value || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className={`
                            flex h-10 w-full rounded-md border border-input bg-background
                            px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent
                            file:text-sm file:font-medium placeholder:text-muted-foreground
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                          `}
                        />
                      </div>
                    );
                  
                  default: // text
                    return (
                      <div key={filter.id}>
                        <label className="text-xs font-medium text-muted-foreground mb-1">
                          {filter.label}
                        </label>
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          placeholder={filter.placeholder}
                          className={`
                            flex h-10 w-full rounded-md border border-input bg-background
                            px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent
                            file:text-sm file:font-medium placeholder:text-muted-foreground
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                          `}
                        />
                      </div>
                    );
                }
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          isLoading={isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 mr-2" /> : null}
          Reset
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSearch}
          isLoading={isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 mr-2" /> : null}
          Search
        </Button>
      </div>
    </div>
  );
}