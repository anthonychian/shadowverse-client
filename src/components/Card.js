import React, {useState, useEffect, useRef} from 'react'
import {  Decal, useTexture } from '@react-three/drei'

export default function Card({ img, idx}) {
    const meshRef = useRef();
    const [engaged, setEngaged] = useState(false)
    const [hover, setHover] = useState(false)
    const texture = useTexture('../textures/BP01-159EN.png');
    const hoverScale = 1.1;
    const hoverPos = [-1.75, .45, 5]
    const [hidden, setHidden] = useState(true)
    const [cardRotation, setCardRotation] = useState([0, 0, 0])
    const [cardScale, setCardScale] = useState([1, 1.25, 0.01])
    

    const handleClick = (e) => {
        e.stopPropagation()
        setEngaged(!engaged)
    }
    const handleOnHover = (e) => {
        e.stopPropagation()
        setHover(!hover)
    }

    useEffect(() => {
        if (engaged)
            setCardRotation([Math.PI / 2 * 0, 0, 1.57])
        else
            setCardRotation([0, 0, 0])
    },[engaged])

    useEffect(() => {
        if (hover) {
            setHidden(!hidden)
            setCardScale([1*hoverScale, 1.25*hoverScale, 0.01])
        }
        else {
            setHidden(!hidden)
            setCardScale([1, 1.25, 0.01])
        }
    },[hover])


    const initialCardPos = (idx, pos) => {
        switch(idx) {
            case 1:
                return [3.0, 0, pos];
            case 2:
                return [1.5, 0, pos];
            case 3:
                return [0, 0, pos];
            case 4:
                return [-1.5, 0, pos];
            case 5:
                return [-3, 0, pos];
            case 6:
                return [0, 0, pos];
            default:
                return [0, 0, pos];
          }
    }

    return (
        <>
        <mesh 
            ref={meshRef}
            scale={cardScale}
            position={initialCardPos(idx, 0.1)}
            rotation={cardRotation}
            onDoubleClick={(e) => handleClick(e)}
            onPointerEnter={(e) =>handleOnHover(e)}
            onPointerLeave={(e) =>handleOnHover(e)}
        >
            <boxGeometry />
            <meshNormalMaterial />
            <Decal
                // debug // makes 'bounding box' of the decal visible
                position={[0, 0, 0]} // position of decal
                rotation={[0, 0, 0]} // rotation of decal
                scale={1} // scale of decal
                polygonOffset
                polygonOffsetFactor={-1} // the mesh should take precedence over the original
            >
                <meshBasicMaterial map={texture}/>
            </Decal>
        </mesh>
        {hidden && <mesh 
            scale={[1, 1.25, 0.01]}
            position={hoverPos}
        >
            <boxGeometry />
            <meshNormalMaterial />
            <Decal
                // debug // makes 'bounding box' of the decal visible
                position={[0, 0, 0]} // position of decal
                rotation={[0, 0, 0]} // rotation of decal
                scale={1} // scale of decal
                polygonOffset
                polygonOffsetFactor={-1} // the mesh should take precedence over the original
            >
                <meshBasicMaterial map={texture}/>
            </Decal>
        </mesh>}
        </>
    )
}
