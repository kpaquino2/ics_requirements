import Link from "next/link";
import type {
  HTMLAttributeAnchorTarget,
  MouseEventHandler,
  ReactNode,
} from "react";
import { forwardRef } from "react";

interface ButtonProps {
  variant: "primary" | "base" | "error";
  size: "sm" | "md" | "lg" | "xl";
  fill?: boolean;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
  disabled?: boolean;
  grouped?: boolean;
  active?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const variants = {
    primary:
      "text-zinc-100 active:bg-maroon " +
      (props.active ? "bg-maroon" : "bg-maroon hover:brightness-125"),
    base:
      "text-zinc-700 dark:text-zinc-300 active:bg-zinc-300 dark:active:bg-zinc-700 " +
      (props.active
        ? "bg-zinc-300 dark:bg-zinc-700"
        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"),
    error:
      "text-zinc-100 active:bg-rose-600 " +
      (props.active ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-400"),
  };

  const sizes = {
    sm: "h-6 px-1 text-sm",
    md: "h-8 px-2 text-base ",
    lg: "h-12 px-3 text-lg ",
    xl: "h-16 px-4 text-xl ",
  };

  return props.href ? (
    <Link
      href={props.href}
      target={props.target}
      type={props.type}
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      className={
        "flex items-center gap-2 transition disabled:pointer-events-none disabled:opacity-50 " +
        sizes[props.size] +
        (props.fill ? "w-full " : "") +
        (props.grouped ? "first:rounded-l last:rounded-r " : "rounded ") +
        variants[props.variant]
      }
    >
      {props.children}
    </Link>
  ) : (
    <button
      type={props.type}
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      disabled={props.disabled}
      className={
        "flex items-center gap-2 transition disabled:pointer-events-none disabled:opacity-50 " +
        sizes[props.size] +
        (props.fill ? "w-full " : "") +
        (props.grouped ? "first:rounded-l last:rounded-r " : "rounded ") +
        variants[props.variant]
      }
      ref={ref}
    >
      {props.children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
