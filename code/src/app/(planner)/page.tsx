"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import {
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  PencilSimple,
  Plus,
  Rows,
  Selection,
  Strategy,
  Trash,
} from "@phosphor-icons/react";
import AddPlanModal from "@/components/planner/AddPlanModal";
import { usePlanStore } from "@/lib/store/planStore";
import GridLayout from "react-grid-layout";
import SemesterHeader from "@/components/planner/semester/SemesterHeader";
import SemesterFooter from "@/components/planner/semester/SemesterFooter";
import CourseItem from "@/components/planner/course/CourseItem";
import { useConstantsStore } from "@/lib/store/constStore";
import AddCourseModal from "@/components/planner/course/AddCourseModal";
import Connections from "@/components/planner/connections/Connections";
import CourseDetails from "@/components/planner/course/CourseDetails";
import ReplacePlaceholderModal from "@/components/planner/course/ReplacePlaceholderModal";
import CurriculumFooter from "@/components/planner/CurriculumFooter";
import { Menu } from "@headlessui/react";
import CreateCourseModal from "@/components/planner/course/CreateCourseModal";
import { Course } from "@/lib/types";
import AddPlaceholderCourseModal from "@/components/planner/course/AddPlaceholderCourseModal";
import ConfirmActionModal from "@/components/ui/modals/ConfirmActionModal";
import { debounce } from "@/lib/utils";
import { app, auth } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

// TODO login stuff
// TODO more documents

export default function Home() {
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState<Course>();
  const [addPlaceholderCourseOpen, setAddPlaceholdeCourseOpen] =
    useState(false);
  const [onConfirm, setOnConfirm] = useState<null | {
    title: string;
    message: string;
    action: () => void;
  }>(null);
  const [query, setQuery] = useState("");

  const plan = usePlanStore((state) => state.plan);
  const setPlan = usePlanStore((state) => state.setPlan);
  const addSemester = usePlanStore((state) => state.addSemester);
  const moveCourse = usePlanStore((state) => state.moveCourse);
  const updateReq = usePlanStore((state) => state.updateRequisites);
  const deletePlan = usePlanStore((state) => state.deletePlan);

  const zoom = useConstantsStore((state) => state.zoom);
  const lines = useConstantsStore((state) => state.lines);
  const setZoom = useConstantsStore((state) => state.setZoom);
  const resetConstants = useConstantsStore((state) => state.resetConstants);
  const setFocusedLine = useConstantsStore((state) => state.setFocusedLine);
  const setSettings = useConstantsStore((state) => state.setSettings);

  const rowHeight = 66 * (zoom / 100);
  const colWidth = 168 * (zoom / 100);

  const semar = Array.from<number>({ length: plan?.sems || 0 }).fill(0);

  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [user] = useAuthState(auth);
  const db = getFirestore(app);

  // Function to fetch the user's plan from Firestore
  const fetchUserData = useCallback(async () => {
    try {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPlan(userData.plan || null);
        useConstantsStore.setState(() => ({
          lines: new Map(Object.entries(userData.lines || {})),
        }));
        setSettings(userData.settings || null);
      } else {
        console.log("No such user!");
      }
    } catch (error) {
      console.error("Error fetching plan: ", error);
    } finally {
      setFetching(false);
    }
  }, [db, setPlan, setSettings, user]);

  // Fetch the plan on the first render
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSavePlan = useCallback(
    debounce(async (planData) => {
      try {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            plan: planData,
          },
          { merge: true },
        );
        console.log("Plan saved successfully");
      } catch (error) {
        console.error("Error saving plan: ", error);
      }
    }, 1000),
    [user],
  );

  useEffect(() => {
    setLoaded(true);
    debouncedSavePlan(plan);
  }, [plan, debouncedSavePlan]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveLines = useCallback(
    debounce(
      async (linesData: {
        [key: string]: [number, number, number, number, number, number, number];
      }) => {
        try {
          if (!user) return;
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              lines: linesData,
            },
            { merge: true },
          );
          console.log("Lines saved successfully");
        } catch (error) {
          console.error("Error saving lines: ", error);
        }
      },
      1000,
    ),
    [user],
  );

  useEffect(() => {
    debouncedSaveLines(Object.fromEntries(lines));
  }, [debouncedSaveLines, lines]);

  const children = useMemo(() => {
    if (!plan) return <></>;
    return plan.courses.map((course) => (
      <div
        className="pointer-events-none z-[3] flex items-center justify-center "
        key={course.id}
        data-grid={{
          x: course.sem,
          y: course.pos,
          w: 1,
          h: 1,
        }}
      >
        <CourseItem
          handleClick={() => {
            setShowCourseDetails(course);
          }}
          course={course}
          searched={course.code.toLowerCase().includes(query)}
        />
      </div>
    ));
  }, [plan, query]);

  return (
    <>
      <AddPlanModal newPlanOpen={newPlanOpen} setNewPlanOpen={setNewPlanOpen} />
      <ConfirmActionModal onConfirm={onConfirm} setOnConfirm={setOnConfirm} />

      <AddCourseModal
        addCourseOpen={addCourseOpen}
        setAddCourseOpen={setAddCourseOpen}
      />
      <ReplacePlaceholderModal
        replacePlaceholderOpen={showCourseDetails}
        setReplacePlaceholderOpen={setShowCourseDetails}
      />
      <CreateCourseModal
        createCourseOpen={createCourseOpen}
        setCreateCourseOpen={setCreateCourseOpen}
        courseToBeEdited={showCourseDetails}
        setCourseToBeEdited={setShowCourseDetails}
      />
      <AddPlaceholderCourseModal
        addPlaceholderCourseOpen={addPlaceholderCourseOpen}
        setAddPlaceholdeCourseOpen={setAddPlaceholdeCourseOpen}
      />
      {!loaded ? (
        "" // TODO loading screen
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 border-b-2 border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <div className="flex gap-2">
              <div className="flex">
                <Button
                  type="button"
                  onClick={() => setZoom(zoom - 10)}
                  disabled={!plan || zoom <= 50}
                  variant="primary"
                  size="md"
                  grouped
                >
                  <MagnifyingGlassMinus size={16} weight="bold" />
                </Button>
                <Button
                  type="button"
                  onClick={() => setZoom(100)}
                  disabled={!plan}
                  variant="primary"
                  size="md"
                  grouped
                >
                  <span className="w-10">{zoom}%</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setZoom(zoom + 10)}
                  disabled={!plan || zoom >= 150}
                  variant="primary"
                  size="md"
                  grouped
                >
                  <MagnifyingGlassPlus size={16} weight="bold" />
                </Button>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button as={React.Fragment}>
                  <Button
                    type="button"
                    onClick={() => {}}
                    disabled={!plan}
                    variant="primary"
                    size="md"
                  >
                    <Plus weight="bold" size={16} />
                    Course
                  </Button>
                </Menu.Button>
                <Menu.Items className="absolute left-0 z-10 mt-2 flex w-36 origin-top-left flex-col divide-y divide-zinc-100/50 rounded text-zinc-100 shadow-md">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={
                          (active ? "brightness-125" : "") +
                          " flex w-full items-center gap-2 rounded-t bg-maroon p-2"
                        }
                        onClick={() => setAddCourseOpen(true)}
                      >
                        <Rows weight="bold" size={16} />
                        From list
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={
                          (active ? "brightness-125" : "") +
                          " flex w-full items-center gap-2 rounded-b bg-maroon p-2"
                        }
                        onClick={() => {
                          setShowCourseDetails(undefined);
                          setCreateCourseOpen(true);
                        }}
                      >
                        <PencilSimple weight="bold" size={16} />
                        From scratch
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={
                          (active ? "brightness-125" : "") +
                          " flex w-full items-center gap-2 rounded-b bg-maroon p-2"
                        }
                        onClick={() => setAddPlaceholdeCourseOpen(true)}
                      >
                        <Selection weight="bold" size={16} />
                        Placeholder
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
              <Button
                type="button"
                onClick={() => addSemester()}
                disabled={!plan}
                variant="primary"
                size="md"
              >
                <Plus weight="bold" size={16} />
                Semester
              </Button>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  disabled={!plan}
                  type="text"
                  className="w-full rounded border-2 border-zinc-300 bg-inherit px-3 py-1 pl-8 focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon dark:border-zinc-700"
                  placeholder="Find course..."
                  onChange={(e) =>
                    setQuery(e.target.value.toLowerCase().trim())
                  }
                />
                <MagnifyingGlass
                  size={20}
                  weight="bold"
                  className="absolute left-2 top-2 my-auto text-zinc-500 "
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setOnConfirm({
                    title: "Delete plan",
                    message: "Are you sure you want to delete this plan?",
                    action: () => {
                      deletePlan();
                      resetConstants();
                    },
                  });
                }}
                disabled={!plan}
                variant="primary"
                size="md"
              >
                <Trash weight="bold" size={16} />
                Delete plan
              </Button>
            </div>
          </div>
          {plan ? (
            <div className="relative flex flex-1 flex-col overflow-x-auto overflow-y-hidden">
              <GridLayout
                width={plan.sems * colWidth}
                cols={plan.sems}
                className={"layout"}
                rowHeight={40 * (zoom / 100)}
                style={{
                  width: plan.sems * colWidth,
                }}
                isResizable={false}
                isDraggable={false}
                margin={[0, 0]}
              >
                {semar.map((_, i) => (
                  <div
                    key={i}
                    className="group/sem z-[3] border-b-2 border-r-2 border-zinc-200 px-2 dark:border-zinc-800"
                    data-grid={{
                      x: i,
                      y: 0,
                      w: 1,
                      h: 1,
                    }}
                  >
                    <SemesterHeader index={i} />
                  </div>
                ))}
              </GridLayout>
              <Connections course={showCourseDetails} />
              <CourseDetails
                courseProp={showCourseDetails}
                setCourseProp={setShowCourseDetails}
                setEditCourseOpen={setCreateCourseOpen}
              />
              <GridLayout
                width={plan.sems * colWidth}
                cols={plan.sems}
                className={`layout flex-1 overflow-visible from-transparent to-zinc-200 dark:to-zinc-800`}
                rowHeight={rowHeight}
                style={{
                  width: plan.sems * colWidth,
                  backgroundSize: colWidth,
                }}
                resizeHandles={[]}
                compactType={null}
                preventCollision={true}
                autoSize={true}
                // useCSSTransforms={false}
                margin={[0, 0]}
                isDraggable={true}
                onDrag={(l, o, n) => {
                  setShowCourseDetails(undefined);
                  setFocusedLine("");
                }}
                onDragStop={(l, o, n) => {
                  moveCourse(n.i, n.x, n.y);
                  updateReq();
                }}
                isBounded={true}
                draggableHandle=".draggable"
              >
                {children}
              </GridLayout>

              <GridLayout
                width={plan.sems * colWidth}
                cols={plan.sems}
                className={`layout`}
                rowHeight={40 * (zoom / 100)}
                style={{
                  width: plan.sems * colWidth,
                }}
                isResizable={false}
                isDraggable={false}
                margin={[0, 0]}
              >
                {semar.map((_, i) => (
                  <div
                    key={i}
                    className="pointer-events-none z-[4] border-r-2 border-t-2 border-zinc-200 bg-zinc-100/90 p-2 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                    data-grid={{
                      x: i,
                      y: 0,
                      w: 1,
                      h: 1,
                    }}
                  >
                    <SemesterFooter semNumber={i} />
                  </div>
                ))}
              </GridLayout>
            </div>
          ) : (
            <div className="m-auto flex w-full max-w-[700px] flex-col items-center rounded-xl border-4 border-dashed border-zinc-200 py-5 dark:border-zinc-800">
              <div className="text-3xl">No degree plan yet</div>
              <div className="mb-2 text-lg text-zinc-600 dark:text-zinc-400">
                Click the button below to start planning
              </div>
              <Button
                type="button"
                onClick={() => setNewPlanOpen(true)}
                variant="primary"
                size="lg"
                disabled={fetching}
              >
                <Strategy weight="regular" size={24} />
                New plan
              </Button>
            </div>
          )}
          <CurriculumFooter />
        </>
      )}
    </>
  );
}
