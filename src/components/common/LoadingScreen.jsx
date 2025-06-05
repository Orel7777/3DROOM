import React from 'react';

/**
 * Loading Screen Component displayed while the model is loading.
 */
function LoadingScreen({ progress = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1611 0%, #2c2416 50%, #1a1611 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          background: 'linear-gradient(45deg, #f7dc6f, #f39c12)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Loading 3D Model...
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#bbb',
          margin: '0'
        }}>
          Please wait while the room loads
        </p>
      </div>

      {/* Progress Container */}
      <div style={{
        width: '400px',
        maxWidth: '80vw',
        textAlign: 'center'
      }}>
        {/* Progress Text */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#f7dc6f',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}>
          {Math.round(progress)}%
        </div>

        {/* Main Progress Bar Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '20px',
          backgroundColor: '#333',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
          marginBottom: '15px'
        }}>
          {/* Progress Fill */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f39c12 0%, #f7dc6f 50%, #f39c12 100%)',
            borderRadius: '15px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Shine Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: progress > 0 ? 'shine 2s infinite' : 'none'
            }} />
          </div>
          
          {/* Progress Marker */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '28px',
            backgroundColor: '#fff',
            borderRadius: '2px',
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            transition: 'left 0.3s ease-out'
          }} />
        </div>

        {/* Secondary Decorative Sliders */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          marginTop: '20px'
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#444',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${Math.max(0, Math.min(100, (progress - i * 20)))}%`,
                height: '100%',
                background: `linear-gradient(90deg, #${['e74c3c', 'e67e22', 'f39c12', '27ae60', '3498db'][i]} 0%, #${['c0392b', 'd35400', 'e67e22', '229954', '2980b9'][i]} 100%)`,
                borderRadius: '4px',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
          ))}
        </div>

        {/* Loading Animation Dots */}
        <div style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#f7dc6f',
              borderRadius: '50%',
              animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: '0 0 10px rgba(247, 220, 111, 0.5)'
            }} />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen; 