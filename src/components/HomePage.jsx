import React, { useState } from 'react'

const HomePage = ({ onLookCloser }) => {
  const [hover, setHover] = useState(false)
  const [glbUrl, setGlbUrl] = useState(null)

  const buttonStyle = {
    width: '410px',
    height: '128px',
    background: hover ? '#3B2F2F' : '#e9d8c3',
    color: hover ? '#e9d8c3' : '#3B2F2F',
    fontFamily: 'Bebas Neue, Arial, sans-serif',
    fontWeight: 400,
    fontSize: '70px',
    lineHeight: '128px',
    textAlign: 'center',
    textTransform: 'uppercase',
    border: hover ? 'none' : '5px solid #3B2F2F',
    borderRadius: 0,
    cursor: 'pointer',
    letterSpacing: '0%',
    boxShadow: 'none',
    padding: 0,
    display: 'block',
    transition: 'all 0.3s ease-out',
    position: 'absolute',
    top: '742px',
    left: '230px'
  }

  return (
    <div style={{
      width: '1920px',
      height: '1080px',
      background: '#e9d8c3',
      fontFamily: 'Montserrat, Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <h1 
      style={{
        color: '#3b2f2f',
        fontFamily: 'Bebas Neue, Arial, sans-serif',
        fontSize: '128px',
        fontWeight: 400,
        lineHeight: '137%',
        letterSpacing: '0%',
        marginBottom: '16px',
        width: '695px',
        height: '175px',
        position: 'absolute',
        top: '171px',
        left: '230px'
      }}>
        THE HIDDEN ROOM
      </h1>
      <p style={{
        color: '#3b2f2f',
        fontFamily: 'Work Sans, Arial, sans-serif',
        fontWeight: 400,
        fontSize: '26px',
        lineHeight: '150%',
        letterSpacing: '0%',
        width: '971px',
        height: '156px',
        position: 'absolute',
        top: '432px',
        left: '230px',
        marginBottom: '27px',
      }}>
        Discover the world of hidden messages through the concept of Easter eggs: subtle details, symbols, and surprises intentionally placed by creators.<br/>
        From films and posters to brands logos and video games, each section<br/>
        invites you to look closer and uncover what's been hiding in plain sight.
      </p>
      <button
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onLookCloser}
      >
        LOOK CLOSER
      </button>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '373.09px',
        height: '1080px',
        left: '1456px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}>
        <img 
          src="./glb/Group 97 (1).png" 
          alt="Design element" 
          style={{
            height: '1080px',
            width: '373.09px',
            maxHeight: '1080px',
          }} 
        />
      </div>
    </div>
  )
}

export default HomePage 