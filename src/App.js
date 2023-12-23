import { Canvas } from '@react-three/fiber';
import { CameraControls, PerspectiveCamera, Environment } from '@react-three/drei'

import './App.css';
import Gameboard from './components/Gameboard';
import Card from './components/Card'

function App() {
  return (
    // <Canvas flat>
    <Canvas flat>
      {/* <Fisheye zoom={0}> */}
        {/* <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} /> */}
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 0, 5]} />
        <Gameboard />
        <Card idx={1}/>
        <Card idx={2}/>
        <Card idx={3}/>
        <Card idx={4}/>
        <Card idx={5}/>
        {/* <Card pos={6}/> */}
        <Environment preset="dawn" background blur={1} />
        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} />
      {/* </Fisheye> */}
    </Canvas>
  );
}

export default App;
