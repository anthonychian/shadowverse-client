import React, { useState } from "react";
import imas from "../../assets/logo/imas.png";
import { useDispatch } from "react-redux";
import { createLessonTokens } from "../../redux/CardSlice";
import img from "../../assets/pin_bellringer_angel.png";

export default function Lesson() {
  const dispatch = useDispatch();

  const handleGenerateLessons = () => {
    dispatch(createLessonTokens());
  };

  return (
    <>
      <div
        onClick={handleGenerateLessons}
        style={{
          cursor: `url(${img}) 55 55, auto`,
        }}
      >
        <img height={"50px"} src={imas} alt={"token"} />
        <div
          style={{
            width: "50px",
            color: "white",
          }}
        >
          Lesson
        </div>
      </div>
    </>
  );
}
