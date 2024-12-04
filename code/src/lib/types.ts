type Course = {
  id: string;
  sys_id: number;
  title: string;
  description: string;
  code: string;
  units: number;
  sem: number;
  pos: number;
  reqs: Array<Requisite>;
  offered?: Array<number>;
};

type Requisite = {
  id: number;
  status: "COMPLETE" | "PARTIAL" | "MISSING" | "INVALID";
  courses: Array<string>;
  sys_ids: Array<number>;
  type: string;
};

type Plan = {
  code: string;
  courses: Array<Course>;
  sems: number;
  year: number;
  max_units: number;
  total_units: number;
  special: Record<
    "MAJOR" | "ELECTIVE" | "COGNATE" | "SPECIALIZED" | "TRACK",
    Course[]
  >;
};

export type { Course, Requisite, Plan };
