import type { Dispatch, SetStateAction } from "react";
import Modal from "../ui/modals/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "../ui/forms/Select";
import Input from "../ui/forms/Input";
import Button from "../ui/Button";
import programs from "@/static/programs.json";
import curricula from "@/static/curricula.json";
import courses from "@/static/courses.json";
import { usePlanStore } from "@/lib/store/planStore";
import { nanoid } from "nanoid";
import { Course } from "@/lib/types";

interface AddPlanModalProps {
  newPlanOpen: boolean;
  setNewPlanOpen: Dispatch<SetStateAction<boolean>>;
}

const selecPlanSchema = z.object({
  degree_program: z.string().min(1, "Please select a degree program"),
  curriculum: z.string().min(1, "Please select a curriculum"),
  year: z.coerce
    .number({
      invalid_type_error: "Please enter a valid year",
    })
    .gte(1900, "Please enter a valid year")
    .lte(2100, "Please enter a valid year"),
});

type selecPlanSchemaType = z.infer<typeof selecPlanSchema>;

const AddPlanModal = ({ newPlanOpen, setNewPlanOpen }: AddPlanModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<selecPlanSchemaType>({
    resolver: zodResolver(selecPlanSchema),
    defaultValues: { degree_program: "", curriculum: "" },
  });

  const setPlan = usePlanStore((state) => state.setPlan);
  const updateReq = usePlanStore((state) => state.updateRequisites);

  const onSubmit = (data: selecPlanSchemaType) => {
    const program = programs.find(
      (p) => p.id.toString() === data.degree_program,
    );
    const curric = curricula.find((c) => data.curriculum === c.code);

    if (!curric) return;
    if (!program) return;

    // if ()
    const no_of_sems =
      curric.curriculum_structure.length > 0
        ? 1 +
          curric.curriculum_structure.reduce(
            (a, { year, sem }) =>
              a > 3 * (year - 1) + sem - 1 ? a : 3 * (year - 1) + sem - 1,
            0,
          )
        : curric.curriculum_courses.reduce(
            (a, { year }) => (year > a ? year : a),
            0,
          ) *
            3 -
          1;

    const sems: Array<{
      sem: number;
      year: number;
      courses: Array<Course>;
    }> = [];
    for (let i = 0; i < no_of_sems; i++) {
      const s = (i % 3) + 1;
      const y = Math.floor(i / 3) + 1;
      const cs = curric.curriculum_structure.find(
        (struc) => struc.year === y && struc.sem === s,
      );
      const sem: {
        sem: number;
        year: number;
        courses: Array<Course>;
      } = { sem: s, year: y, courses: [] };
      if (cs) {
        Object.entries(cs).forEach((cse, i) => {
          if (!cse[0].includes("count")) return;
          if (cse[0].includes("total")) return;
          for (let j = 0; j < cse[1]; j++) {
            sem.courses.push({
              id: nanoid(11),
              sys_id: 0,
              title: "-",
              description: "-",
              code: cse[0].slice(0, -6).toUpperCase().replace("_", " "),
              units: 0,
              sem: 3 * (cs.year - 1) + cs.sem - 1,
              pos: sem.courses.length,
              reqs: [],
            });
          }
        });
      }

      sems.push(sem);
    }

    curric.curriculum_courses.forEach((cc) => {
      if (cc.year === 0 && cc.sem === 0) return;
      const course = courses.find((c) => c.id === cc.id);
      if (!course) return;
      const index = sems.findIndex(
        (s) => s.sem === cc.sem && s.year === cc.year,
      );
      const replace = sems[index].courses.findIndex(
        (sc) => sc.code === cc.type,
      );

      if (replace != -1) {
        sems[index].courses[replace].sys_id = course.id;
        sems[index].courses[replace].title = course.title;
        sems[index].courses[replace].description = course.description;
        sems[index].courses[replace].code = course.code;
        sems[index].courses[replace].units = course.units || 0;
        sems[index].courses[replace].reqs = course.requisites.map((cr) => ({
          id: cr.req_id,
          status: "MISSING",
          courses: cr.courses,
          sys_ids: cr.course_ids,
          type: cr.type,
        }));
        sems[index].courses[replace].offered = course.sem_offered;
        return;
      }

      sems[index].courses.push({
        id: nanoid(11),
        sys_id: course.id,
        title: course.title,
        description: course.description,
        code: course.code,
        units: course.units || 0,
        sem: 3 * (cc.year - 1) + cc.sem - 1,
        pos: sems[index].courses.length,
        reqs: course.requisites.map((cr) => ({
          id: cr.req_id,
          status: "MISSING",
          courses: cr.courses,
          sys_ids: cr.course_ids,
          type: cr.type,
        })),
        offered: course.sem_offered,
      });
    });

    setPlan({
      code: curric.code,
      sems: no_of_sems,
      courses: sems.map((s) => s.courses).flat(),
      year: data.year,
      max_units: program.max_units,
      total_units: curric.total_units,
      special: {
        ELECTIVE: [],
        MAJOR: [],
        SPECIALIZED: [],
        TRACK: [],
        COGNATE: [],
      },
    });

    updateReq();
    setNewPlanOpen(false);
    reset();
  };

  return (
    <Modal
      isOpen={newPlanOpen}
      close={() => () => {
        reset();
        setNewPlanOpen(isSubmitting);
      }}
      width="w-[512px]"
      title="Create a new Plan"
    >
      <div className="flex flex-col pb-3">
        <form
          id="selectplan"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <Select
            {...register("degree_program")}
            label="Select Degree Program"
            error={errors.degree_program?.message}
            options={programs.map((p) => ({
              label: p.title,
              value: p.id.toString(),
            }))}
          />
          <Select
            {...register("curriculum")}
            label="Select Curriculum"
            error={errors.curriculum?.message}
            options={curricula
              .filter(
                (c) => c.program_id.toString() === watch("degree_program"),
              )
              .map((c) => ({
                label: c.name,
                value: c.code,
              }))}
          />
          <Input
            {...register("year")}
            label="Starting Year"
            width="col-span-2"
            error={errors.year?.message}
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => {
                reset();
                setNewPlanOpen(isSubmitting);
              }}
              disabled={isSubmitting}
              variant="base"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="md"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddPlanModal;
