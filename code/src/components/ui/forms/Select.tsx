import { forwardRef } from "react";

interface SelectProps {
  label: string;
  width?: string;
  error?: string;
  options: Array<{ label: string; value: string | number }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, width, error, options, ...rest }, ref) => {
    return (
      <div className={"flex flex-col " + (width || "")}>
        <label>{label}</label>
        <select
          ref={ref}
          className={
            `mt-2 w-full rounded border-2 border-zinc-300 bg-inherit px-3 py-2 focus:outline-none focus:ring-1 dark:border-zinc-700 ` +
            (error
              ? "border-rose-600 focus:ring-rose-600 dark:border-rose-400 focus:dark:ring-rose-400"
              : "border-zinc-300 focus:border-maroon focus:ring-maroon dark:border-zinc-700")
          }
          {...rest}
          defaultValue=""
        >
          <option disabled={true} value=""></option>
          {options.map((o, i) => (
            <option
              key={i}
              value={o.value}
              className="bg-zinc-200 font-sans dark:bg-zinc-800"
            >
              {o.label}
            </option>
          ))}
        </select>
        <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
