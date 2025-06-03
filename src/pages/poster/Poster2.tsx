import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Poster2 = () => {
  const [showIntroDialog, setShowIntroDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // פונקציה לסגירת הדיאלוג הפותח
  const closeIntroDialog = () => {
    setShowIntroDialog(false);
  };

  // פונקציה לחזרה לעמוד הראשון
  const goToPoster1 = () => {
    navigate('/poster');
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
        aria-label="Close"
      >
        X
      </button>
      
      {/* כפתור חץ שמאלה לחזרה לעמוד הראשון */}
      <button
        className="text-[#3B2F2F] flex items-center justify-center bg-[#E9D8C3] hover:bg-[#3B2F2F] hover:text-[#E9D8C3] transition-all duration-300 ease-out z-50"
        style={{
          position: 'absolute',
          top: '426px',
          left: '20px',
          width: '81px',
          height: '229px',
          border: '8px solid #3B2F2F',
          fontSize: '180px',
          fontWeight: 400,
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: '127%'
        }}
        onClick={goToPoster1}
        aria-label="Previous"
      >
        &lt;
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
        {/* שורה ראשונה - 4 מסגרות */}
        <div 
          className="grid grid-cols-4"
          style={{ 
            gap: '20px',
            marginBottom: '40px'
          }}
        >
          {/* מסגרת ראשונה עם תמונה */}
          <div 
            key="row1-1" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/5f136440ec2df555c4eeaff36e37d205c43b1bbd.jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת שנייה עם תמונה */}
          <div 
            key="row1-2" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/cab5c764f670dfabd1e4bd4f056fcf56722b3e1b (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת שלישית עם תמונה */}
          <div 
            key="row1-3" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/e9454474fc9155a7a09c9b1b3d5777328c348286 (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת אחרונה בשורה הראשונה עם תמונה */}
          <div 
            key="row1-4" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/ea5e3c92764e63196bd25b895d257329abae8a45 (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
        
        {/* שורה שנייה - מסגרות */}
        <div 
          className="grid grid-cols-4"
          style={{ gap: '20px' }}
        >
          {/* מסגרת ראשונה בשורה השנייה עם תמונה */}
          <div 
            key="row2-1" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/328d32017c4a7d26920ff54fd031605fdfb7724e (1).png" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת שנייה בשורה השנייה עם תמונה */}
          <div 
            key="row2-2" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/72aa9318b0b7d0eb933310b442b076dad17f8925 (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת שלישית בשורה השנייה עם תמונה */}
          <div 
            key="row2-3" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/cd7c76e0ea60edd99835fc249a0cd768b848e49d (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* מסגרת אחרונה בשורה השנייה עם תמונה */}
          <div 
            key="row2-4" 
            className="transform transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-white"
            style={{
              width: '333px',
              height: '490px',
              border: '8px solid #000000'
            }}
          >
            <img 
              src="/images/935ad9ce1b90b3c06ba2880e7fd0d2074ce8fd63 (1).jpg" 
              alt="Movie Poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* כפתור חזרה לחדר */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 px-4 py-2 bg-neutral-800 text-white rounded font-bold hover:bg-neutral-700 transition-colors text-sm"
      >
        חזרה לחדר
      </Link>

      {/* דיאלוג פתיחה - מוצג רק אם showIntroDialog הוא true */}
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
    </div>
  );
};

export default Poster2; 