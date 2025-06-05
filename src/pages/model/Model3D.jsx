import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import LoadingScreen from '../../components/common/LoadingScreen';
import { 
  CAMERA_SETTINGS,
  DEFAULT_LIGHTS 
} from '../../components/constant';
import Model from '../../components/common/Model';
import LimitedControls from '../../components/common/LimitedControls';
import HoverInfo from '../../components/common/HoverInfo';

/**
 * Main application component for the 3D room model.
 */
const Model3D = () => {
  const [hovered, setHovered] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Set up basic lighting controls with useState for stability
  const [lights, setLights] = useState(DEFAULT_LIGHTS);

  // הגדרת בקרי התאורה
  useControls('Ambient Light', {
    intensity: {
      value: lights.ambient.intensity,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, ambient: { ...prev.ambient, intensity: value } }))
    },
    color: {
      value: lights.ambient.color,
      onChange: (value) => setLights(prev => ({ ...prev, ambient: { ...prev.ambient, color: value } }))
    }
  });

  useControls('Window Light', {
    position: {
      value: lights.windowLight.position,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, position: value } }))
    },
    angle: {
      value: lights.windowLight.angle,
      min: 0,
      max: Math.PI / 2,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, angle: value } }))
    },
    penumbra: {
      value: lights.windowLight.penumbra,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, penumbra: value } }))
    },
    distance: {
      value: lights.windowLight.distance,
      min: 0,
      max: 50,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, distance: value } }))
    },
    decay: {
      value: lights.windowLight.decay,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, decay: value } }))
    }
  });

  useControls('Poster Light', {
    position: {
      value: [-11.5, -5.0, 19.8],
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, position: value } }))
    },
    angle: {
      value: 0.30,
      min: 0,
      max: Math.PI / 2,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, angle: value } }))
    },
    penumbra: {
      value: 0.77,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, penumbra: value } }))
    },
    distance: {
      value: 24,
      min: 0,
      max: 50,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, distance: value } }))
    },
    decay: {
      value: 0.1,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, decay: value } }))
    },
    intensity: {
      value: 5,
      min: 0,
      max: 100,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, intensity: value } }))
    },
    color: {
      value: '#ffffff',
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, color: value } }))
    }
  });

  // Effect to handle loading state - רק מסיים כשהמודל באמת נטען
  useEffect(() => {
    if (modelLoaded) {
      // המודל נטען - מסיים את הטעינה
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [modelLoaded]);

  return (
    <div id="model-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {isLoading && <LoadingScreen progress={loadingProgress} />}

      <Canvas
        style={{ background: '#1a1611' }}
        camera={{ 
          position: [CAMERA_SETTINGS.position.x, CAMERA_SETTINGS.position.y, CAMERA_SETTINGS.position.z], 
          fov: CAMERA_SETTINGS.fov,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.toneMapping = THREE.ReinhardToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        performance={{ min: 0.5 }}
      >
        {/* אור סביבה */}
        <ambientLight intensity={lights.ambient.intensity} color={lights.ambient.color} />
        
        {/* אור חלון */}
        <spotLight 
          position={lights.windowLight.position} 
          intensity={lights.windowLight.intensity}
          color={lights.windowLight.color}
          angle={lights.windowLight.angle}
          penumbra={lights.windowLight.penumbra}
          distance={lights.windowLight.distance}
          decay={lights.windowLight.decay}
        />

        {/* אור פוסטר */}
        <spotLight 
          position={lights.posterLight.position} 
          intensity={lights.posterLight.intensity}
          color={lights.posterLight.color}
          angle={lights.posterLight.angle}
          penumbra={lights.posterLight.penumbra}
          distance={lights.posterLight.distance}
          decay={lights.posterLight.decay}
        />

        {/* Environment map for realistic reflections */}
        <Environment preset="night" />

        {/* Suspense for loading the GLTF model */}
        <Suspense fallback={null}>
          <Model setHovered={setHovered} hovered={hovered} lights={lights} setModelLoaded={setModelLoaded} setLoadingProgress={setLoadingProgress} />
        </Suspense>

        {/* Camera controls */}
        <LimitedControls isHovering={hovered !== null} />
      </Canvas>

      {/* Hover information display */}
      <HoverInfo hovered={hovered} />
    </div>
  );
};

export default Model3D;