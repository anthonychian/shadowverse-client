import React from 'react'
import imageCernunnos from '../assets/leaders/Cernunnos/Cernunnos.png'
import imageMizuchi from '../assets/leaders/Mizuchi/Mizuchi.png'
import imageForte from '../assets/leaders/Forte/Forte.png'
import imagePompom from '../assets/leaders/Pompom/Pompom.png'
import imageDaria from '../assets/leaders/Daria/Daria.png'
import imageAlbert from '../assets/leaders/Albert/Albert.png'
import imageAria from '../assets/leaders/Aria/Aria.png'
import imageExella from '../assets/leaders/Exella/Exella.png'
import imageRola from '../assets/leaders/Rola/Rola.png'

import '../css/Leader.css'

export default function Leader({ name }) {
  let image
  switch (name) {
    case 'Cernunnos':
      image = imageCernunnos
      break;
    case 'Mizuchi':
      image = imageMizuchi
      break;
    case 'Forte':
      image = imageForte
      break;
    case 'Pompom':
        image = imagePompom
        break;
    case 'Daria':
        image = imageDaria
        break;
    case 'Albert':
        image = imageAlbert 
        break;
    case 'Aria':
        image = imageAria
        break;
    case 'Exella':
        image = imageExella
        break;
    case 'Rola':
        image = imageRola
        break;
    default:
      image = imageCernunnos
  }
  return (
    <div className="LeaderContainer">
        <img src={image} className="LeaderImage" alt="Leader" />
    </div>
  )
}
