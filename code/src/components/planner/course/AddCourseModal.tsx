import { usePlanStore } from "@/lib/store/planStore";
import { useState, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MagnifyingGlass } from "@phosphor-icons/react";
import courses from "@/static/courses.json";
import { nanoid } from "nanoid";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/modals/Modal";
import Select from "@/components/ui/forms/Select";

interface AddCourseModalProps {
  addCourseOpen: boolean;
  setAddCourseOpen: Dispatch<SetStateAction<boolean>>;
}

const addCourseSchema = z.object({
  sem: z.string().min(1, "Please select a semester"),
});

type AddCourseSchemaType = z.infer<typeof addCourseSchema>;

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const AddCourseModal = ({
  addCourseOpen,
  setAddCourseOpen,
}: AddCourseModalProps) => {
  const plan = usePlanStore((state) => state.plan);
  const addCourse = usePlanStore((state) => state.addCourse);
  const updateReq = usePlanStore((state) => state.updateRequisites);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<AddCourseSchemaType>({ resolver: zodResolver(addCourseSchema) });

  const onSubmit = (data: AddCourseSchemaType) => {
    if (!plan) return;
    const int_sem = parseInt(data.sem);
    const course = courses.find((c) => c.id === selected);
    if (!course) return;
    const filtered = plan.courses
      .filter((c) => c.sem === int_sem)
      .sort((a, b) => (a.pos > b.pos ? 1 : -1));
    let last = -1;

    for (const f of filtered) {
      if (f.pos - last - 1 >= 1) break;
      last = f.pos;
    }

    addCourse({
      id: nanoid(11),
      sys_id: course.id,
      title: course.title,
      description: course.description,
      code: course.code,
      units: course.units || 0,
      sem: int_sem,
      pos: last + 1,
      reqs: course.requisites.map((r) => ({
        id: r.req_id,
        courses: r.courses,
        sys_ids: r.course_ids,
        status: "MISSING",
        type: r.type,
      })),
    });
    updateReq();
    setAddCourseOpen(false);
    reset();
    setSearch("");
    setSelected(0);
  };
  return (
    <Modal
      isOpen={addCourseOpen}
      close={() => {
        reset();
        setSearch("");
        setSelected(0);
        setAddCourseOpen(false);
      }}
      width="w-96"
      title="Add course"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-96 flex-col gap-y-2"
      >
        <Select
          {...register("sem")}
          label="Choose semester"
          error={errors.sem?.message}
          options={Array(plan?.sems || 0)
            .fill(0)
            .map((_, i) => {
              const sem = (i % 3) + 1;
              const year = Math.floor(i / 3) + (plan?.year || 0);
              return {
                label:
                  sem > 2
                    ? `Midyear ${year + 1}`
                    : `${sem}${nthNumber(sem)} Sem AY ${year}-${year + 1}`,
                value: i.toString(),
              };
            })}
        />
        <div className="relative">
          <input
            type="text"
            disabled={isSubmitting}
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
          {courses
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
        <div className="mt-auto flex flex-row-reverse items-center justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => {
                setAddCourseOpen(false);
                reset();
                setSearch("");
                setSelected(0);
              }}
              disabled={isSubmitting}
              variant="base"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selected}
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

export default AddCourseModal;
