# ✋ AI Gesture Controller

An interactive web application that uses your webcam to perform real-time hand tracking, allowing you to control a 3D object with natural hand gestures.  

Built with **React 19, Vite, Three.js, and Google's MediaPipe**.

---

## ✨ Core Features

- **Real-Time Gesture Recognition**  
  Tracks 21 key points on your hand in real-time using the MediaPipe Hand Landmarker model, directly in the browser.

- **Interactive 3D Scene**  
  Renders a dynamic 3D scene using Three.js, including:  
  - A Torus Knot object  
  - Dynamic lighting  
  - A starfield background  

- **Intuitive Controls**  
  - **Rotate:** Move your index finger to rotate the 3D object on the X and Y axes.  
  - **Zoom:** Pinch your thumb and index finger together or spread them apart to control the camera's zoom level.  

- **Client-Side AI**  
  All AI processing happens on your device. Your webcam data never leaves your computer, ensuring **100% privacy**.

- **Responsive Design**  
  The UI and 3D canvas adapt seamlessly to different screen sizes.

---

## 🚀 Technology Stack

- **Frontend:** React 19, Vite, TypeScript  
- **Styling:** Tailwind CSS v4  
- **3D Graphics:** Three.js  
- **AI/ML:** Google MediaPipe (Hand Landmarker Task)  
- **Deployment:** Vercel  

---

## ⚙️ How It Works

1. **Webcam Capture**  
   Accesses your webcam feed securely using the `getUserMedia` API.

2. **AI Processing**  
   Each video frame is passed to the MediaPipe Hand Landmarker model, running locally on the GPU via WebGL.

3. **Landmark Extraction**  
   The model outputs the 3D coordinates of the hand landmarks.

4. **Gesture Mapping**  
   - Index finger tip (landmark `#8`) → controls object rotation  
   - Distance between thumb tip (`#4`) and index finger tip (`#8`) → controls camera zoom  

5. **3D Rendering**  
   The Three.js scene is updated in a `requestAnimationFrame` loop for smooth interactivity.

---

### 📥 Installation & Setup  

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/akulkarni9/ai-gesture-controller.git
2. **Install dependencies:**  
   ```bash
   cd your-repo-name
   npm install
3. **Run the development server:**  
   ```bash
   npm run dev
  
Your site will be available at: http://localhost:5173  

---  





