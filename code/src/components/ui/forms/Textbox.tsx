import { forwardRef } from "react";

interface TextboxProps {
  label: string;
  width?: string;
  error?: string;
}

const Textbox = forwardRef<HTMLTextAreaElement, TextboxProps>(
  ({ label, width, error, ...rest }, ref) => {
    return (
      <div className={"flex flex-col " + (width || "")}>
        <div className="flex justify-between">
          <label>{label}</label>{" "}
          <div className="text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        </div>
        <textarea
          ref={ref}
          className={
            `mt-2 w-full resize-none rounded border-2 border-zinc-300 bg-inherit px-3 py-1 focus:outline-none focus:ring-1 dark:border-zinc-700 ` +
            (error
              ? "border-rose-600 focus:ring-rose-600 dark:border-rose-400 focus:dark:ring-rose-400"
              : "border-zinc-300 focus:border-maroon focus:ring-maroon dark:border-zinc-700")
          }
          {...rest}
        />
      </div>
    );
  },
);

Textbox.displayName = "Textbox";

export default Textbox;
