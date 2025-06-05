import React, { useState, useEffect } from 'react';
import { ELEMENTS_MAP } from '../constant';
import { getFixedPosition } from '../utils/positionHelpers';

/**
 * Component to display information about the currently hovered object with fixed positions.
 * @param {Object} props - Component properties.
 * @param {string|null} props.hovered - The name of the currently hovered object.
 */
function HoverInfo({ hovered }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentPosition, setCurrentPosition] = useState({ left: '50%', top: '50%' });

  useEffect(() => {
    if (hovered) {
      // אם יש טקסט חדש, נעדכן אותו ונציג
      const text = ELEMENTS_MAP[hovered];
      const position = getFixedPosition(hovered);
      
      setCurrentText(text || hovered);
      setCurrentPosition(position);
      setIsVisible(true);
    } else {
      // אם אין טקסט, נסתיר
      setIsVisible(false);
    }
  }, [hovered]);

  // אם אין טקסט או לא רואים, לא נציג כלום
  if (!currentText) return null;

  return (
    <div style={{
      position: 'fixed',
      left: currentPosition.left,
      top: currentPosition.top,
      color: 'white',
      padding: '0px',
      fontFamily: 'BebasNeue-Regular, Arial, sans-serif',
      fontSize: '18px',
      zIndex: 1000,
      direction: 'ltr',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
      transform: `translate(-50%, -100%) scale(${isVisible ? 1 : 0.8})`
    }}>
      {currentText}
    </div>
  );
}

export default HoverInfo; 