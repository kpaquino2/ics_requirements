import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Course, Plan } from "@/lib/types";

interface PlanState {
  plan: Plan | null;
  setPlan: (plan: Plan | null) => void;
  deletePlan: () => void;
  addCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  moveCourse: (courseId: string, dest_sem: number, dest_pos: number) => void;
  addSemester: () => void;
  removeSemester: () => void;
  updateRequisites: () => void;
  updateCourse: (course: Course) => void;
}

const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      setPlan: (plan) => set(() => ({ plan: plan })),
      deletePlan: () => set(() => ({ plan: null })),
      addCourse: (course) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              courses: [...state.plan.courses, course],
            },
          };
        }),
      deleteCourse: (courseId) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              courses: state.plan.courses.filter((c) => c.id !== courseId),
            },
          };
        }),
      moveCourse: (courseId, dest_sem, dest_pos) =>
        set((state) => {
          if (!state.plan) return state;
          const courses = state.plan.courses.map((c) =>
            c.id === courseId ? { ...c, sem: dest_sem, pos: dest_pos } : c,
          );

          return {
            plan: {
              ...state.plan,
              courses: courses,
              requisites: [],
            },
          };
        }),
      addSemester: () =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              sems: state.plan.sems + 1,
            },
          };
        }),
      removeSemester: () =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              sems: state.plan.sems - 1,
            },
          };
        }),
      updateRequisites: () =>
        set((state) => {
          if (!state.plan) return state;
          return {
            ...state,
            plan: {
              ...state.plan,
              courses: state.plan.courses.map((course) => {
                const updatedReqs = course.reqs.map((req) => {
                  let status: "COMPLETE" | "PARTIAL" | "MISSING" | "INVALID" =
                    "COMPLETE";
                  let foundReq = 0;
                  const hasInvalid = req.sys_ids.some((sys_id) => {
                    const standings = new Map([
                      [100005, 0.25],
                      [100004, 0.5],
                      [100003, 0.75],
                    ]);
                    if (standings.has(sys_id)) {
                      const notCounted = [
                        "HK 11",
                        "HK 12",
                        "HK 13",
                        "NSTP 1",
                        "NSTP 2",
                      ];

                      const unitCount =
                        state.plan?.courses.reduce(
                          (total, { code, sem, units }) => {
                            if (!notCounted.includes(code) && sem < course.sem)
                              return (total += units);
                            return total;
                          },
                          0,
                        ) || 0;

                      const threshold =
                        (standings.get(sys_id) || 0) *
                        (state.plan?.total_units || 0);
                      if (unitCount >= threshold) foundReq++;
                      return unitCount < threshold;
                    }

                    const requisiteCourse = state.plan?.courses.find(
                      (c) => c.sys_id === sys_id,
                    );

                    if (!requisiteCourse) return false;

                    foundReq++;
                    if (
                      (req.type === "PRE" &&
                        requisiteCourse.sem >= course.sem) ||
                      (req.type === "CO" && requisiteCourse.sem !== course.sem)
                    ) {
                      return true;
                    }
                  });

                  if (foundReq === 0) {
                    status = "MISSING";
                  } else if (hasInvalid) {
                    status = "INVALID";
                  } else if (foundReq > 0 && foundReq < req.sys_ids.length) {
                    status = "PARTIAL";
                  } else if (foundReq === req.sys_ids.length) {
                    status = "COMPLETE";
                  }
                  return { ...req, status };
                });

                return { ...course, reqs: updatedReqs };
              }),
            },
          };
        }),
      updateCourse: (course) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            ...state,
            plan: {
              ...state.plan,
              courses: state.plan.courses.map((c) =>
                course.id === c.id ? course : c,
              ),
            },
          };
        }),
    }),
    { name: "plan-storage", storage: createJSONStorage(() => localStorage) },
  ),
);

export { usePlanStore };
