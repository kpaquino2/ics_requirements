import { useConstantsStore } from "@/lib/store/constStore";
import { usePlanStore } from "@/lib/store/planStore";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

interface SemesterFooterProps {
  semNumber: number;
}

const SemesterFooter = ({ semNumber }: SemesterFooterProps) => {
  const plan = usePlanStore((state) => state.plan);
  const zoom = useConstantsStore((state) => state.zoom);
  const settings = useConstantsStore((state) => state.settings);
  const [showWarning, setShowWarning] = useState(false);
  const notCounted = ["HK 11", "HK 12", "HK 13", "NSTP 1", "NSTP 2"];

  if (!plan) return <></>;

  let totalUnits = 0;
  let reqUnits = 0;

  plan.courses.forEach((c) => {
    if (c.sem !== semNumber) return;
    totalUnits += c.units;
    if (notCounted.includes(c.code)) return;
    reqUnits += c.units;
  });

  const minUnits = (semNumber % 3) + 1 > 2 ? 0 : 15;
  const maxUnits = (semNumber % 3) + 1 > 2 ? 6 : plan.max_units;

  const valid = reqUnits <= maxUnits && totalUnits >= minUnits;

  return (
    <div
      style={{
        fontSize: 16 * (zoom / 100),
      }}
      className="flex h-full items-center justify-between"
    >
      Units: {reqUnits} ({totalUnits - reqUnits}){/* TODO popover warning */}
      {settings.ignore_units || valid || (
        <div className="pointer-events-auto relative">
          <WarningCircle
            weight="bold"
            size={(20 * zoom) / 100}
            className="cursor-pointer text-yellow-500"
            onClick={() => setShowWarning(!showWarning)}
          />
          <div
            className="absolute -top-28 right-0 rounded border-2 border-yellow-500 bg-yellow-500/25 p-1 backdrop-blur-md"
            style={{
              top: -96 * (zoom / 100),
              width: 156 * (zoom / 100),
              fontSize: 12 * (zoom / 100),
              opacity: showWarning ? 100 : 0,
            }}
          >
            {reqUnits > maxUnits
              ? `This semester has exceeded the maximum amount of units (${maxUnits}) per semester.`
              : `This semester has less than the minimum allowed units (${minUnits}) per semester.`}
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterFooter;
