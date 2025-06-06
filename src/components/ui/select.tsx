import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value = "", onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])
  
  const contextValue = React.useMemo(() => ({
    value: value || "",
    onValueChange: onValueChange || (() => {}),
    open,
    setOpen
  }), [value, onValueChange, open, setOpen])
  
  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-blue-500 border-blue-500",
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!open)
        }}
        {...props}
      >
        <div className="flex-1 text-left">
          {children}
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder = "Seleccionar..." }: SelectValueProps) => {
  const { value } = useSelectContext()
  
  return (
    <span className={cn("block truncate", !value && "text-gray-500")}>
      {value || placeholder}
    </span>
  )
}

interface SelectContentProps {
  children: React.ReactNode
}

const SelectContent = ({ children }: SelectContentProps) => {
  const { open } = useSelectContext()
  
  if (!open) return null
  
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectItem = ({ value, children }: SelectItemProps) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext()
  const isSelected = selectedValue === value
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-gray-900",
        isSelected && "bg-blue-50 text-blue-900"
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onValueChange(value)
        setOpen(false)
      }}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-blue-900">
          <Check className="h-4 w-4" />
        </span>
      )}
      <span className="block truncate text-gray-900">
        {children || value}
      </span>
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 