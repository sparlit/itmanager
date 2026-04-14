import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  CheckCheck, 
  Trash2, 
  Copy, 
  Download, 
  Plus, 
  ArrowUpDown, 
  AToZ, 
  Zap,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkSelectionProps<T> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (selectedItems: T[]) => void;
  onBulkAction: (action: string, selectedItems: T[]) => Promise<void> | void;
  bulkActions?: Array<{
    label: string;
    value: string;
    icon?: typeof CheckCheck;
    disabled?: boolean;
    requiresConfirmation?: boolean;
  }>;
  selectAllLabel?: string;
  selectionCountLabel?: string;
  className?: string;
}

export function BulkSelection<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
  bulkActions = [],
  selectAllLabel = "Select All",
  selectionCountLabel = "selected",
  className,
}: BulkSelectionProps<T>) {
  const isAllSelected = items.length > 0 && items.length === selectedItems.length;
  const isSomeSelected = selectedItems.length > 0 && !isAllSelected;
  const selectionCount = selectedItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...items]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectionCount === 0) return;
    
    const actionConfig = bulkActions.find(a => a.value === action);
    if (actionConfig?.requiresConfirmation) {
      // In a real app, this would show a confirmation dialog
      if (!window.confirm(`Are you sure you want to perform "${actionConfig.label}" on ${selectionCount} items?`)) {
        return;
      }
    }
    
    try {
      await onBulkAction(action, selectedItems);
    } catch (error) {
      console.error('Bulk action failed:', error);
      // Error handling would be done by the calling component
    }
  };

   return (
     <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between", className)}>
       <div className="flex items-center space-x-3">
         <Checkbox
           checked={isAllSelected}
           indeterminate={isSomeSelected}
           onCheckedChange={toggleSelectAll}
           className="h-4 w-4"
         />
         <span className="text-sm font-medium text-muted-foreground">
           {selectAllLabel}
         </span>
         {selectionCount > 0 && (
           <span className="ml-3 text-xs text-muted-foreground">
             ({selectionCount} {selectionCountLabel})
           )
         )}
       </div>
       
       {bulkActions.length > 0 && (
         <DropdownMenu>
           <DropdownMenuTrigger className="flex items-center space-x-2">
             <Button variant="outline" size="icon" disabled={selectionCount === 0}>
               <List className="h-4 w-4" />
               <span className="ml-1 text-xs">Bulk Actions</span>
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent className="w-48">
             {bulkActions.map((action) => (
               <DropdownMenuItem
                 key={action.value}
                 onSelect={() => handleBulkAction(action.value)}
                 disabled={action.disabled || selectionCount === 0}
                 className="flex items-center space-x-2 px-3 py-2"
               >
                 {action.icon && (
                   <action.icon className="h-4 w-4" />
                 )}
                 <span className="text-sm">{action.label}</span>
               </DropdownMenuItem>
             ))}
           </DropdownMenuContent>
         </DropdownMenu>
       )}
     </div>
    );
   );
}