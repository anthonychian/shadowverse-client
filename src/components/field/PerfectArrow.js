import * as React from "react";
import { getArrow } from "perfect-arrows";
import { useDispatch } from "react-redux";
import { setEnemyArrow } from "../../redux/CardSlice";

export function PerfectArrow({ pos, idx, distance, onEnemyField = false }) {
  let p1 = { x: 0, y: 0 };
  switch (idx) {
    case 0:
      p1 = { x: 300 * adjustArrowPositionX(), y: 250 };
      break;
    case 1:
      p1 = { x: 500 * adjustArrowPositionX(), y: 250 };
      break;
    case 2:
      p1 = { x: 650 * adjustArrowPositionX(), y: 250 };
      break;
    case 3:
      p1 = { x: 750 * adjustArrowPositionX(), y: 250 };
      break;
    case 4:
      p1 = { x: 850 * adjustArrowPositionX(), y: 250 };
      break;
    case 5:
      p1 = { x: 300 * adjustArrowPositionX(), y: 85 };
      break;
    case 6:
      p1 = { x: 500 * adjustArrowPositionX(), y: 85 };
      break;
    case 7:
      p1 = { x: 650 * adjustArrowPositionX(), y: 85 };
      break;
    case 8:
      p1 = { x: 750 * adjustArrowPositionX(), y: 85 };
      break;
    case 9:
      p1 = { x: 850 * adjustArrowPositionX(), y: 85 };
      break;
    default:
      p1 = { x: 850 * adjustArrowPositionX(), y: 85 };
  }

  let p2 = {
    x: p1.x - distance.x * adjustArrowPositionY(),
    y: p1.y + distance.y * adjustArrowPositionY(),
  };

  const arrow = getArrow(p1.x, p1.y, p2.x, p2.y, {
    // padStart: 20,
  });

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  function adjustArrowPositionX() {
    return pos.x / getWindowDimensions().width;
  }
  function adjustArrowPositionY() {
    return pos.y / getWindowDimensions().height;
  }

  const [sx, sy, cx, cy, ex, ey, ae] = arrow;

  const endAngleAsDegrees = ae * (180 / Math.PI);
  const dispatch = useDispatch();

  return (
    <>
      <svg
        onClick={() => dispatch(setEnemyArrow({ idx: -1, show: false }))}
        viewBox="0 0 630 700"
        style={{
          // width: 630,
          // height: 700,
          width: "1000",
          height: "90%",
          position: "absolute",
          // top: "10%",
          top: "0%",
          left: 0,
          right: 0,
          marginLeft: "auto",
          marginRight: "auto",
          overflow: "visible",
          // background:
          //   "linear-gradient(to right, rgba(0, 224, 255, 1), rgba(0, 133, 255, 1))",
          // backgroundColor: "green",
          transform: onEnemyField ? "scaleX(-1), scaleY(-1)" : "scaleY(-1)",
          zIndex: 1,
        }}
        stroke="red"
        fill="red"
        strokeWidth={3}
      >
        {/* <circle cx={sx} cy={sy} r={4} /> */}
        <path d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`} fill="none" />
        <polygon
          points="0,-6 12,0, 0,6"
          transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
        />
      </svg>
    </>
  );
}
