import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';

/**
 * Component for limited OrbitControls to restrict camera movement.
 * @param {boolean} isHovering - Whether an object is currently being hovered
 */
function LimitedControls({ isHovering }) {
  const controlsRef = useRef();

  // Function to reset the camera to its initial state
  useEffect(() => {
    const handleReset = (e) => {
      if (e.key === ' ' && controlsRef.current) {
        controlsRef.current.reset();
      }
    };

    window.addEventListener('keydown', handleReset);
    return () => window.removeEventListener('keydown', handleReset);
  }, []);

  // Update controls enabled state based on hover
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isHovering;
    }
  }, [isHovering]);

  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={8} // מרחק מינימלי מהמודל
      maxDistance={14} // הקטנת המרחק המקסימלי מ-18 ל-16
      minPolarAngle={Math.PI / 2.5} // הגבלת סיבוב המצלמה כלפי מעלה
      maxPolarAngle={Math.PI / 2.2} // הגבלת סיבוב המצלמה כלפי מטה
      minAzimuthAngle={-Math.PI / 12} // הגבלת סיבוב שמאלה
      maxAzimuthAngle={Math.PI / 12} // הגבלת סיבוב ימינה
      enableZoom={true}
      enablePan={false} // ביטול אפשרות הזזה
      enableRotate={true}
      autoRotate={false}
      enableDamping // אפשר תנועה חלקה
      dampingFactor={0.07}
      zoomSpeed={0.7} // האטת מהירות הזום
      enabled={!isHovering} // Disable controls when hovering over interactive objects
    />
  );
}

export default LimitedControls; 