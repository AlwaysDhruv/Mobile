import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

function PhoneModel({ mouse }) {
  const { scene } = useGLTF('/models/phone.glb');
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0015;
      ref.current.rotation.y += mouse.current.x * 0.01;
      ref.current.rotation.x = -mouse.current.y * 0.08;
      ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.08;
    }
  });
  return <primitive object={scene} ref={ref} scale={4.2} position={[0,-0.15,0]} rotation={[0.03,0.7,0]} />;
}

export default function PhoneBackground() {
  const mouse = useRef({ x: 0, y: 0 });
  return (
    <div className='phone-bg' onMouseMove={(e)=>{
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }}>
      <Canvas camera={{ position:[0,0,7], fov:40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3,3,5]} intensity={1.2} />
        <pointLight position={[-3,-2,-4]} intensity={0.5} />
        <PhoneModel mouse={mouse} />
      </Canvas>
    </div>
  );
}
