import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// תמונות הפוסטרים - נתיבים יחסיים
const silenceOfTheLambs = new URL('./pictures/314c350e8fb31395c80f2eb8a02282f2a1917c99.jpg', import.meta.url).href;
const onceUponATime = new URL('./pictures/a942207bd0cf67020201468b209a9609310942aa.jpg', import.meta.url).href;
const underSilverLake = new URL('./pictures/5efed8f45cc178ba4295b33bba318ad61df74d2a.jpg', import.meta.url).href;
const usMovie = new URL('./pictures/65d01e3707fbe1e2b1e9643420baac552249715b.jpg', import.meta.url).href;
const tenCloverfieldLane = new URL('./pictures/5a6ae5b47c3399df7b03d6934d2e784a1392a2a6.jpg', import.meta.url).href;
const darkKnight = new URL('./pictures/95547d10da91bae6ba9d682abfc93c1f10e4ae62.jpg', import.meta.url).href;
const captainMarvel = new URL('./pictures/90d61705f673a6a298b52422b9416379fdb4b481.jpg', import.meta.url).href;
const passengers = new URL('./pictures/1201bdd5bb93d8c30ba98da049ea7653f584c9df.jpg', import.meta.url).href;

// תמונת ההובר של Silence of the Lambs
const silenceOfTheLambsHover = new URL('./pictures/0e51360b46d170f33d2165124445df9eab2c2105 (1).png', import.meta.url).href;

// תמונת ההובר של Once Upon a Time in Hollywood
const onceUponATimeHover = new URL('./pictures/022da92ed07e4ad3885426fae958275b8eee820c.png', import.meta.url).href;

// תמונת ההובר של Under the Silver Lake
const underSilverLakeHover = new URL('./pictures/2769e07f428e0974a34fb38c4ec9df9f8da90c9b.png', import.meta.url).href;

// תמונת ההובר של Us
const usMovieHover = new URL('./pictures/b873148bee299313a5e8d322ecf24de169afa866.png', import.meta.url).href;

// תמונת ההובר של 10 Cloverfield Lane
const tenCloverfieldLaneHover = new URL('./pictures/dc38ef8bbf15063a754d1d9c5159e567523db4d1.png', import.meta.url).href;

// תמונת ההובר של The Dark Knight
const darkKnightHover = new URL('./pictures/95547d10da91bae6ba9d682abfc93c1f10e4ae62.jpg', import.meta.url).href;
const darkKnightHover2 = new URL('./pictures/3af7420c94241b07b02650088ed1477c11aff05a.png', import.meta.url).href;

// תמונת ההובר של Captain Marvel
const captainMarvelHover = new URL('./pictures/90d61705f673a6a298b52422b9416379fdb4b481.jpg', import.meta.url).href;
const captainMarvelHover2 = new URL('./pictures/ceb25150166349163fb180cc142d7d1b46b4d988.png', import.meta.url).href;

// תמונת ההובר של Passengers
const passengersHover = new URL('./pictures/1201bdd5bb93d8c30ba98da049ea7653f584c9df.jpg', import.meta.url).href;
const passengersHover2 = new URL('./pictures/4a7893a67016f491c5fce64849b8125ee69db86f.png', import.meta.url).href;

// טיפוס לפוסטר
interface PosterItem {
  src: string;
  alt: string;
  hoverSrc?: string;
}

// רשימה של תמונות שורה ראשונה
const firstRowPosters: PosterItem[] = [
  { src: silenceOfTheLambs, alt: "Silence of the Lambs", hoverSrc: silenceOfTheLambsHover },
  { src: onceUponATime, alt: "Once Upon a Time in Hollywood", hoverSrc: onceUponATimeHover },
  { src: underSilverLake, alt: "Under the Silver Lake", hoverSrc: underSilverLakeHover },
  { src: usMovie, alt: "Us", hoverSrc: usMovieHover }
];

// רשימה של תמונות שורה שנייה
const secondRowPosters: PosterItem[] = [
  { src: tenCloverfieldLane, alt: "10 Cloverfield Lane", hoverSrc: tenCloverfieldLaneHover },
  { src: darkKnight, alt: "The Dark Knight", hoverSrc: darkKnightHover },
  { src: captainMarvel, alt: "Captain Marvel", hoverSrc: captainMarvelHover },
  { src: passengers, alt: "Passengers", hoverSrc: passengersHover }
];

const Poster = () => {
  const [showIntroDialog, setShowIntroDialog] = useState<boolean>(true);
  const [hoveredPoster, setHoveredPoster] = useState<PosterItem | null>(null);
  const navigate = useNavigate();
  
  // פונקציה לסגירת הדיאלוג הפותח
  const closeIntroDialog = () => {
    setShowIntroDialog(false);
  };

  // פונקציה למעבר לעמוד השני
  const goToPoster2 = () => {
    navigate('/poster2');
  };

  // פונקציה לחזרה לחדר התלת מימד
  const goBackToRoom = () => {
    window.location.href = '/?show3D=true';
  };

  return (
    <div 
      className="bg-[#e9d8c3] flex justify-center items-center p-12"
      style={{
        width: '1920px',
        height: '1080px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* כפתור X בפינה הימנית העליונה */}
      <button
        className="text-[#3B2F2F] flex items-center justify-center bg-[#E9D8C3] hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all duration-300 ease-out z-50 font-bold"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '102px',
          border: '8px solid #3B2F2F',
          fontSize: '48px'
        }}
        onClick={goBackToRoom}
        aria-label="Close"
      >
        X
      </button>
      
      {/* כפתור חץ בצד ימין באמצע */}
      <button
        className="text-[#3B2F2F] flex items-center justify-center bg-[#E9D8C3] hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all duration-300 ease-out z-50"
        style={{
          position: 'absolute',
          top: '426px',
          right: '20px',
          width: '81px',
          height: '229px',
          border: '8px solid #3B2F2F',
          fontSize: '180px',
          fontWeight: 400,
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: '127%'
        }}
        onClick={goToPoster2}
        aria-label="Next"
      >
        &gt;
      </button>
      
      {/* מיכל ראשי לפוסטרים */}
      <div 
        style={{
          position: 'absolute',
          top: '34px',
          left: '209px',
          width: '1456px',
          height: '1012px'
        }}
      >
        {/* שורה ראשונה - 4 פוסטרים */}
        <div 
          className="grid grid-cols-4"
          style={{ 
            gap: '20px',
            marginBottom: '40px'
          }}
        >
          {firstRowPosters.map((poster, index) => (
            <div 
              key={`row1-${index}`} 
              className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
              style={{
                width: '333px',
                height: '490px',
                border: '8px solid #000000',
                position: 'relative'
              }}
              onMouseEnter={() => {
                if (poster.hoverSrc || poster.alt === "Once Upon a Time in Hollywood") {
                  setHoveredPoster(poster);
                }
              }}
              onMouseLeave={() => setHoveredPoster(null)}
            >
              <img 
                src={poster.src} 
                alt={poster.alt} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
        
        {/* שורה שנייה - 4 פוסטרים */}
        <div 
          className="grid grid-cols-4"
          style={{ gap: '20px' }}
        >
          {secondRowPosters.map((poster, index) => (
            <div 
              key={`row2-${index}`} 
              className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
              style={{
                width: '333px',
                height: '490px',
                border: poster.src === darkKnight ? '8px solid #3B2F2F' : '8px solid #000000',
                position: 'relative'
              }}
              onMouseEnter={() => {
                if (poster.hoverSrc || poster.alt === "Once Upon a Time in Hollywood") {
                  setHoveredPoster(poster);
                }
              }}
              onMouseLeave={() => setHoveredPoster(null)}
            >
              <img 
                src={poster.src} 
                alt={poster.alt} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </div>
      
     

      {/* דיאלוג תמונת הובר של Silence of the Lambs */}
      {hoveredPoster && hoveredPoster.alt === "Silence of the Lambs" && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              top: '146px',
              left: '176px',
              width: '398px',
              height: '299px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={hoveredPoster.hoverSrc} 
              alt={`${hoveredPoster.alt} hover`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #000000',
              }}
            />
          </div>
          <div 
            style={{
              position: 'absolute',
              top: '451px',
              left: '35px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              THE SILENCE OF THE LAMBS, 1991
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              The skull on the moth's back is made of seven nude women, in a composition based on Salvador Dali's art.
            </div>
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר Once Upon a Time in Hollywood */}
      {hoveredPoster && hoveredPoster.alt === "Once Upon a Time in Hollywood" && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              top: '149px',
              left: '677px',
              width: '272px',
              height: '246px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={hoveredPoster.hoverSrc} 
              alt={`${hoveredPoster.alt} hover`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
          <div 
            style={{
              position: 'absolute',
              top: '402px',
              left: '473px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              ONCE UPON A TIME IN HOLLYWOOD, 2019
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              Quentin Tarantino, the director, appears with a camera, even though he doesn't appear in the film itself.
            </div>
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר Under the Silver Lake */}
      {hoveredPoster && hoveredPoster.alt === "Under the Silver Lake" && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              top: '5px',
              left: '985px',
              width: '257px',
              height: '264px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={hoveredPoster.hoverSrc} 
              alt={`${hoveredPoster.alt} hover`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
          <div 
            style={{
              position: 'absolute',
              top: '275px',
              left: '770px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              UNDER THE SILVER LAKE, 2018
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              A pirate is hidden in the bubbles, along with other concealed figures, reflecting the film's theme of searching for hidden clues.
            </div>
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר Us */}
      {hoveredPoster && hoveredPoster.alt === "Us" && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              top: '53px',
              left: '1290px',
              width: '387px',
              height: '318px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={hoveredPoster.hoverSrc} 
              alt={`${hoveredPoster.alt} hover`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
          <div 
            style={{
              position: 'absolute',
              top: '378px',
              left: '1150px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              US, 2019
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              The scissor handles form two figures facing opposite directions, a nod to the film's theme of dual identity.
            </div>
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר 10 Cloverfield Lane */}
      {hoveredPoster && hoveredPoster.alt === "10 Cloverfield Lane" && (
        <>
          <div 
            style={{ 
              position: 'absolute',
              top: '600px',
              left: '89px',
              width: '302px',
              height: '506px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={hoveredPoster.hoverSrc} 
              alt={`${hoveredPoster.alt} hover`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
          <div 
            style={{
              position: 'absolute',
              top: '676px',
              left: '397px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              10 CLOVERFIELD LANE, 2016
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              The hidden robot is the logo of "Bad Robot Productions", one of the production companies behind the film.
            </div>
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר The Dark Knight */}
      {hoveredPoster && hoveredPoster.alt === "The Dark Knight" && (
        <>
          <div 
            style={{
              position: 'absolute',
              top: '744px',
              left: '425px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              THE DARK KNIGHT, 2008
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              Rotating the poster 90 degrees reveals the phrase "A Taste for the Theatrical", a quote from the previous film's ending.
            </div>
          </div>
          <div 
            style={{ 
              position: 'absolute',
              top: '999px',
              left: '557px',
              width: '416px',
              height: '47px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={darkKnightHover2} 
              alt="The Dark Knight hidden message" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר Captain Marvel */}
      {hoveredPoster && hoveredPoster.alt === "Captain Marvel" && (
        <>
          <div 
            style={{
              position: 'absolute',
              top: '477px',
              left: '778px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              CAPTAIN MARVEL, 2019
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              Brightening the poster reveals Goose's tail, the cat of the main character Carol Danvers.
            </div>
          </div>
          <div 
            style={{ 
              position: 'absolute',
              top: '730px',
              left: '900px',
              width: '344px',
              height: '339px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={captainMarvelHover2} 
              alt="Captain Marvel Goose's tail" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
        </>
      )}

      {/* דיאלוג לפוסטר Passengers */}
      {hoveredPoster && hoveredPoster.alt === "Passengers" && (
        <>
          <div 
            style={{
              position: 'absolute',
              top: '557px',
              left: '1180px',
              width: '680px',
              height: '249px',
              border: '8px solid #3B2F2F',
              background: '#E9D8C3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <div 
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '45px',
                fontWeight: '400',
                lineHeight: '90%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F'
              }}
            >
              PASSENGERS, 2016
            </div>
            <div 
              style={{
                fontFamily: 'Work Sans',
                fontSize: '20px',
                fontWeight: '400',
                lineHeight: '128%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#3B2F2F',
                marginTop: '20px',
                padding: '0 20px'
              }}
            >
              The lines and circles are arranged in Morse code that spells out "SOS", a hint at the film's characters' distress.
            </div>
          </div>
          <div 
            style={{ 
              position: 'absolute',
              top: '809px',
              left: '1255px',
              width: '453px',
              height: '41px',
              zIndex: 1000,
              pointerEvents: 'none',
              opacity: 0,
              animation: 'fadeIn 2s forwards'
            }}
          >
            <img 
              src={passengersHover2} 
              alt="Passengers Morse code" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '8px solid #3B2F2F',
              }}
            />
          </div>
        </>
      )}

      {/* דיאלוג פתיחה */}
      {showIntroDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-[#E9D8C3] border-[#3B2F2F] flex flex-col items-center justify-center"
            style={{ 
              width: '811px',
              height: '459px',
              padding: '25px',
              border: '8px solid #3B2F2F',
              position: 'absolute',
              top: '311px',
              left: '554px'
            }}
          >
            <h1 
              className="text-[#3B2F2F] text-center uppercase font-bold"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                fontSize: '55px',
                lineHeight: '127%',
                letterSpacing: '0%',
                fontWeight: 400,
                width: '731px',
                height: '70px',
                marginBottom: '20px'
              }}
            >
              EASTER EGGS HIDDEN INSIDE MOVIE POSTERS
            </h1>
            
            <p 
              className="text-[#3B2F2F] text-center"
              style={{ 
                fontFamily: "'Work Sans', sans-serif", 
                fontSize: '23px',
                lineHeight: '133%',
                letterSpacing: '0%',
                fontWeight: 400,
                width: '635px',
                height: '104px',
                marginBottom: '30px'
              }}
            >
              Movie posters hold more than meets the eye.<br />
              Each one contains a blurred hidden message.<br />
              Can you find them all?
            </p>
            
            <button 
              className="bg-[#E9D8C3] border-[#3B2F2F] text-[#3B2F2F] uppercase font-bold hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all ease-out duration-300 flex items-center justify-center"
              style={{ 
                width: '218px',
                height: '85px',
                border: '8px solid #3B2F2F',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '32px',
                lineHeight: '137%',
                fontWeight: 400,
                letterSpacing: '0%'
              }}
              onClick={closeIntroDialog}
            >
              EXPLORE
            </button>
          </div>
        </div>
      )}

      {/* הוספת keyframes לאנימציה */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Poster; 