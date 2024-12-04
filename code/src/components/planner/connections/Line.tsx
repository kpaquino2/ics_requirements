import { useConstantsStore } from "@/lib/store/constStore";
import { Course } from "@/lib/types";
import { useRef, useState, useEffect, useMemo } from "react";
import Draggable, { DraggableEvent } from "react-draggable";

interface LineProps {
  courseA: Course;
  courseB: Course;
  type: string;
  showCode: string;
}

const Line = ({ courseA, courseB, type, showCode }: LineProps) => {
  const zoom = useConstantsStore((state) => state.zoom);
  const settings = useConstantsStore((state) => state.settings);
  const head = 40;
  const rowHeight = 66;
  const colWidth = 168;
  const headSize = 5;

  const [intersectionsL, setIntersectionsL] = useState<Set<number>>(new Set());
  const [intersectionsR, setIntersectionsR] = useState<Set<number>>(new Set());

  const start = useMemo<[number, number]>(
    () => [
      (courseA.sem + 1) * colWidth - colWidth / 8,
      courseA.pos * rowHeight + head + rowHeight / 2,
    ],
    [colWidth, courseA.pos, courseA.sem, head, rowHeight],
  );
  const end: [number, number] = useMemo(
    () => [
      courseB.sem * colWidth + colWidth / 8,
      courseB.pos * rowHeight + head + rowHeight / 2,
    ],
    [colWidth, courseB.pos, courseB.sem, head, rowHeight],
  );

  const focused = useConstantsStore((state) => state.focusedLine);
  const setFocusedLine = useConstantsStore((state) => state.setFocusedLine);
  const lines = useConstantsStore((state) => state.lines);
  const nodeRef1 = useRef<(HTMLElement & SVGPathElement) | null>(null);
  const nodeRef2 = useRef<(HTMLElement & SVGPathElement) | null>(null);
  const nodeRef3 = useRef<(HTMLElement & SVGPathElement) | null>(null);
  const [[left, mid, right], setOffsets] = useState([
    0,
    (end[0] - start[0]) / 2,
    0,
  ]);

  if (!lines.has(courseA.id + courseB.id))
    useConstantsStore.setState((prev) => ({
      lines: new Map(prev.lines).set(courseA.id + courseB.id, [
        start[0],
        start[1],
        end[0],
        end[1],
        left,
        mid,
        right,
      ]),
    }));

  const updateLines = (l: number, m: number, r: number, e: DraggableEvent) => {
    useConstantsStore.setState((prev) => ({
      lines: new Map(prev.lines).set(courseA.id + courseB.id, [
        start[0],
        start[1],
        end[0],
        end[1],
        left + l,
        mid + m,
        right + r,
      ]),
    }));
    setFocusedLine(
      e.type === "mousemove"
        ? courseA.id + courseB.id
        : e.type === "mouseup"
          ? focused
          : e.type === "mousedown"
            ? focused === courseA.id + courseB.id
              ? ""
              : courseA.id + courseB.id
            : "",
    );
  };

  useEffect(() => {
    if (showCode) setFocusedLine("");
    setIntersectionsL(new Set());
    setIntersectionsR(new Set());
    lines.forEach((p, k) => {
      if (
        showCode &&
        settings.show_select &&
        (![courseA.id, courseB.id].includes(showCode) || !k.includes(showCode))
      )
        return;
      // FIXME if two horizontal lines from the same connection have the same y
      const [v1x1, v1y1, v1x2, v1y2] = [
        p[0] + headSize * 2,
        p[1],
        p[0] + headSize * 2,
        p[1] + p[4],
      ];
      const [h1x1, h1y1, h1x2, h1y2] = [
        start[0] + headSize * 2,
        start[1] + left,
        start[0] + mid,
        start[1] + left,
      ];
      const [v2x1, v2y1, v2x2, v2y2] = [
        p[0] + p[5],
        p[1] + p[4],
        p[0] + p[5],
        p[3] + p[6],
      ];
      const [h2x1, h2y1, h2x2, h2y2] = [
        start[0] + mid,
        end[1] + right,
        end[0] - headSize * 2,
        end[1],
      ];
      const [v3x1, v3y1, v3x2, v3y2] = [
        p[2] - headSize * 2,
        p[3] + p[6],
        p[2] - headSize * 2,
        p[3],
      ];

      if (
        h1y1 < Math.max(v1y1, v1y2) &&
        h1y1 > Math.min(v1y1, v1y2) &&
        v1x1 > h1x1 &&
        v1x1 < h1x2
      )
        setIntersectionsL((prev) => prev.add(v1x1));

      if (
        h1y1 < Math.max(v2y1, v2y2) &&
        h1y1 > Math.min(v2y1, v2y2) &&
        v2x1 > h1x1 &&
        v2x1 < h1x2
      )
        setIntersectionsL((prev) => prev.add(v2x1));

      if (
        h1y1 < Math.max(v3y1, v3y2) &&
        h1y1 > Math.min(v3y1, v3y2) &&
        v3x1 > h1x1 &&
        v3x1 < h1x2
      )
        setIntersectionsL((prev) => prev.add(v3x1));

      if (
        h2y1 < Math.max(v1y1, v1y2) &&
        h2y1 > Math.min(v1y1, v1y2) &&
        v1x1 > h2x1 &&
        v1x1 < h2x2
      )
        setIntersectionsR((prev) => prev.add(v1x1));

      if (
        h2y1 < Math.max(v2y1, v2y2) &&
        h2y1 > Math.min(v2y1, v2y2) &&
        v2x1 > h2x1 &&
        v2x1 < h2x2
      )
        setIntersectionsR((prev) => prev.add(v2x1));

      if (
        h2y1 < Math.max(v3y1, v3y2) &&
        h2y1 > Math.min(v3y1, v3y2) &&
        v3x1 > h2x1 &&
        v3x1 < h2x2
      )
        setIntersectionsR((prev) => prev.add(v3x1));
    });
    const l = lines.get(courseA.id + courseB.id);
    if (l)
      setOffsets([
        Math.max(l[4], -start[1] + head + headSize * 2),
        Math.min(l[5], end[0] - start[0] - headSize * 2),
        Math.max(l[6], -end[1] + head + headSize * 2),
      ]);
  }, [
    courseA.id,
    courseB.id,
    end,
    headSize,
    head,
    left,
    lines,
    mid,
    right,
    start,
    showCode,
    settings.show_select,
    setFocusedLine,
  ]);

  const generatePath = (
    axis: number,
    from: number,
    to: number,
    intersections: Set<number>,
  ) => {
    let d = `M ${from} ${axis}`; // Move to start position
    // Sort intersections based on y-coordinate
    const sorted = Array.from(intersections).sort((a, b) => a - b);

    sorted.forEach((jumpCenter) => {
      if (!settings.show_arrows) return;
      const jumpX = jumpCenter;
      const jumpStartX = jumpX - headSize; // start of the jump
      const jumpEndX = jumpX + headSize; // end of the jump

      // Draw line to the start of the jump)
      d += ` L ${jumpStartX} ${axis}`;

      // Draw the jump arc
      d += ` A ${headSize} ${headSize} 0 0 1 ${jumpEndX} ${axis}`;
    });

    d += ` L ${to} ${axis}`;

    return d;
  };

  return (
    <g
      className={
        "pointer-events-auto relative isolate scale-100  " +
        ([courseA.id, courseB.id].includes(showCode)
          ? "stroke-maroon"
          : focused === courseA.id + courseB.id
            ? "stroke-transparent"
            : "stroke-zinc-400 dark:stroke-zinc-600")
      }
      style={{
        strokeWidth: 2,
        scale: zoom / 100,
      }}
    >
      {type === "PRE" && (
        <>
          <circle
            cx={start[0]}
            cy={start[1]}
            r={headSize}
            className={
              [courseA.id, courseB.id].includes(showCode)
                ? "fill-maroon"
                : "fill-zinc-400 dark:fill-zinc-600"
            }
          />
          <path
            className="cursor-pointer"
            d={`M ${start[0]} ${start[1]} L ${start[0] + headSize * 2} ${start[1]}`}
            onMouseDown={(e) => updateLines(0, 0, 0, e)}
          />
          <path
            className="cursor-pointer"
            d={`M ${start[0] + headSize * 2} ${start[1]} L ${start[0] + headSize * 2} ${start[1] + left}`}
            onMouseDown={(e) => updateLines(0, 0, 0, e)}
          />
          <Draggable
            axis="y"
            bounds={{ top: -27, bottom: 27 }}
            position={{ x: 0, y: left }}
            onDrag={(e, d) => updateLines(d.deltaY, 0, 0, e)}
            onStart={(e, d) => updateLines(d.deltaY, 0, 0, e)}
            onStop={(e, d) => updateLines(d.deltaY, 0, 0, e)}
            nodeRef={nodeRef1}
          >
            <path
              ref={nodeRef1}
              className="cursor-ns-resize"
              d={generatePath(
                start[1],
                start[0] + headSize * 2,
                start[0] + mid,
                intersectionsL,
              )}
            />
          </Draggable>
          <Draggable
            axis="x"
            onDrag={(e, d) => updateLines(0, d.deltaX, 0, e)}
            onStart={(e, d) => updateLines(0, d.deltaX, 0, e)}
            onStop={(e, d) => updateLines(0, d.deltaX, 0, e)}
            position={{ x: mid, y: 0 }}
            bounds={{
              left: headSize * 2,
              right: end[0] - start[0] - headSize * 2,
            }}
            nodeRef={nodeRef2}
          >
            <path
              ref={nodeRef2}
              className="cursor-ew-resize"
              d={`M ${start[0]} ${start[1] + left} L ${start[0]} ${end[1] + right}`}
            />
          </Draggable>
          <Draggable
            axis="y"
            bounds={{ top: -27, bottom: 27 }}
            position={{ x: 0, y: right }}
            onDrag={(e, d) => updateLines(0, 0, d.deltaY, e)}
            onStart={(e, d) => updateLines(0, 0, d.deltaY, e)}
            onStop={(e, d) => updateLines(0, 0, d.deltaY, e)}
            nodeRef={nodeRef3}
          >
            <path
              ref={nodeRef3}
              className="cursor-ns-resize"
              d={generatePath(
                end[1],
                start[0] + mid,
                end[0] - headSize * 2,
                intersectionsR,
              )}
            />
          </Draggable>
          <path
            className="cursor-pointer"
            d={`M ${end[0] - headSize * 2} ${end[1] + right} L ${end[0] - headSize * 2} ${end[1]}`}
            onMouseDown={(e) => updateLines(0, 0, 0, e)}
          />
          <path
            className="cursor-pointer"
            d={`M ${end[0] - headSize * 2} ${end[1]} L ${end[0]} ${end[1]}`}
            onMouseDown={(e) => updateLines(0, 0, 0, e)}
          />

          <path
            className={
              [courseA.id, courseB.id].includes(showCode)
                ? "fill-maroon"
                : "fill-zinc-400 dark:fill-zinc-600"
            }
            d={`M ${end[0] - headSize} ${end[1] - headSize}
            L ${end[0]} ${end[1]}
            L ${end[0] - headSize} ${end[1] + headSize}
          `}
          />
          {settings.animate && [courseA.id, courseB.id].includes(showCode) && (
            <polygon
              points={`0,${-headSize} ${headSize},0 0,${headSize} ${-headSize},0`}
              className="rounded fill-maroon"
            >
              <animateMotion
                dur={
                  (end[0] -
                    start[0] +
                    Math.abs(end[1] - start[1] + left + right)) *
                  0.01
                }
                repeatCount="indefinite"
                rotate="auto"
                path={`M ${start[0]} ${start[1]}
            L ${start[0] + headSize * 2} ${start[1]}
            L ${start[0] + headSize * 2} ${start[1] + left}
            L ${start[0] + mid} ${start[1] + left}
            L ${start[0] + mid} ${end[1] + right}
            L ${end[0] - headSize * 2} ${end[1] + right}
            L ${end[0] - headSize * 2} ${end[1]}
            L ${end[0]} ${end[1]}
          `}
              />
            </polygon>
          )}
        </>
      )}
    </g>
  );
};

export default Line;
