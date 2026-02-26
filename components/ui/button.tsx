import { cn } from "@/lib/utils"
import { HTMLMotionProps, motion } from "framer-motion"
import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const buttonVariants = ({ variant = "default", size = "default", className = "" }: { variant?: ButtonProps["variant"], size?: ButtonProps["size"], className?: string }) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants: Record<string, string> = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/10 hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass hover:bg-white/10 active:scale-95 transition-all duration-300 text-white"
    }

    const sizes: Record<string, string> = {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
    }

    return cn(base, variants[variant || "default"], sizes[size || "default"], className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                {...(props as HTMLMotionProps<"button">)}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
