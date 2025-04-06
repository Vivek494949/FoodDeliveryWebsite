import { cn } from "@/lib/utils"
import * as React from "react"

export function Pagination({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <nav className={cn("flex w-full justify-center", className)}>{children}</nav>
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />
}

export function PaginationItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  return (
    <a
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function PaginationPrevious({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      Previous
    </a>
  )
}

export function PaginationNext({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      Next
    </a>
  )
}
