import { forwardRef } from "react";

interface InputProps {
  label: string;
  width?: string;
}

const Checkbox = forwardRef<HTMLInputElement, InputProps>(
  ({ label, width, ...rest }, ref) => {
    return (
      <div className={"text-md " + (width || "")}>
        <label>
          <input id="" ref={ref} type="checkbox" className="mr-2" {...rest} />
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
