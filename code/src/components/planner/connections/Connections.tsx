import { usePlanStore } from "@/lib/store/planStore";
import Line from "./Line";
import { Course } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { useConstantsStore } from "@/lib/store/constStore";

interface ConnectionsProps {
  course?: Course;
}

const Connections = ({ course }: ConnectionsProps) => {
  const plan = usePlanStore((state) => state.plan);
  const focusedLine = useConstantsStore((state) => state.focusedLine);
  const zoom = useConstantsStore((state) => state.zoom);
  const lines = useConstantsStore((state) => state.lines);
  const settings = useConstantsStore((state) => state.settings);
  const headSize = 5;

  const [loaded, setLoaded] = useState(false);
  const setFocusedLine = useConstantsStore((state) => state.setFocusedLine);

  useEffect(() => {
    setLoaded(true);
  }, [lines]);

  if (!plan) return <></>;
  const reqsList = plan.courses
    .map((course) =>
      course.reqs
        .filter((req) => req.status === "COMPLETE")
        .map((req) =>
          req.courses.map((req_c) => [req_c, course.code, req.type]),
        )
        .flat(1),
    )
    .flat(1);

  const completeReqs: ([Course, Course, string] | undefined)[] = reqsList.map(
    (r) => {
      const courseA = plan.courses.find((c) => c.code === r[0]);
      const courseB = plan.courses.find((c) => c.code === r[1]);
      if (!courseA || !courseB) return;
      return [courseA, courseB, r[2]];
    },
  );

  const show: ([Course, Course, string] | undefined)[] = completeReqs.map(
    (cr) => {
      if (!cr || !course) return;
      if (cr[1].code === course.code || cr[0].code === course.code) return cr;
    },
  );
  if (!lines) return <></>;
  const fl = lines.get(focusedLine);

  return (
    <svg
      className="pointer-events-none absolute z-[2] h-full w-full scale-100 overflow-visible fill-none"
      id="connections"
    >
      {(course && settings.show_select
        ? show
        : settings.show_arrows
          ? completeReqs
          : []
      ).map((req, i) =>
        req ? (
          <Line
            courseA={req[0]}
            courseB={req[1]}
            type={req[2]}
            key={i}
            showCode={course?.id || ""}
          />
        ) : (
          <React.Fragment key={i} />
        ),
      )}
      {settings.show_arrows && (!course || !settings.show_select) && fl && (
        <g
          className="stroke-maroon"
          style={{
            strokeWidth: 2,
            scale: zoom / 100,
          }}
        >
          <circle cx={fl[0]} cy={fl[1]} r={headSize} className="fill-maroon " />
          <path
            className=""
            d={`M ${fl[0]} ${fl[1]}
            L ${fl[0] + headSize * 2} ${fl[1]}
            L ${fl[0] + headSize * 2} ${fl[1] + fl[4]}
            L ${fl[0] + fl[5]} ${fl[1] + fl[4]}
            L ${fl[0] + fl[5]} ${fl[3] + fl[6]}
            L ${fl[2] - headSize * 2} ${fl[3] + fl[6]}
            L ${fl[2] - headSize * 2} ${fl[3]}
            L ${fl[2]} ${fl[3]}
          `}
          />
          <path
            className="fill-maroon "
            d={`M ${fl[2] - headSize} ${fl[3] - headSize}
            L ${fl[2]} ${fl[3]}
            L ${fl[2] - headSize} ${fl[3] + headSize}
          `}
          />
          {settings.animate && (
            <polygon
              points={`0,${-headSize} ${headSize},0 0,${headSize} ${-headSize},0`}
              className="rounded fill-maroon"
            >
              <animateMotion
                dur={(fl[2] - fl[0] + Math.abs(fl[3] - fl[1])) * 0.01}
                repeatCount="indefinite"
                rotate="auto"
                path={`M ${fl[0]} ${fl[1]}
                L ${fl[0] + headSize * 2} ${fl[1]}
                L ${fl[0] + headSize * 2} ${fl[1] + fl[4]}
                L ${fl[0] + fl[5]} ${fl[1] + fl[4]}
                L ${fl[0] + fl[5]} ${fl[3] + fl[6]}
                L ${fl[2] - headSize * 2} ${fl[3] + fl[6]}
                L ${fl[2] - headSize * 2} ${fl[3]}
                L ${fl[2]} ${fl[3]}
              `}
              />
            </polygon>
          )}
        </g>
      )}
    </svg>
  );
};

export default Connections;
