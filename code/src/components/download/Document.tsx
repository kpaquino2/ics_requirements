import cas_ge_pos from "@/static/forms/cas_ge_pos.json";
import ceat_ge_pos from "@/static/forms/ceat_ge_pos.json";
import cdc_ge_pos from "@/static/forms/cdc_ge_pos.json";
import cem_ge_pos from "@/static/forms/cem_ge_pos.json";
import cfnr_ge_pos from "@/static/forms/cfnr_ge_pos.json";
import che_ge_pos from "@/static/forms/che_ge_pos.json";
import bscs_pos from "@/static/forms/bscs_pos.json";
import { Form } from "@pdfme/ui";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import Select from "../ui/forms/Select";
import { Template } from "@pdfme/common";
import Button from "../ui/Button";
import { DownloadSimple } from "@phosphor-icons/react";
import { usePlanStore } from "@/lib/store/planStore";
import { generate } from "@pdfme/generator";
import { Plan } from "@/lib/types";

const templates = [
  { label: "CAS - GE Plan of Study", json: cas_ge_pos, include_prereq: false },
  { label: "CDC - GE Plan of Study", json: cdc_ge_pos, include_prereq: false },
  {
    label: "CEAT - GE Plan of Study",
    json: ceat_ge_pos,
    include_prereq: false,
  },
  { label: "CEM - GE Plan of Study", json: cem_ge_pos, include_prereq: false },
  {
    label: "CFNR - GE Plan of Study",
    json: cfnr_ge_pos,
    include_prereq: false,
  },
  { label: "CHE - GE Plan of Study", json: che_ge_pos, include_prereq: false },
  { label: "BSCS Plan of Study", json: bscs_pos, include_prereq: true },
];

const nthNumber = (number: number) => {
  return number > 0
    ? ["th", "st", "nd", "rd"][
        (number > 3 && number < 21) || number % 10 > 3 ? 0 : number % 10
      ]
    : "";
};

const Document = () => {
  const formRef = useRef<HTMLDivElement | null>(null);
  const form = useRef<Form | null>(null);
  const a = useRef<HTMLAnchorElement | null>(null);
  const [template, setTemplate] = useState<{
    label: string;
    json: Template;
    include_prereq: boolean;
  } | null>(null);
  const plan = usePlanStore((state) => state.plan);

  useEffect(() => {
    const getInputs = () => {
      const input: Record<string, string> = {};
      if (!template || !plan) return [input];
      if (template.label.includes("GE Plan of Study")) {
        const ge_courses = new Map([
          ["ARTS 1", "arts1"],
          ["COMM 10", "comm10"],
          ["ETHICS 1", "ethics1"],
          ["KAS 1", "kas1"],
          ["HIST 1", "hist1"],
          ["STS 1", "sts1"],
          ["PI 10", "pi10"],
          ["HUM 3", "hum3"],
          ["KAS 4", "kas4"],
          ["MATH 10", "math10"],
          ["PHILARTS 1", "philarts1"],
          ["PHLO 1", "phlo1"],
          ["PS 21", "ps21"],
          ["SAS 1", "sas1"],
          ["SCIENCE 10", "science10"],
          ["SCIENCE 11", "science11"],
          ["SOSC 3", "sosc3"],
          ["WIKA 1", "wika1"],
        ]);
        plan.courses.forEach((course) => {
          const k = ge_courses.get(course.code);
          if (!k) return;
          const sem = (course.sem % 3) + 1;
          const year = Math.floor(course.sem / 3) + plan.year;
          input[k] =
            sem > 2
              ? `Midyear ${year}`
              : `${sem}${nthNumber(sem)} Sem AY ${year}-${year + 1}`;
          input[k + "_units"] = "3";
        });
      } else {
        const keys = ["MAJOR", "ELECTIVE", "SPECIALIZED", "TRACK", "COGNATE"];
        Object.keys(plan.special).forEach((key) => {
          plan.special[key as keyof typeof plan.special].forEach(
            (course, i) => {
              const inputKey = key.toLowerCase() + "_" + (i + 1) + "_";
              const sem = (course.sem % 3) + 1;
              const year = Math.floor(course.sem / 3) + plan.year;
              input[inputKey + "code"] = course.code;
              input[inputKey + "units"] = course.units.toString();
              input[inputKey + "title"] = course.title;
              input[inputKey + "time"] =
                sem > 2
                  ? `Midyear ${year}`
                  : `${sem}${nthNumber(sem)} Sem ${year}-${year + 1}`;
              input[inputKey + "prereq"] = "-";
              if (template.include_prereq) {
                const req =
                  course.reqs.find((r) => r.status === "COMPLETE") ||
                  course.reqs.find((r) => r.type === "PRE");
                if (!req) return;
                req.courses.map((c) => c);
                input[inputKey + "prereq"] = req.courses
                  .map((c) => c)
                  .join(", ");
              }
            },
          );
        });
      }
      return [input];
    };

    if (formRef.current && form.current === null && template) {
      form.current = new Form({
        domContainer: formRef.current,
        template: template.json,
        inputs: getInputs(),
      });
    } else if (form.current && template) {
      form.current?.updateTemplate(template.json);
      form.current.setInputs(getInputs());
    }
  }, [plan, plan?.courses, plan?.year, template]);

  const onChange: ChangeEventHandler = (e) => {
    const v = parseInt((e.target as HTMLSelectElement).value);
    if (v < 0) return;
    setTemplate(templates[v]);
  };

  const props = { onChange: onChange };

  const download = () => {
    if (!form.current || !template) return;
    generate({
      template: template.json,
      inputs: form.current.getInputs(),
    }).then((pdf) => {
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const inputs = form.current?.getInputs();
      if (!a.current || !inputs) return;
      a.current.download =
        (inputs[0].last_name || inputs[0].name || []) + " - " + template.label;
      a.current.href = url;
      a.current.click();
    });
  };

  return (
    <div className="grid gap-2">
      <Select
        label="Select document"
        options={templates.map((t, i) => ({
          label: t.label,
          value: i,
        }))}
        {...props}
      />
      {template && (
        <div className="flex justify-between">
          <div className="mt-2">
            Fill in the{" "}
            <span className="border-1 border border-dashed border-blue-400 p-2">
              light blue border boxes
            </span>{" "}
            and click the Download button.
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!template}
            onClick={() => download()}
          >
            <DownloadSimple size={24} weight="bold" />
            Download
          </Button>
        </div>
      )}
      <div ref={formRef} />
      <a ref={a} className="display-none" />
    </div>
  );
};

export default Document;
