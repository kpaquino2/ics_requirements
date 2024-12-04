import { forwardRef } from "react";

interface InputProps {
  label: string;
  width?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, width, error, ...rest }, ref) => {
    return (
      <div className={"flex flex-col " + (width || "")}>
        <label>{label}</label>{" "}
        <input
          ref={ref}
          type="text"
          className={
            `mt-2 w-full rounded border-2 border-zinc-300 bg-inherit px-3 py-1 focus:outline-none focus:ring-1 dark:border-zinc-700 ` +
            (error
              ? "border-rose-600 focus:ring-rose-600 dark:border-rose-400 focus:dark:ring-rose-400"
              : "border-zinc-300 focus:border-maroon focus:ring-maroon dark:border-zinc-700")
          }
          {...rest}
        />
        <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
