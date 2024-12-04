import { usePlanStore } from "@/lib/store/planStore";
import { useConstantsStore } from "@/lib/store/constStore";
import { TrashSimple } from "@phosphor-icons/react";

interface SemesterHeaderProps {
  index: number;
}

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const SemesterHeader = ({ index }: SemesterHeaderProps) => {
  const plan = usePlanStore((state) => state.plan);
  const removeSemester = usePlanStore((state) => state.removeSemester);

  const zoom = useConstantsStore((state) => state.zoom);

  if (!plan) return <></>;

  const sem = (index % 3) + 1;
  const year = Math.floor(index / 3) + plan.year;
  const showDelete =
    plan.sems === index + 1 && !plan.courses.some((c) => c.sem === index);

  return (
    <div
      style={{
        fontSize: 12 * (zoom / 100),
      }}
      className="flex h-full items-center justify-between"
    >
      <span>
        {sem > 2
          ? `Midyear ${year + 1}`
          : `${sem}${nthNumber(sem)} Sem AY ${year}-${year + 1}`}
      </span>
      {showDelete && (
        <button
          onClick={() => {
            removeSemester();
          }}
          className="rounded text-zinc-500 hover:text-maroon"
        >
          <TrashSimple size={18 * (zoom / 100)} weight="bold" />
        </button>
      )}
    </div>
  );
};

export default SemesterHeader;
