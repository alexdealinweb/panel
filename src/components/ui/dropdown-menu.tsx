import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType>({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild: _asChild }: { children: ReactNode; asChild?: boolean }) {
  const { open, setOpen } = useContext(DropdownContext)
  return <button onClick={() => setOpen(!open)} className="focus:outline-none">{children}</button>
}

export function DropdownMenuContent({ children, className, align = 'end' }: { children: ReactNode; className?: string; align?: 'start' | 'end' }) {
  const { open } = useContext(DropdownContext)
  if (!open) return null
  return (
    <div className={cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
      align === 'end' ? 'right-0' : 'left-0',
      className
    )}>
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, className, onClick, variant }: {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'destructive'
}) {
  const { setOpen } = useContext(DropdownContext)
  return (
    <button
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        variant === 'destructive' && 'text-red-500 hover:text-red-500 hover:bg-red-500/10',
        className
      )}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />
}
