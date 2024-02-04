import React from "react";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import IconButton from "@mui/material/IconButton";
import "../../css/Voicelines.css";

import greetingForte from "../../assets/leaders/Forte/Greeting.mp3";
import thanksForte from "../../assets/leaders/Forte/Thanks.mp3";
import apologyForte from "../../assets/leaders/Forte/Apology.mp3";
import impressedForte from "../../assets/leaders/Forte/Impressed.mp3";
import tauntForte from "../../assets/leaders/Forte/Taunt.mp3";

import greetingGalmieux from "../../assets/leaders/Galmieux/Greeting.mp3";
import thanksGalmieux from "../../assets/leaders/Galmieux/Thanks.mp3";
import apologyGalmieux from "../../assets/leaders/Galmieux/Apology.mp3";
import impressedGalmieux from "../../assets/leaders/Galmieux/Impressed.mp3";
import tauntGalmieux from "../../assets/leaders/Galmieux/Taunt.mp3";

import greetingJeanne from "../../assets/leaders/Jeanne/Greeting.mp3";
import thanksJeanne from "../../assets/leaders/Jeanne/Thanks.mp3";
import apologyJeanne from "../../assets/leaders/Jeanne/Apology.mp3";
import impressedJeanne from "../../assets/leaders/Jeanne/Impressed.mp3";
import tauntJeanne from "../../assets/leaders/Jeanne/Taunt.mp3";

import greetingRamina from "../../assets/leaders/Ramina/Greeting.mp3";
import thanksRamina from "../../assets/leaders/Ramina/Thanks.mp3";
import apologyRamina from "../../assets/leaders/Ramina/Apology.mp3";
import impressedRamina from "../../assets/leaders/Ramina/Impressed.mp3";
import tauntRamina from "../../assets/leaders/Ramina/Taunt.mp3";

import greetingKuon from "../../assets/leaders/Kuon/Greeting.mp3";
import thanksKuon from "../../assets/leaders/Kuon/Thanks.mp3";
import apologyKuon from "../../assets/leaders/Kuon/Apology.mp3";
import impressedKuon from "../../assets/leaders/Kuon/Impressed.mp3";
import tauntKuon from "../../assets/leaders/Kuon/Taunt.mp3";

import greetingItsurugi from "../../assets/leaders/Itsurugi/Greeting.mp3";
import thanksItsurugi from "../../assets/leaders/Itsurugi/Thanks.mp3";
import apologyItsurugi from "../../assets/leaders/Itsurugi/Apology.mp3";
import impressedItsurugi from "../../assets/leaders/Itsurugi/Impressed.mp3";
import tauntItsurugi from "../../assets/leaders/Itsurugi/Taunt.mp3";

import greetingCC from "../../assets/leaders/CC/Greeting.mp3";
import thanksCC from "../../assets/leaders/CC/Thanks.mp3";
import apologyCC from "../../assets/leaders/CC/Apology.mp3";
import impressedCC from "../../assets/leaders/CC/Impressed.mp3";
import tauntCC from "../../assets/leaders/CC/Taunt.mp3";

import greetingPompom from "../../assets/leaders/Pompom/Greeting.mp3";
import thanksPompom from "../../assets/leaders/Pompom/Thanks.mp3";
import apologyPompom from "../../assets/leaders/Pompom/Apology.mp3";
import impressedPompom from "../../assets/leaders/Pompom/Impressed.mp3";
import tauntPompom from "../../assets/leaders/Pompom/Taunt.mp3";

import greetingDaria from "../../assets/leaders/Daria/Greeting.mp3";
import thanksDaria from "../../assets/leaders/Daria/Thanks.mp3";
import apologyDaria from "../../assets/leaders/Daria/Apology.mp3";
import impressedDaria from "../../assets/leaders/Daria/Impressed.mp3";
import tauntDaria from "../../assets/leaders/Daria/Taunt.mp3";

import greetingAlbert from "../../assets/leaders/Albert/Greeting.mp3";
import thanksAlbert from "../../assets/leaders/Albert/Thanks.mp3";
import apologyAlbert from "../../assets/leaders/Albert/Apology.mp3";
import impressedAlbert from "../../assets/leaders/Albert/Impressed.mp3";
import tauntAlbert from "../../assets/leaders/Albert/Taunt.mp3";

import greetingAria from "../../assets/leaders/Aria/Greeting.mp3";
import thanksAria from "../../assets/leaders/Aria/Thanks.mp3";
import apologyAria from "../../assets/leaders/Aria/Apology.mp3";
import impressedAria from "../../assets/leaders/Aria/Impressed.mp3";
import tauntAria from "../../assets/leaders/Aria/Taunt.mp3";

import greetingExella from "../../assets/leaders/Exella/Greeting.mp3";
import thanksExella from "../../assets/leaders/Exella/Thanks.mp3";
import apologyExella from "../../assets/leaders/Exella/Apology.mp3";
import impressedExella from "../../assets/leaders/Exella/Impressed.mp3";
import tauntExella from "../../assets/leaders/Exella/Taunt.mp3";

export default function Voicelines({ name }) {
  let greeting, thanks, apology, impressed, taunt, start;
  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";

  switch (name) {
    case "Forte":
      greeting = new Audio(greetingForte);
      thanks = new Audio(thanksForte);
      apology = new Audio(apologyForte);
      impressed = new Audio(impressedForte);
      taunt = new Audio(tauntForte);
      break;
    case "Galmieux":
      greeting = new Audio(greetingGalmieux);
      thanks = new Audio(thanksGalmieux);
      apology = new Audio(apologyGalmieux);
      impressed = new Audio(impressedGalmieux);
      taunt = new Audio(tauntGalmieux);
      break;
    case "Jeanne":
      greeting = new Audio(greetingJeanne);
      thanks = new Audio(thanksJeanne);
      apology = new Audio(apologyJeanne);
      impressed = new Audio(impressedJeanne);
      taunt = new Audio(tauntJeanne);
      break;
    case "Ramina":
      greeting = new Audio(greetingRamina);
      thanks = new Audio(thanksRamina);
      apology = new Audio(apologyRamina);
      impressed = new Audio(impressedRamina);
      taunt = new Audio(tauntRamina);
      break;
    case "Kuon":
      greeting = new Audio(greetingKuon);
      thanks = new Audio(thanksKuon);
      apology = new Audio(apologyKuon);
      impressed = new Audio(impressedKuon);
      taunt = new Audio(tauntKuon);
      break;
    case "CC":
      greeting = new Audio(greetingCC);
      thanks = new Audio(thanksCC);
      apology = new Audio(apologyCC);
      impressed = new Audio(impressedCC);
      taunt = new Audio(tauntCC);
      break;
    case "Itsurugi":
      greeting = new Audio(greetingItsurugi);
      thanks = new Audio(thanksItsurugi);
      apology = new Audio(apologyItsurugi);
      impressed = new Audio(impressedItsurugi);
      taunt = new Audio(tauntItsurugi);
      break;
    case "Pompom":
      greeting = new Audio(greetingPompom);
      thanks = new Audio(thanksPompom);
      apology = new Audio(apologyPompom);
      impressed = new Audio(impressedPompom);
      taunt = new Audio(tauntPompom);
      break;

    case "Daria":
      greeting = new Audio(greetingDaria);
      thanks = new Audio(thanksDaria);
      apology = new Audio(apologyDaria);
      impressed = new Audio(impressedDaria);
      taunt = new Audio(tauntDaria);
      break;
    case "Albert":
      greeting = new Audio(greetingAlbert);
      thanks = new Audio(thanksAlbert);
      apology = new Audio(apologyAlbert);
      impressed = new Audio(impressedAlbert);
      taunt = new Audio(tauntAlbert);
      break;
    case "Aria":
      greeting = new Audio(greetingAria);
      thanks = new Audio(thanksAria);
      apology = new Audio(apologyAria);
      impressed = new Audio(impressedAria);
      taunt = new Audio(tauntAria);
      break;
    case "Exella":
      greeting = new Audio(greetingExella);
      thanks = new Audio(thanksExella);
      apology = new Audio(apologyExella);
      impressed = new Audio(impressedExella);
      taunt = new Audio(tauntExella);
      break;
    default:
  }

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
