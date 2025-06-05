// מפת שמות בעברית לאובייקטים בסצנה
export const ELEMENTS_MAP = {
  "ComputerScreen": "Video Games",
  "DeskLamp": "מנורת שולחן",
  "Gamepad": "Video Games",
  "TostitosBag": "Brand Logos",
  "Cube008": "Brand Logos", // החטיף
  "Cube.300": "Hidden Notes", // היומן
  "Cube300_1": "Hidden Notes", // השם האמיתי של היומן
  "Notebook": "Hidden Notes", // יומן
  "Desk": "שולחן",
  "Chair": "כיסא",
  "Poster": "Movie Posters", // רק Plane014 ישתמש במפתח הזה
  "Plane014": "Movie Posters", // הפוסטר - האחד שצריך להציג את זה
  "Plane002_1": "Movie Scenes", // הטלוויזיה
  "Plane002_2": "Video Games", // המחשב
  "Window": "חלון",
  "Monitor": "Video Games",
  "Computer": "Video Games",
  "Screen": "Video Games", // מסך נוסף
  "Mouse": "Video Games",
  "TV": "Movie Scenes",
  "Poster_TV": "Movie Scenes",
  "Screen_TV": "Movie Scenes",
  "Television": "Movie Scenes",
  "Frame": "מסגרת תמונה"
};

// רשימת האובייקטים שיהיו לחיצים בלבד
export const INTERACTIVE_OBJECTS = [
  "Plane014", // רק הפוסטר - זה האחד שצריך להציג "Movie Posters"
  "TV", "TV_1", "TV_2", // הטלוויזיה
  "Plane002_1", // הטלוויזיה השנייה
  "Plane002_2", // המחשב
  "Cube008", // החטיף
  "Tostitos", "bag", // חטיף נוספים
  "base", // הג'ויסטיק
  "gamepad", "Gamepad", // ג'ויסטיק נוספים
  "Monitor", "Screen", "Computer", // מסך ומחשב
  "Mouse", "mouse", // עכבר
  "Cube.300", "Cube300", "Cube300_1", "Notebook", "notebook", "book", "diary", "journal" // היומן - כולל השם האמיתי
];

// ערכי רוטציה התחלתיים לאיפוס המודל
export const INITIAL_ROTATION = [
  -0.4 * (Math.PI / 180),
  -59.7 * (Math.PI / 180),
  -0.1 * (Math.PI / 180)
];

// הגדרות קבועות למצלמה
export const CAMERA_SETTINGS = {
  position: {
    x: 3,
    y: 3.7,
    z: 14
  },
  fov: 45
};

// הגדרות קבועות למודל
export const MODEL_SETTINGS = {
  scale: 5.4,
  position: [-1.8, -0.1, 1.3],
  rotation: [
    -0.4 * (Math.PI / 180),
    -59.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ]
};

// הגדרות ברירת מחדל לתאורה
export const DEFAULT_LIGHTS = {
  ambient: {
    intensity: 0,
    color: '#8b7a3c'
  },
  windowLight: {
    position: [9.0, 2.0, -9.0],
    angle: 0.21,
    penumbra: 0.33,
    distance: 23,
    decay: 0.2,
    intensity: 25,
    color: '#fdf4e3'
  },
  posterLight: {
    position: [-11.5, -5.0, 19.8],
    angle: 0.30,
    penumbra: 0.77,
    distance: 24,
    decay: 0.1,
    intensity: 5,
    color: '#ffffff'
  }
}; 