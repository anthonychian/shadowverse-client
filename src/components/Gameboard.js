import React from 'react'
import {  Decal, useTexture } from '@react-three/drei'


export default function Gameboard() {
    const texture = useTexture('../textures/board.jpg');
    return (
        <mesh scale={[17, 12, 0.01]}>
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
    )
}
