import Button from "@/components/ui/Button";
import Select from "@/components/ui/forms/Select";
import Modal from "@/components/ui/modals/Modal";
import { usePlanStore } from "@/lib/store/planStore";
import { nanoid } from "nanoid";
import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

interface AddPlaceholderCourseModalProps {
  addPlaceholderCourseOpen: boolean;
  setAddPlaceholdeCourseOpen: Dispatch<SetStateAction<boolean>>;
}

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const AddPlaceholderCourseModal = ({
  addPlaceholderCourseOpen,
  setAddPlaceholdeCourseOpen,
}: AddPlaceholderCourseModalProps) => {
  const plan = usePlanStore((state) => state.plan);
  const addCourse = usePlanStore((state) => state.addCourse);
  const [sem, setSem] = useState<number | null>(null);
  const [placeholder, setPlaceholder] = useState("");

  const semprops: { onChange: ChangeEventHandler } = {
    onChange: (e) => {
      const s = parseInt((e.target as HTMLSelectElement).value);
      setSem(s);
    },
  };

  const placeprops: { onChange: ChangeEventHandler } = {
    onChange: (e) => {
      const p = (e.target as HTMLSelectElement).value;
      setPlaceholder(p);
    },
  };

  if (!plan) return <></>;
  return (
    <Modal
      isOpen={addPlaceholderCourseOpen}
      close={() => {
        setAddPlaceholdeCourseOpen(false);
        setSem(null);
        setPlaceholder("");
      }}
      width="w-96"
      title="Add placeholder"
    >
      <div className="grid gap-2">
        <Select
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
          {...semprops}
        />
        <Select
          label="Choose type"
          options={[
            "REQUIRED",
            "GE ELECTIVE",
            "COGNATE",
            "TRACK",
            "SPECIALIZED",
            "ELECTIVE",
            "MAJOR",
          ].map((k) => ({ label: k, value: k }))}
          {...placeprops}
        />
        <div className="mt-2 flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setAddPlaceholdeCourseOpen(false);
              setSem(null);
              setPlaceholder("");
            }}
            variant="base"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={sem === null || !placeholder}
            onClick={() => {
              const filtered = plan.courses
                .filter((c) => c.sem === sem)
                .sort((a, b) => (a.pos > b.pos ? 1 : -1));
              let last = -1;
              for (const f of filtered) {
                if (f.pos - last - 1 >= 1) break;
                last = f.pos;
              }

              addCourse({
                id: nanoid(11),
                sys_id: 0,
                title: "-",
                description: "-",
                code: placeholder,
                units: 0,
                sem: sem ?? 0,
                pos: last + 1,
                reqs: [],
              });
              setAddPlaceholdeCourseOpen(false);
              setSem(null);
              setPlaceholder("");
            }}
            size="md"
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPlaceholderCourseModal;
