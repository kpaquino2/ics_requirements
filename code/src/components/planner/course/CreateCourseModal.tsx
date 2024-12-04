import Button from "@/components/ui/Button";
import Input from "@/components/ui/forms/Input";
import Radio from "@/components/ui/forms/Radio";
import Select from "@/components/ui/forms/Select";
import Textbox from "@/components/ui/forms/Textbox";
import Modal from "@/components/ui/modals/Modal";
import { useConstantsStore } from "@/lib/store/constStore";
import { usePlanStore } from "@/lib/store/planStore";
import { Course } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { nanoid } from "nanoid";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface CreateCourseModalProps {
  createCourseOpen: boolean;
  setCreateCourseOpen: Dispatch<SetStateAction<boolean>>;
  courseToBeEdited?: Course;
  setCourseToBeEdited: Dispatch<SetStateAction<Course | undefined>>;
}

const createCourseSchema = z.object({
  code: z
    .string()
    .min(1, "Course code is required")
    .max(10, "Course code is too long"),
  title: z.string().max(60, "Course title is too long"),
  description: z.string().max(300, "Description is too long"),
  units: z.coerce
    .number({ invalid_type_error: "Invalid amount" })
    .gte(0, "Invalid amount")
    .lte(20, "Invalid amount"),
  sem: z.coerce.number(),
  req_type: z.string(),
});

type CreateCourseSchemaType = z.infer<typeof createCourseSchema>;

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const CreateCourseModal = ({
  createCourseOpen,
  setCreateCourseOpen,
  courseToBeEdited,
  setCourseToBeEdited,
}: CreateCourseModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CreateCourseSchemaType>({
    resolver: zodResolver(createCourseSchema),
  });

  const plan = usePlanStore((state) => state.plan);
  const addCourse = usePlanStore((state) => state.addCourse);
  const updateCourse = usePlanStore((state) => state.updateCourse);
  const updateReq = usePlanStore((state) => state.updateRequisites);
  const courseCount = useConstantsStore((state) => state.courseCount);

  const [search, setSearch] = useState("");
  const [req, setReq] = useState<Course[]>([]);
  const [step, setStep] = useState(0);

  const [coursesList, setCoursesList] = useState<Course[]>(plan?.courses || []);

  useEffect(() => {
    const defaultValues = {
      code: courseToBeEdited?.code || "",
      title: courseToBeEdited?.title || "",
      description: courseToBeEdited?.description || "",
      units: courseToBeEdited?.units || 0,
      sem: courseToBeEdited?.sem || 0,
      req_type:
        courseToBeEdited?.reqs.find((r) => r.id === 999999)?.type || "PRE",
    };
    reset(defaultValues);
    const oldReqs: Course[] | undefined = courseToBeEdited?.reqs
      .find((r) => r.id === 999999)
      ?.sys_ids.map((rs) => plan?.courses.find((c) => c.sys_id === rs))
      .filter((course): course is Course => course !== undefined);

    if (oldReqs) setReq(oldReqs);
    else setReq([]);
  }, [reset, createCourseOpen, courseToBeEdited, plan?.courses]);

  const onSubmit = (data: CreateCourseSchemaType) => {
    if (!step) return setStep(1);
    if (!plan) return;
    const filtered = plan.courses
      .filter((c) => c.sem === data.sem)
      .sort((a, b) => (a.pos > b.pos ? 1 : -1));
    let last = -1;

    for (const f of filtered) {
      if (f.pos - last - 1 >= 1) break;
      last = f.pos;
    }

    const newReq = courseToBeEdited?.reqs || [];
    const newReqIndex = newReq.findIndex((r) => r.id === 999999);

    if (newReqIndex === -1 && req.length > 0)
      newReq.push({
        id: 999999,
        courses: req.map((c) => c.code),
        sys_ids: req.map((c) => c.sys_id),
        status: "MISSING",
        type: data.req_type,
      });
    else if (req.length > 0)
      newReq.splice(newReqIndex, 1, {
        id: 999999,
        courses: req.map((c) => c.code),
        sys_ids: req.map((c) => c.sys_id),
        status: "MISSING",
        type: data.req_type,
      });

    const output: Course = {
      id: courseToBeEdited?.id || nanoid(11),
      sys_id: courseToBeEdited?.sys_id || courseCount + 20000,
      title: data.title,
      description: data.description,
      code: data.code,
      units: data.units,
      sem: data.sem,
      pos: courseToBeEdited?.pos ?? last + 1,
      reqs: req.length > 0 ? newReq : [],
    };
    if (courseToBeEdited) {
      updateCourse(output);
    } else {
      addCourse(output);
    }
    updateReq();
    setCreateCourseOpen(false);
    reset();
    setSearch("");
    setStep(0);
    setReq([]);
    setCoursesList(plan.courses);
    setCourseToBeEdited(undefined);
  };
  if (!plan) return <></>;
  // setCoursesList(plan.courses);
  return (
    <Modal
      isOpen={createCourseOpen}
      close={() => {
        setCreateCourseOpen(false);
        setStep(0);
        reset();
        setReq([]);
        setSearch("");
      }}
      width="w-96"
      title={courseToBeEdited ? "Edit course" : "Create a course"}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid h-96 grid-cols-3 gap-2"
      >
        {step === 0 ? (
          <>
            <Select
              {...register("sem")}
              error={errors.sem?.message}
              label="Choose semester"
              options={Array(plan.sems)
                .fill(0)
                .map((_, i) => {
                  const sem = (i % 3) + 1;
                  const year = Math.floor(i / 3) + (plan?.year || 0);
                  return {
                    label:
                      sem > 2
                        ? `Midyear ${year + 1}`
                        : `${sem}${nthNumber(sem)} Sem AY ${year}-${year + 1}`,
                    value: i,
                  };
                })}
              width="col-span-3"
            />
            <Input
              {...register("code")}
              error={errors.code?.message}
              label="Course code"
              width="col-span-2"
            />
            <Input
              {...register("units")}
              error={errors.units?.message}
              label="Units"
            />
            <Input
              {...register("title")}
              error={errors.title?.message}
              label="Course title"
              width="col-span-3"
            />
            <Textbox
              {...register("description")}
              error={errors.title?.message}
              label="Description"
              width="col-span-3"
            />
          </>
        ) : (
          <>
            <div className="col-span-3 flex flex-col">
              <div className="flex items-center justify-between">
                <label>Requisites</label>
                <div className="flex gap-2">
                  <Radio
                    label="Prerequisite"
                    value="PRE"
                    {...register("req_type")}
                  />
                  <Radio
                    label="Corequisite"
                    value="CO"
                    {...register("req_type")}
                  />
                </div>
              </div>
              <div className="col-span-3 flex h-20 flex-wrap gap-1 overflow-y-auto rounded border-2 border-zinc-300 px-3 py-2 dark:border-zinc-700">
                {req.map((c, i) => (
                  <div
                    key={i}
                    className="h-min cursor-pointer select-none rounded bg-zinc-300 px-1 py-0.5 text-sm dark:bg-zinc-700"
                    onClick={() => {
                      setReq(req.filter((f) => f.code !== c.code));
                      setCoursesList(coursesList.concat(c));
                    }}
                  >
                    {c.code}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative col-span-3">
              <label>Add to requisites</label>
              <input
                type="text"
                disabled={isSubmitting}
                className="w-full rounded border-2 border-zinc-300 bg-inherit px-3 py-1 pl-8 focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon dark:border-zinc-700"
                onChange={(e) => setSearch(e.target.value.toLowerCase().trim())}
              />
              <MagnifyingGlass
                size={20}
                weight="bold"
                className="absolute bottom-2 left-2 my-auto origin-bottom-left text-zinc-500"
              />
            </div>
            <div className="col-span-3 h-40 overflow-y-auto rounded border-2 border-zinc-300 dark:border-zinc-700">
              {coursesList
                .filter(
                  (c) =>
                    (c.code.toLowerCase().includes(search) ||
                      c.title.toLowerCase().includes(search)) &&
                    c.sys_id !== 0,
                )
                .map((c, i) => (
                  <div
                    key={i}
                    className={
                      (req.length > 10
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800") +
                      " flex select-none flex-col px-3 py-1 "
                    }
                    onClick={() => {
                      if (req.length > 10) return;
                      setReq(req.concat(c));
                      setCoursesList(
                        coursesList.filter((cc) => cc.code !== c.code),
                      );
                    }}
                  >
                    <span className="">{c.code}</span>
                    <span className="text-sm">{c.title}</span>
                  </div>
                ))}
            </div>
          </>
        )}
        <div className="col-span-3 flex flex-row-reverse items-center justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => {
                if (!step) {
                  setCreateCourseOpen(false);
                  reset();
                }
                setStep(0);
                setReq([]);
                setCoursesList(plan.courses);
                setSearch("");
              }}
              disabled={isSubmitting}
              variant="base"
              size="md"
            >
              {!step ? "Cancel" : "Back"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="md"
            >
              {!step ? "Next" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCourseModal;
