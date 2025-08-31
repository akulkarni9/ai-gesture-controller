# ✋ AI Gesture Controller

An interactive web application that uses your webcam to perform real-time hand tracking, allowing you to control a 3D object with natural hand gestures.  

Built with **React 19, TailwindCSS V4, Vite, Three.js, and Google's MediaPipe**.  
  
**[View Live Demo](https://ai-gesture-controller.vercel.app/)**

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
   cd ai-gesture-controller
   npm install
3. **Run the development server:**  
   ```bash
   npm run dev
  
Your site will be available at: http://localhost:5173  

---  

## 🔮 Future Plans  
1. Expanded Gesture Library
Add more complex gestures (e.g., closed fist → change object color, "peace" sign → switch 3D models).

2. Custom Model Uploads
Allow users to upload their own .glb or .obj 3D models.

3. Physics Engine Integration
Use react-three-rapier for realistic physics, letting users "push" and interact with objects.

4. UI for Model Customization
Real-time controls for material properties like color, roughness, and metalness.

5. Performance Optimization
Optimize the prediction loop and rendering pipeline for smoother performance on low-end devices.  

 ---   

## ☕ Support Me
If you find this AI Gesture Controller useful and would like to show your appreciation, you can buy me a coffee! It's never expected, but always appreciated.

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/akulkarni9)

---

## 📄 License
This project is distributed under the MIT License. See `LICENSE` for more information.

---




