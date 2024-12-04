import { useConstantsStore } from "@/lib/store/constStore";
import { Course } from "@/lib/types";
import { DotsSixVertical, WarningCircle } from "@phosphor-icons/react";
import type { MouseEventHandler } from "react";

interface CourseItemProps {
  handleClick: MouseEventHandler;
  course: Course;
  searched?: boolean;
}

const CourseItem = ({ handleClick, course, searched }: CourseItemProps) => {
  const zoom = useConstantsStore((state) => state.zoom);
  const settings = useConstantsStore((state) => state.settings);
  const complete =
    course.reqs.length == 0 || course.reqs.some((r) => r.status === "COMPLETE");
  const valid_sem = (course.offered || [0, 1, 2]).includes(course.sem % 3);

  return (
    <div
      className={
        "pointer-events-auto flex h-1/2 w-9/12 rounded " +
        (searched ? "opacity-100" : "opacity-30")
      }
    >
      {[
        "MAJOR",
        "GE ELECTIVE",
        "REQUIRED",
        "ELECTIVE",
        "COGNATE",
        "SPECIALIZED",
        "TRACK",
      ].includes(course.code) ? (
        <button
          onClick={handleClick}
          style={{
            fontSize: 12 * (zoom / 100),
          }}
          className="flex w-full items-center justify-between rounded border-2 border-dashed border-zinc-500 bg-zinc-100/30 p-2 text-start font-bold text-zinc-500 backdrop-blur-[2px] hover:brightness-90 dark:bg-zinc-900/30 hover:dark:brightness-125"
        >
          {course.code}
        </button>
      ) : (
        <>
          <button className="draggable peer flex w-1/6 cursor-grab items-center justify-center rounded-l border-r-2 border-zinc-300 bg-zinc-200 active:hover:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800">
            <DotsSixVertical weight="bold" />
          </button>
          <button
            onClick={handleClick}
            style={{
              fontSize: 12 * (zoom / 100),
            }}
            className="flex w-5/6 items-center justify-between rounded-r bg-zinc-200 p-2 text-start hover:bg-zinc-300 focus:bg-maroon focus:text-zinc-100 peer-active:pointer-events-none dark:bg-zinc-800 hover:dark:bg-zinc-700 focus:dark:bg-maroon"
          >
            {course.code}
            {((complete || settings.ignore_reqs) &&
              (valid_sem || settings.ignore_offer)) || (
              <WarningCircle
                weight="bold"
                size={(20 * zoom) / 100}
                className="text-yellow-500"
              />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default CourseItem;
