import { usePlanStore } from "@/lib/store/planStore";
import { useState, type Dispatch, type SetStateAction } from "react";
import Modal from "@/components/ui/modals/Modal";
import { MagnifyingGlass } from "@phosphor-icons/react";
import curricula from "@/static/curricula.json";
import courses from "@/static/courses.json";
import Button from "@/components/ui/Button";
import { nanoid } from "nanoid";
import { Course } from "@/lib/types";

interface replacePlaceholderModalProps {
  replacePlaceholderOpen?: Course;
  setReplacePlaceholderOpen: Dispatch<SetStateAction<Course | undefined>>;
}

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const ReplacePlaceholderModal = ({
  replacePlaceholderOpen,
  setReplacePlaceholderOpen,
}: replacePlaceholderModalProps) => {
  const plan = usePlanStore((state) => state.plan);
  const deleteCourse = usePlanStore((state) => state.deleteCourse);
  const addCourse = usePlanStore((state) => state.addCourse);
  const updateReq = usePlanStore((state) => state.updateRequisites);

  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const [allCourses, setAllCourses] = useState(false);

  if (!replacePlaceholderOpen) return <></>;

  const sem = (replacePlaceholderOpen.sem % 3) + 1;
  const year = Math.floor(replacePlaceholderOpen.sem / 3) + (plan?.year || 0);

  const handleSubmit = () => {
    if (!plan) return;
    const course = courses.find((c) => c.id === selected);
    if (!course) return;

    const newCourse: Course = {
      id: nanoid(11),
      sys_id: course.id,
      title: course.title,
      description: course.description,
      code: course.code,
      units: course.units || 0,
      sem: replacePlaceholderOpen.sem,
      pos: replacePlaceholderOpen.pos,
      reqs: course.requisites.map((r) => ({
        id: r.req_id,
        courses: r.courses,
        sys_ids: r.course_ids,
        status: "MISSING",
        type: r.type,
      })),
    };

    const keys = ["MAJOR", "ELECTIVE", "SPECIALIZED", "TRACK", "COGNATE"];

    if (keys.includes(replacePlaceholderOpen.code)) {
      const s = replacePlaceholderOpen.code as keyof typeof plan.special;
      plan.special[s].push(newCourse);
    }

    addCourse(newCourse);
    deleteCourse(replacePlaceholderOpen.id);
    updateReq();
    setReplacePlaceholderOpen(undefined);
    setSearch("");
    setSelected(0);
  };

  if (!plan) return <></>;
  const curric = curricula.find((c) => c.code === plan.code);
  if (!curric) return <></>;
  const curric_courses = curric.curriculum_courses
    .filter((c) => c.type === replacePlaceholderOpen.code)
    .map((c) => c.code);
  const filtered_courses = allCourses
    ? courses
    : courses.filter((c) => curric_courses.includes(c.code));

  return (
    <Modal
      isOpen={[
        "MAJOR",
        "GE ELECTIVE",
        "REQUIRED",
        "ELECTIVE",
        "COGNATE",
        "SPECIALIZED",
        "TRACK",
      ].includes(replacePlaceholderOpen.code)}
      close={() => {
        setAllCourses(false);
        setSelected(0);
        setReplacePlaceholderOpen(undefined);
      }}
      width="w-96"
      title="Add course"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex h-96 flex-col gap-y-1"
      >
        <div>Course type: {replacePlaceholderOpen.code}</div>
        <div>
          To be added in{" "}
          {sem > 2
            ? `Midyear ${year + 1}`
            : `${sem}${nthNumber(sem)} Sem AY ${year}-${year + 1}`}
        </div>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded border-2 border-zinc-300 bg-inherit px-3 py-1 pl-8 focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon dark:border-zinc-700"
            onChange={(e) => setSearch(e.target.value.toLowerCase().trim())}
          />
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="absolute left-2 top-2 my-auto text-zinc-500 "
          />
        </div>
        <div className="flex-1 overflow-y-auto rounded border-2 border-zinc-300 dark:border-zinc-700">
          {filtered_courses
            .filter(
              (c) =>
                c.code.toLowerCase().includes(search) ||
                c.title.toLowerCase().includes(search),
            )
            .map((c, i) => (
              <div
                key={i}
                className={
                  `flex flex-col px-3 py-1  ` +
                  (selected === c.id
                    ? "bg-maroon text-white"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800")
                }
                onClick={() => setSelected(c.id)}
              >
                <span className="">{c.code}</span>
                <span className="text-sm">{c.title}</span>
              </div>
            ))}
          {/* {curricula
            .find((c) => c.code === plan?.code)
            ?.curriculum_courses?.map((cc) => {
              return cc.code;
            })} */}
        </div>
        <div className="mt-auto flex flex-row items-center justify-between">
          <Button
            type="button"
            onClick={() => {
              setAllCourses(!allCourses);
            }}
            variant="base"
            size="sm"
          >
            {allCourses ? "Show curriculum courses" : "Show all courses"}
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => {
                setReplacePlaceholderOpen(undefined);
                setSearch("");
                setAllCourses(false);
                setSelected(0);
              }}
              variant="base"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selected}
              variant="primary"
              size="md"
            >
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ReplacePlaceholderModal;
