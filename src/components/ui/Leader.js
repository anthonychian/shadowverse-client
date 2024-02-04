import React from "react";
import imageRamina from "../../assets/leaders/Ramina/Ramina.png";
import imageJeanne from "../../assets/leaders/Jeanne/Jeanne.png";
import imageForte from "../../assets/leaders/Forte/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux/Galmieux.png";
import imageKuon from "../../assets/leaders/Kuon/Kuon.png";
import imageDaria from "../../assets/leaders/Daria/Daria.png";
import imagePompom from "../../assets/leaders/Pompom/Pompom.png";
import imageAlbert from "../../assets/leaders/Albert/Albert.png";
import imageAria from "../../assets/leaders/Aria/Aria.png";
import imageCC from "../../assets/leaders/CC/CC.png";
import imageExella from "../../assets/leaders/Exella/Exella.png";
import imageItsurugi from "../../assets/leaders/Itsurugi/Itsurugi.png";

import "../../css/Leader.css";

export default function Leader({ name }) {
  let image;
  switch (name) {
    case "Galmieux":
      image = imageGalmieux;
      break;
    case "Forte":
      image = imageForte;
      break;
    case "Jeanne":
      image = imageJeanne;
      break;
    case "Ramina":
      image = imageRamina;
      break;
    case "Albert":
      image = imageAlbert;
      break;
    case "Pompom":
      image = imagePompom;
      break;
    case "Daria":
      image = imageDaria;
      break;
    case "Kuon":
      image = imageKuon;
      break;
    case "CC":
      image = imageCC;
      break;
    case "Aria":
      image = imageAria;
      break;
    case "Itsurugi":
      image = imageItsurugi;
      break;
    case "Exella":
      image = imageExella;
      break;
    default:
      image = imageGalmieux;
  }
  return (
    <div className="LeaderContainer">
      <img src={image} className="LeaderImage" alt="Leader" />
    </div>
  );
}
