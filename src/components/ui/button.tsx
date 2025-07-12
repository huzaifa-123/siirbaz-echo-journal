
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "btn-futuristic text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105",
        outline: "border border-white/20 bg-transparent glass hover:bg-white/10 hover:border-white/30 hover:scale-105",
        secondary: "bg-gradient-to-r from-gray-700 to-gray-800 text-secondary-foreground shadow-lg hover:from-gray-600 hover:to-gray-700 hover:scale-105",
        ghost: "hover:bg-white/10 hover:text-accent-foreground hover:scale-105 glass",
        link: "text-primary underline-offset-4 hover:underline hover:text-[#FF832F] transition-colors",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
