import React, { useEffect } from "react";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import IconButton from "@mui/material/IconButton";
import "../css/Voicelines.css";

import greetingCernunnos from "../assets/leaders/Cernunnos/Greeting.mp3";
import thanksCernunnos from "../assets/leaders/Cernunnos/Thanks.mp3";
import apologyCernunnos from "../assets/leaders/Cernunnos/Apology.mp3";
import impressedCernunnos from "../assets/leaders/Cernunnos/Impressed.mp3";
import tauntCernunnos from "../assets/leaders/Cernunnos/Taunt.mp3";
import startCernunnos from "../assets/leaders/Cernunnos/Start.mp3";

import greetingMizuchi from "../assets/leaders/Mizuchi/Greeting.mp3";
import thanksMizuchi from "../assets/leaders/Mizuchi/Thanks.mp3";
import apologyMizuchi from "../assets/leaders/Mizuchi/Apology.mp3";
import impressedMizuchi from "../assets/leaders/Mizuchi/Impressed.mp3";
import tauntMizuchi from "../assets/leaders/Mizuchi/Taunt.mp3";
import startMizuchi from "../assets/leaders/Mizuchi/Start.mp3";

import greetingForte from "../assets/leaders/Forte/Greeting.mp3";
import thanksForte from "../assets/leaders/Forte/Thanks.mp3";
import apologyForte from "../assets/leaders/Forte/Apology.mp3";
import impressedForte from "../assets/leaders/Forte/Impressed.mp3";
import tauntForte from "../assets/leaders/Forte/Taunt.mp3";
import startForte from "../assets/leaders/Forte/Start.mp3";

import greetingPompom from "../assets/leaders/Pompom/Greeting.mp3";
import thanksPompom from "../assets/leaders/Pompom/Thanks.mp3";
import apologyPompom from "../assets/leaders/Pompom/Apology.mp3";
import impressedPompom from "../assets/leaders/Pompom/Impressed.mp3";
import tauntPompom from "../assets/leaders/Pompom/Taunt.mp3";
import startPompom from "../assets/leaders/Pompom/Start.mp3";

import greetingDaria from "../assets/leaders/Daria/Greeting.mp3";
import thanksDaria from "../assets/leaders/Daria/Thanks.mp3";
import apologyDaria from "../assets/leaders/Daria/Apology.mp3";
import impressedDaria from "../assets/leaders/Daria/Impressed.mp3";
import tauntDaria from "../assets/leaders/Daria/Taunt.mp3";
import startDaria from "../assets/leaders/Daria/Start.mp3";

import greetingAlbert from "../assets/leaders/Albert/Greeting.mp3";
import thanksAlbert from "../assets/leaders/Albert/Thanks.mp3";
import apologyAlbert from "../assets/leaders/Albert/Apology.mp3";
import impressedAlbert from "../assets/leaders/Albert/Impressed.mp3";
import tauntAlbert from "../assets/leaders/Albert/Taunt.mp3";
import startAlbert from "../assets/leaders/Albert/Start.mp3";

import greetingAria from "../assets/leaders/Aria/Greeting.mp3";
import thanksAria from "../assets/leaders/Aria/Thanks.mp3";
import apologyAria from "../assets/leaders/Aria/Apology.mp3";
import impressedAria from "../assets/leaders/Aria/Impressed.mp3";
import tauntAria from "../assets/leaders/Aria/Taunt.mp3";
import startAria from "../assets/leaders/Aria/Start.mp3";

import greetingExella from "../assets/leaders/Exella/Greeting.mp3";
import thanksExella from "../assets/leaders/Exella/Thanks.mp3";
import apologyExella from "../assets/leaders/Exella/Apology.mp3";
import impressedExella from "../assets/leaders/Exella/Impressed.mp3";
import tauntExella from "../assets/leaders/Exella/Taunt.mp3";
import startExella from "../assets/leaders/Exella/Start.mp3";

import greetingRola from "../assets/leaders/Rola/Greeting.mp3";
import thanksRola from "../assets/leaders/Rola/Thanks.mp3";
import apologyRola from "../assets/leaders/Rola/Apology.mp3";
import impressedRola from "../assets/leaders/Rola/Impressed.mp3";
import tauntRola from "../assets/leaders/Rola/Taunt.mp3";
import startRola from "../assets/leaders/Rola/Start.mp3";

export default function Voicelines({ name }) {
  let greeting, thanks, apology, impressed, taunt, start;
  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";

  switch (name) {
    case "Cernunnos":
      greeting = new Audio(greetingCernunnos);
      thanks = new Audio(thanksCernunnos);
      apology = new Audio(apologyCernunnos);
      impressed = new Audio(impressedCernunnos);
      taunt = new Audio(tauntCernunnos);
      start = new Audio(startCernunnos);
      break;
    case "Mizuchi":
      greeting = new Audio(greetingMizuchi);
      thanks = new Audio(thanksMizuchi);
      apology = new Audio(apologyMizuchi);
      impressed = new Audio(impressedMizuchi);
      taunt = new Audio(tauntMizuchi);
      start = new Audio(startMizuchi);
      break;
    case "Forte":
      greeting = new Audio(greetingForte);
      thanks = new Audio(thanksForte);
      apology = new Audio(apologyForte);
      impressed = new Audio(impressedForte);
      taunt = new Audio(tauntForte);
      start = new Audio(startForte);
      break;
    case "Pompom":
      greeting = new Audio(greetingPompom);
      thanks = new Audio(thanksPompom);
      apology = new Audio(apologyPompom);
      impressed = new Audio(impressedPompom);
      taunt = new Audio(tauntPompom);
      start = new Audio(startPompom);
      break;

    case "Daria":
      greeting = new Audio(greetingDaria);
      thanks = new Audio(thanksDaria);
      apology = new Audio(apologyDaria);
      impressed = new Audio(impressedDaria);
      taunt = new Audio(tauntDaria);
      start = new Audio(startDaria);
      break;
    case "Albert":
      greeting = new Audio(greetingAlbert);
      thanks = new Audio(thanksAlbert);
      apology = new Audio(apologyAlbert);
      impressed = new Audio(impressedAlbert);
      taunt = new Audio(tauntAlbert);
      start = new Audio(startAlbert);
      break;
    case "Aria":
      greeting = new Audio(greetingAria);
      thanks = new Audio(thanksAria);
      apology = new Audio(apologyAria);
      impressed = new Audio(impressedAria);
      taunt = new Audio(tauntAria);
      start = new Audio(startAria);
      break;
    case "Exella":
      greeting = new Audio(greetingExella);
      thanks = new Audio(thanksExella);
      apology = new Audio(apologyExella);
      impressed = new Audio(impressedExella);
      taunt = new Audio(tauntExella);
      start = new Audio(startExella);
      break;
    case "Rola":
      greeting = new Audio(greetingRola);
      thanks = new Audio(thanksRola);
      apology = new Audio(apologyRola);
      impressed = new Audio(impressedRola);
      taunt = new Audio(tauntRola);
      start = new Audio(startRola);
      break;
    default:
      greeting = new Audio(greetingCernunnos);
      thanks = new Audio(thanksCernunnos);
      apology = new Audio(apologyCernunnos);
      impressed = new Audio(impressedCernunnos);
      taunt = new Audio(tauntCernunnos);
      start = new Audio(startCernunnos);
  }

  // useEffect(() => {
  //   start.play();
  //    // eslint-disable-next-line
  // }, [name]);

  function playAudio(audio) {
    audio.play();
  }
  return (
    <div className="VoicelinesContainer">
      <IconButton
        sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
        onClick={() => playAudio(greeting)}
      >
        <WavingHandIcon />
      </IconButton>
      <IconButton
        sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
        onClick={() => playAudio(impressed)}
      >
        <SentimentVerySatisfiedIcon />
      </IconButton>
      <IconButton
        sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
        onClick={() => playAudio(apology)}
      >
        <SentimentVeryDissatisfiedIcon />
      </IconButton>
      <IconButton
        sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
        onClick={() => playAudio(thanks)}
      >
        <ThumbUpIcon />
      </IconButton>
      <IconButton
        sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
        onClick={() => playAudio(taunt)}
      >
        <ThumbDownIcon />
      </IconButton>
    </div>
  );
}
