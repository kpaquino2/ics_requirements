import React, {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import courses from "@/static/courses.json";
import { useConstantsStore } from "@/lib/store/constStore";
import { Transition } from "@headlessui/react";
import { usePlanStore } from "@/lib/store/planStore";
import { PencilSimple, TrashSimple, X } from "@phosphor-icons/react";
import { Course } from "@/lib/types";
import ConfirmActionModal from "@/components/ui/modals/ConfirmActionModal";

interface CourseDetailsProps {
  courseProp?: Course;
  setCourseProp: Dispatch<SetStateAction<Course | undefined>>;
  setEditCourseOpen: Dispatch<SetStateAction<boolean>>;
}

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const CourseDetails = ({
  courseProp,
  setCourseProp,
  setEditCourseOpen,
}: CourseDetailsProps) => {
  const plan = usePlanStore((state) => state.plan);
  const zoom = useConstantsStore((state) => state.zoom);
  const settings = useConstantsStore((state) => state.settings);

  const deleteCourse = usePlanStore((state) => state.deleteCourse);
  const updateReq = usePlanStore((state) => state.updateRequisites);
  const [onConfirm, setOnConfirm] = useState<null | {
    title: string;
    message: string;
    action: () => void;
  }>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  if (!plan) return <></>;

  const course = courseProp;

  if (!course) return <></>;
  const prereqs = course.reqs.filter((r) => r.type === "PRE" || r.type === "-");
  const coreqs = course.reqs.filter((r) => r.type === "CO");

  const rowHeight = 66 * (zoom / 100);
  const colWidth = 168 * (zoom / 100);

  const width = Math.max(
    containerRef.current?.getBoundingClientRect().width || 0,
    (plan?.sems || 0) * colWidth,
  );
  const right =
    colWidth * (courseProp.sem + 1) - colWidth * 0.0625 + colWidth * 1.5 <
      width || courseProp.sem < 1.5;
  const bottom =
    courseProp.pos < 4 ||
    rowHeight * (courseProp.pos + 1) + rowHeight * 3.5 <
      (containerRef.current?.getBoundingClientRect().height || 0);

  const x = right
    ? colWidth * (courseProp.sem + 1) - colWidth * 0.0625
    : colWidth * courseProp.sem - colWidth * 1.5 + colWidth * 0.0625;
  const y = bottom
    ? rowHeight * (courseProp.pos + 0.5)
    : rowHeight * (courseProp.pos - 2);

  const prereq_status = {
    COMPLETE: "bg-green-300 dark:bg-green-700",
    PARTIAL: "bg-yellow-300 dark:bg-yellow-700",
    INVALID: "bg-yellow-300 dark:bg-yellow-700",
    MISSING: "bg-zinc-300 dark:bg-zinc-700 opacity-60",
  };

  const pr_status = course.reqs.reduce(
    (curr, { status }) =>
      Object.keys(prereq_status).indexOf(status) <
      Object.keys(prereq_status).indexOf(curr)
        ? status
        : curr,
    course.reqs.length > 0 ? "MISSING" : "COMPLETE",
  );

  return (
    <div
      className="pointer-events-none absolute h-full w-full"
      ref={containerRef}
    >
      <ConfirmActionModal onConfirm={onConfirm} setOnConfirm={setOnConfirm} />

      <Transition
        enter="transition duration-300 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={courseProp.id.length > 0}
        appear={true}
        className="transpa pointer-events-auto absolute z-20 flex flex-col rounded border-2 border-zinc-200 bg-zinc-100 transition-all dark:border-zinc-800 dark:bg-zinc-900"
        style={{
          transform: `translate(${x}px, ${y}px)`,
          height: rowHeight * 3.5,
          width: colWidth * 1.5,
          fontSize: 16 * (zoom / 100),
          padding: 12 * (zoom / 100),
        }}
      >
        <span
          className={
            "absolute border-zinc-200 bg-inherit dark:border-zinc-800 " +
            (right ? "border-b-2 border-l-2" : "border-r-2 border-t-2")
          }
          style={{
            transform: `translate(${
              right ? -21 * (zoom / 100) : colWidth * 1.5 - 22 * (zoom / 100)
            }px, ${
              bottom ? 16 * (zoom / 100) : rowHeight * 3 - 16 * (zoom / 100)
            }px) rotate(45deg)`,
            height: (zoom / 100) * 16,
            width: (zoom / 100) * 16,
          }}
        />
        <div className="flex justify-end">
          <button
            onClick={() => {
              setCourseProp(undefined);
            }}
            className="rounded text-zinc-400 hover:text-maroon"
          >
            <X size={16 * (zoom / 100)} weight="bold" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="leading-none" style={{ fontSize: 20 * (zoom / 100) }}>
            {course.code || <p className="italic">no course code</p>}
          </div>
          <div>
            {course.units || 0} unit
            {course.units !== 1 && "s"}
          </div>
        </div>
        <div
          className="pb-1 leading-none text-zinc-600 dark:text-zinc-400"
          style={{ fontSize: 14 * (zoom / 100) }}
        >
          {course.title || <p className="italic">no course title</p>}
        </div>
        <div
          className="overflow-auto leading-tight"
          style={{ fontSize: 12 * (zoom / 100) }}
        >
          {pr_status === "COMPLETE" || settings.ignore_reqs || (
            <div className="my-0.5 rounded border-2 border-yellow-500 bg-yellow-500/25 px-1 py-0.5">
              {pr_status === "MISSING"
                ? "You do not meet any of the prerequisite requirements for this course"
                : pr_status === "PARTIAL"
                  ? "Your prerequisite requirements for this course are incomplete"
                  : "Prerequisites must be taken in an earlier semester and corequisites must be taken in the same semester."}
            </div>
          )}
          {(course.offered || [0, 1, 2]).includes(course.sem % 3) ||
            settings.ignore_offer || (
              <div className="my-0.5 rounded border-2 border-yellow-500 bg-yellow-500/25 px-1 py-0.5">
                This course may only be offered during the
                {course.offered?.map((o, i) => {
                  const out =
                    o < 2 ? `${o + 1}${nthNumber(o + 1)} Semester` : "Midyear";
                  const pre =
                    course.offered?.length === 1
                      ? " "
                      : course.offered?.length === i + 1
                        ? "and "
                        : " ";
                  const post = course.offered?.length === i + 1 ? "." : " ";
                  return pre + out + post;
                })}
              </div>
            )}
          {course.description || (
            <p className="italic">no course description</p>
          )}
          <p className="leading-loose" style={{ fontSize: 12 * (zoom / 100) }}>
            {prereqs.length > 0 ? (
              <>
                PRE:
                {prereqs.map((r, i) => {
                  return (
                    <React.Fragment key={i}>
                      <span
                        key={i}
                        className={"rounded p-0.5 " + prereq_status[r.status]}
                      >
                        {r.courses.map((r_c, j) => {
                          return (
                            <span key={j} className="">
                              {(j === 0 ? "[\u00A0" : "") +
                                r_c.replace(" ", "\u00A0") +
                                (r.sys_ids.length - 1 === j ? "\u00A0]" : ", ")}
                            </span>
                          );
                        })}
                      </span>
                    </React.Fragment>
                  );
                })}
              </>
            ) : coreqs.length > 0 ? (
              <>
                CO:
                {coreqs.map((r, i) => {
                  return (
                    <React.Fragment key={i}>
                      <span
                        key={i}
                        className={"rounded p-0.5 " + prereq_status[r.status]}
                      >
                        {r.courses.map((r_c, j) => {
                          return (
                            <span key={j} className="">
                              {(j === 0 ? "[\u00A0" : "") +
                                r_c.replace(" ", "\u00A0") +
                                (r.sys_ids.length - 1 === j ? "\u00A0]" : ", ")}
                            </span>
                          );
                        })}
                      </span>
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <span className="">No requisites</span>
            )}
          </p>
        </div>
        <div
          className="mt-auto flex items-center justify-end gap-2"
          style={{ fontSize: 14 * (zoom / 100) }}
        >
          <button
            className="flex items-center justify-center gap-2 rounded bg-maroon px-2 py-1 text-white"
            type="button"
            onClick={() => {
              setEditCourseOpen(true);
              updateReq();
            }}
          >
            <PencilSimple size={16 * (zoom / 100)} weight="bold" /> Edit
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded bg-maroon px-2 py-1 text-white"
            type="button"
            onClick={() => {
              setOnConfirm({
                title: "Delete course",
                message: "Are you sure you want to delete this course?",
                action: () => {
                  setCourseProp(undefined);
                  deleteCourse(courseProp.id);
                  updateReq();
                },
              });
            }}
          >
            <TrashSimple size={16 * (zoom / 100)} weight="bold" /> Delete
          </button>
        </div>
      </Transition>
    </div>
  );
};

export default CourseDetails;
