import { forwardRef } from "react";

interface InputProps {
  label: string;
  width?: string;
  value: string;
}

const Radio = forwardRef<HTMLInputElement, InputProps>(
  ({ label, width, value, ...rest }, ref) => {
    return (
      <div className={"text-sm " + (width || "")}>
        <label>
          {label}
          <input
            id=""
            ref={ref}
            type="radio"
            className="ml-1"
            value={value}
            {...rest}
          />
        </label>
      </div>
    );
  },
);

Radio.displayName = "Radio";

export default Radio;
