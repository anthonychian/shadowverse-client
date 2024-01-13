import React, { useState, useEffect, useRef } from "react";
import { Decal, useTexture } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import { useThree } from "@react-three/fiber";
import { Input } from "r3f-form";
import { Text } from "r3f-form/Input";
import { cardImage } from "../../decks/getCards";

export default function Card({ cardName, idx }) {
  const initialCardPos = (idx) => {
    switch (idx) {
      case 1:
        return [3.0, 0, 0.1];
      case 2:
        return [1.5, 0, 0.1];
      case 3:
        return [0, 0, 0.1];
      case 4:
        return [-1.5, 0, 0.1];
      case 5:
        return [-3, 0, 0.1];
      case 6:
        return [0, 0, 0.1];
      default:
        return [0, 0, 0.1];
    }
  };
  const initialAtkPos = (idx) => {
    switch (idx) {
      case 1:
        return [3.25, -0.75, 0.1];
      case 2:
        return [1.75, -0.75, 0.1];
      case 3:
        return [0.25, -0.75, 0.1];
      case 4:
        return [-1.25, -0.75, 0.1];
      case 5:
        return [-2.75, -0.75, 0.1];
      default:
        return [0.25, -0.75, 0.1];
    }
  };
  const initialDefPos = (idx) => {
    switch (idx) {
      case 1:
        return [2.75, -0.75, 0.1];
      case 2:
        return [1.25, -0.75, 0.1];
      case 3:
        return [-0.25, -0.75, 0.1];
      case 4:
        return [-1.75, -0.75, 0.1];
      case 5:
        return [-3.25, -0.75, 0.1];
      default:
        return [-0.25, -0.75, 0.1];
    }
  };

  const initialXPos = (idx) => {
    switch (idx) {
      case 1:
        return 3.0;
      case 2:
        return 1.5;
      case 3:
        return 0;
      case 4:
        return -1.5;
      case 5:
        return -3.0;
      case 6:
        return 0;
      default:
        return 0;
    }
  };
  const meshRef = useRef();
  const [engaged, setEngaged] = useState(false);
  const [hover, setHover] = useState(false);
  const texture = useTexture(cardImage(cardName));
  const hoverPos = [-1.0, 0.45, 5];
  const [hidden, setHidden] = useState(true);
  const [statsHidden, setStatsHidden] = useState(false);
  const [cardRotation, setCardRotation] = useState([0, 0, 0]);
  const [cardScale] = useState([1, 1.25, 0.01]);
  // const atkPosScale = [0.25, -0.75, 0];
  // const defPosScale = [-0.25, -0.75, 0];
  const [cardPos, setCardPos] = useState(initialCardPos(idx));
  const [atkPos, setAtkPos] = useState(initialAtkPos(idx));
  const [defPos, setDefPos] = useState(initialDefPos(idx));

  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  //   const [spring, setSpring] = useSpring(() => ({
  //     position: cardPos,
  //   }));
  const xPos = initialXPos(idx);
  const xaPos = initialXPos(idx) + 0.25;
  const xdPos = initialXPos(idx) - 0.25;
  const yPos = -0.75;
  const bind = useDrag(
    ({ offset: [x, y] }) => {
      const [, , z] = cardPos;
      setCardPos([x / aspect + xPos, -y / aspect, z]);
      setAtkPos([x / aspect + xaPos, -y / aspect + yPos, z]);
      setDefPos([x / aspect + xdPos, -y / aspect + yPos, z]);
    },
    { pointerEvents: true }
  );

  const handleClick = (e) => {
    e.stopPropagation();
    setEngaged(!engaged);
  };
  const handleOnHoverEnter = (e) => {
    e.stopPropagation();
    setHover(true);
  };
  const handleOnHoverLeave = (e) => {
    e.stopPropagation();
    setHover(false);
  };
  const handleLeftClick = (e) => {
    e.stopPropagation();
    setStatsHidden(!statsHidden);
  };

  useEffect(() => {
    if (engaged) setCardRotation([(Math.PI / 2) * 0, 0, 1.57]);
    else setCardRotation([0, 0, 0]);
  }, [engaged]);

  useEffect(() => {
    setHidden(!hidden);
  }, [hover]);

  return (
    <>
      {statsHidden && (
        <>
          <Input
            scale={[3, 2.25, 0.01]}
            position={atkPos}
            width={0.125}
            backgroundOpacity={0.6}
            backgroundColor="black"
          >
            <Text color="red" />
          </Input>
          <Input
            scale={[3, 2.25, 0.01]}
            position={defPos}
            width={0.125}
            backgroundOpacity={0.6}
            backgroundColor="black"
          >
            <Text color="blue" />
          </Input>
        </>
      )}
      <mesh
        {...bind()}
        ref={meshRef}
        scale={cardScale}
        position={cardPos}
        rotation={cardRotation}
        onContextMenu={(e) => handleClick(e)}
        onPointerEnter={(e) => handleOnHoverEnter(e)}
        onPointerLeave={(e) => handleOnHoverLeave(e)}
        onDoubleClick={(e) => handleLeftClick(e)}
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
          <meshBasicMaterial map={texture} />
        </Decal>
      </mesh>
      {hidden && (
        <mesh scale={[1, 1.25, 0.01]} position={hoverPos}>
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
            <meshBasicMaterial map={texture} />
          </Decal>
        </mesh>
      )}
    </>
  );
}
