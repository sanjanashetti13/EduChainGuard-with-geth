import React from "react";
import { motion } from "framer-motion";

import { cn } from "lib/utils";

/** Default grid tuned for SPA performance (prompt used 150×100 ≈15k nodes, which freezes the UI). */
const DEFAULT_ROWS = 22;
const DEFAULT_COLS = 16;

export type BoxesCoreProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  rows?: number;
  cols?: number;
};

export const BoxesCore = ({
  className,
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  ...rest
}: BoxesCoreProps) => {
  const rowsArr = React.useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows]);
  const colsArr = React.useMemo(() => Array.from({ length: cols }, (_, j) => j), [cols]);

  const getRandomColor = React.useCallback(() => {
    const palette = [
      "rgb(125 211 252)",
      "rgb(249 168 212)",
      "rgb(134 239 172)",
      "rgb(253 224 71)",
      "rgb(252 165 165)",
      "rgb(216 180 254)",
      "rgb(147 197 253)",
      "rgb(165 180 252)",
      "rgb(196 181 253)",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }, []);

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute left-1/4 top-0 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/4 p-4 lg:-translate-y-1/2",
        className
      )}
      {...rest}
    >
      {rowsArr.map((i) => (
        <motion.div
          key={`row-${i}`}
          className="relative h-8 w-16 border-l border-slate-700"
        >
          {colsArr.map((j) => (
            <motion.div
              key={`col-${i}-${j}`}
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              className="relative h-8 w-16 border-r border-t border-slate-700"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 stroke-[1px] text-slate-700"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
