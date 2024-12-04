import { usePlanStore } from "@/lib/store/planStore";

const CurriculumFooter = () => {
  const plan = usePlanStore((state) => state.plan);
  const notCounted = ["HK 11", "HK 12", "HK 13", "NSTP 1", "NSTP 2"];

  if (!plan) return <></>;

  let totalUnits = 0;
  let reqUnits = 0;

  plan.courses.forEach((c) => {
    totalUnits += c.units;
    if (notCounted.includes(c.code)) return;
    reqUnits += c.units;
  });

  return (
    <div className="flex border-t-2 border-zinc-200 px-4 py-2 dark:border-zinc-800 ">
      Total units: {reqUnits} / {plan.total_units}
    </div>
  );
};

export default CurriculumFooter;
