import React from "react";
import imageJeanne from "../../assets/leaders/Jeanne.png";
import imageForte from "../../assets/leaders/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux.png";
import imageKuon from "../../assets/leaders/Kuon.png";
import imageDaria from "../../assets/leaders/Daria.png";
import imageAlbert from "../../assets/leaders/Albert.png";
import imageOrchis from "../../assets/leaders/Orchis.png";
import imageCC from "../../assets/leaders/CC.png";
import imageMono from "../../assets/leaders/Mono.png";
import imageVania from "../../assets/leaders/Vania.png";
import imageMaru from "../../assets/leaders/Maru.png";
import imageRin from "../../assets/leaders/Rin.png";
import imageUzuki from "../../assets/leaders/Uzuki.png";
import imageMio from "../../assets/leaders/Mio.png";

import imageLishenna from "../../assets/leaders/Lishenna.png";
import imageSekka from "../../assets/leaders/Sekka.png";
import imageBunny from "../../assets/leaders/Bunny.png";
import imageDrache from "../../assets/leaders/Drache.png";
import imageRola from "../../assets/leaders/Rola.png";
import imageIcy from "../../assets/leaders/Icy.png";
import imageAnisage from "../../assets/leaders/Anisage.png";
import imageSiLong from "../../assets/leaders/SiLong.png";
import imageManhattenCafe from "../../assets/leaders/ManhattenCafe.png";
import imageHozumi from "../../assets/leaders/Hozumi.png";
import imageCeridwen from "../../assets/leaders/Ceridwen.png";

import "../../css/Leader.css";

export default function Leader({ name, active }) {
  let image;
  switch (name) {
    case "Galmieux":
      image = imageGalmieux;
      break;
    case "Forte":
      image = imageForte;
      break;
    case "SiLong":
      image = imageSiLong;
      break;
    case "Drache":
      image = imageDrache;
      break;
    case "Jeanne":
      image = imageJeanne;
      break;
    case "Rola":
      image = imageRola;
      break;
    case "Albert":
      image = imageAlbert;
      break;
    case "Bunny":
      image = imageBunny;
      break;
    case "Daria":
      image = imageDaria;
      break;
    case "Kuon":
      image = imageKuon;
      break;
    case "Lishenna":
      image = imageLishenna;
      break;
    case "Ceridwen":
      image = imageCeridwen;
      break;
    case "Sekka":
      image = imageSekka;
      break;
    case "Hozumi":
      image = imageHozumi;
      break;
    case "Orchis":
      image = imageOrchis;
      break;
    case "CC":
      image = imageCC;
      break;
    case "Icy":
      image = imageIcy;
      break;
    case "Anisage":
      image = imageAnisage;
      break;
    case "Vania":
      image = imageVania;
      break;
    case "Mono":
      image = imageMono;
      break;
    case "Manhatten Cafe":
      image = imageManhattenCafe;
      break;
    case "Maruzensky":
      image = imageMaru;
      break;
    case "Rin":
      image = imageRin;
      break;
    case "Uzuki":
      image = imageUzuki;
      break;
    case "Mio":
      image = imageMio;
      break;
    default:
      image = imageGalmieux;
  }
  return (
    <div className="LeaderContainer">
      {active ? (
        <img src={image} className="LeaderImageActive" alt="Leader" />
      ) : (
        <img src={image} className="LeaderImageInactive" alt="Leader" />
      )}
    </div>
  );
}
