# ✋ AI Gesture Controller  

An interactive web application that uses your webcam to perform real-time hand tracking, allowing you to control a 3D object with natural hand gestures.  

Built with **React 19, Vite, Three.js, and Google's MediaPipe**.  

---

## ✨ Core Features  

- **Real-Time Gesture Recognition**  
  Utilizes the MediaPipe Hand Landmarker model to track 21 key points on your hand in real-time, directly in the browser.  

- **Interactive 3D Scene**  
  Renders a dynamic 3D scene using Three.js, featuring:  
  - A visually appealing Torus Knot  
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

The application follows a continuous, real-time loop:  

1. **Webcam Capture**  
   Accesses your webcam feed securely using the `getUserMedia` API.  

2. **AI Processing**  
   Each video frame is passed to the MediaPipe Hand Landmarker model, running locally on the GPU via WebGL.  

3. **Landmark Extraction**  
   The model outputs the 3D coordinates of the hand landmarks.  

4. **Gesture Mapping**  
   - The coordinates of the **index finger tip** (landmark `#8`) are mapped to the 3D object's rotation.  
   - The distance between the **thumb tip** (landmark `#4`) and the **index finger tip** is used to control the camera's zoom.  

5. **3D Rendering**  
   The Three.js scene is updated in a `requestAnimationFrame` loop, ensuring smooth interactivity.  

---

## 🛠️ Local Setup & Installation  

To run this project locally:  

```bash
# Clone the repository
git clone https://github.com/akulkarni9/ai-gesture-controller.git  

# Navigate to the project directory
cd ai-gesture-controller  

# Install dependencies
npm install  

# Start the development server
npm run dev

---  

## 🔮 Future Plans. 
Expanded Gesture Library: Implement more complex gestures, such as a closed fist to change the object's color or a "peace" sign to switch between different 3D models.

Custom Model Uploads: Allow users to upload their own .glb or .obj 3D models to control.

Physics Engine Integration: Incorporate a physics engine like react-three-rapier to allow users to "push" and interact with objects in a more dynamic way.

UI for Model Customization: Add controls to adjust material properties like color, roughness, and metalness in real-time.

Performance Optimization: Further optimize the prediction loop and rendering pipeline for smoother performance on lower-end devices.