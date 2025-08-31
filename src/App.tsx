import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// --- TYPE DEFINITIONS ---
interface ThreeScene {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  shape?: THREE.Mesh;
  wireframe?: THREE.Mesh;
  pointLight1?: THREE.PointLight;
  pointLight2?: THREE.PointLight;
  stars?: THREE.Points;
}

// Custom Landmark type to match MediaPipe's output
interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

// --- UTILS AND CONSTANTS ---
const HAND_CONNECTIONS: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [13, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

function drawConnectors(ctx: CanvasRenderingContext2D, landmarks: Landmark[], connections: [number, number][], style: { color: string, lineWidth: number }) {
    ctx.strokeStyle = style.color || '#FFFFFF';
    ctx.lineWidth = style.lineWidth || 2;
    for (const connection of connections) {
        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];
        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            ctx.stroke();
        }
    }
}


// --- Main App Component ---
const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("Loading AI Model...");
    const [error, setError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const threeCanvasRef = useRef<HTMLCanvasElement>(null);
    const webcamCanvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const threeSceneRef = useRef<ThreeScene>({}).current;

    useEffect(() => {
        let isMounted = true;
        let resizeHandler: () => void;

        async function initialize() {
            try {
                setStatus("Initializing Hand Landmarker...");
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numHands: 1,
                });
                if (isMounted) handLandmarkerRef.current = handLandmarker;
                
                setStatus("Initializing 3D Scene...");
                resizeHandler = initThreeScene();
                
                setStatus("Requesting Webcam Access...");
                await initWebcam();

                if (isMounted) {
                    setLoading(false);
                    setStatus("Ready! Show your hand.");
                    setShowInstructions(true);
                    startPredictionLoop();
                }
            } catch (err: any) {
                console.error("Initialization failed:", err);
                if (isMounted) {
                    setError(err.message || "An error occurred during setup. Please check browser permissions and refresh.");
                    setLoading(false);
                }
            }
        }

        initialize();

        return () => {
            isMounted = false;
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (resizeHandler) window.removeEventListener('resize', resizeHandler);
        };
    }, []);

    const initThreeScene = (): (() => void) => {
        if (!threeCanvasRef.current) return () => {};
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(0x8a2be2, 3, 100);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x00ffff, 3, 100);
        scene.add(pointLight2);

        const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 16);
        const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.1, clearcoat: 1.0 });
        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);

        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x8a2be2, wireframe: true, opacity: 0.15, transparent: true });
        const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
        wireframe.scale.set(1.001, 1.001, 1.001);
        scene.add(wireframe);

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.7 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        threeSceneRef.scene = scene;
        threeSceneRef.camera = camera;
        threeSceneRef.renderer = renderer;
        threeSceneRef.shape = shape;
        threeSceneRef.wireframe = wireframe;
        threeSceneRef.pointLight1 = pointLight1;
        threeSceneRef.pointLight2 = pointLight2;
        threeSceneRef.stars = stars;

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return handleResize;
    };
    
    const initWebcam = () => {
        return new Promise<void>((resolve, reject) => {
            if (!navigator.mediaDevices?.getUserMedia) {
                return reject(new Error("Webcam API not available."));
            }
            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.addEventListener("loadeddata", () => resolve());
                    }
                })
                .catch(err => reject(err));
        });
    };

    const startPredictionLoop = () => {
        const webcamCtx = webcamCanvasRef.current?.getContext('2d');
        if (!webcamCtx || !handLandmarkerRef.current) return;

        let lastVideoTime = -1;
        const clock = new THREE.Clock();

        const predictWebcam = () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2) {
                animationFrameId.current = requestAnimationFrame(predictWebcam);
                return;
            }
            
            let results;
            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                results = handLandmarkerRef.current?.detectForVideo(video, Date.now());

                webcamCtx.save();
                webcamCtx.clearRect(0, 0, webcamCtx.canvas.width, webcamCtx.canvas.height);
                webcamCtx.scale(-1, 1);
                webcamCtx.translate(-webcamCtx.canvas.width, 0);
                webcamCtx.drawImage(video, 0, 0, webcamCtx.canvas.width, webcamCtx.canvas.height);

                if (results?.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    update3DObject(landmarks);
                    drawConnectors(webcamCtx, landmarks, HAND_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
                    landmarks.forEach(landmark => {
                        webcamCtx.beginPath();
                        webcamCtx.arc(landmark.x * webcamCtx.canvas.width, landmark.y * webcamCtx.canvas.height, 4, 0, 2 * Math.PI);
                        webcamCtx.fillStyle = '#c084fc';
                        webcamCtx.fill();
                    });
                }
                webcamCtx.restore();
            }

            const { renderer, scene, camera, shape, wireframe, pointLight1, pointLight2, stars } = threeSceneRef;
            if (renderer && scene && camera) {
                const elapsedTime = clock.getElapsedTime();
                pointLight1!.position.x = Math.sin(elapsedTime * 0.7) * 4;
                pointLight1!.position.y = Math.cos(elapsedTime * 0.7) * 4;
                pointLight2!.position.x = Math.cos(elapsedTime * 0.5) * 4;
                pointLight2!.position.y = Math.sin(elapsedTime * 0.5) * 4;
                stars!.rotation.y = elapsedTime * 0.01;

                if (!results?.landmarks || results.landmarks.length === 0) {
                    shape!.rotation.y += 0.002;
                    shape!.rotation.x += 0.001;
                    wireframe!.rotation.copy(shape!.rotation);
                }
                renderer.render(scene, camera);
            }

            animationFrameId.current = requestAnimationFrame(predictWebcam);
        };

        predictWebcam();
    };

    const update3DObject = (landmarks: Landmark[]) => {
        const { shape, wireframe, camera } = threeSceneRef;
        if (!shape || !wireframe || !camera) return;

        // --- Rotation Control ---
        const indexFingerTip = landmarks[8];
        const rotationY = (indexFingerTip.x - 0.5) * Math.PI * 2.5;
        const rotationX = (indexFingerTip.y - 0.5) * Math.PI * 2.5;
        shape.rotation.y = THREE.MathUtils.lerp(shape.rotation.y, rotationY, 0.1);
        shape.rotation.x = THREE.MathUtils.lerp(shape.rotation.x, rotationX, 0.1);
        wireframe.rotation.copy(shape.rotation);

        // --- Zoom Control via Pinch Gesture ---
        const thumbTip = landmarks[4];
        
        const dx = thumbTip.x - indexFingerTip.x;
        const dy = thumbTip.y - indexFingerTip.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const zoomLevel = THREE.MathUtils.mapLinear(distance, 0.05, 0.3, 8, 3);
        const clampedZoom = THREE.MathUtils.clamp(zoomLevel, 3, 8);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, clampedZoom, 0.1);
    };

    return (
        <main className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
            <canvas ref={threeCanvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>
            <video ref={videoRef} autoPlay playsInline className="absolute opacity-0 pointer-events-none w-1 h-1"></video>

            {/* --- UI Overlay --- */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between p-8 z-10 pointer-events-none">
                <div className="w-full flex justify-between items-start">
                    <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-violet-500/30">
                        <h1 className="text-2xl font-bold text-violet-300">AI Gesture Controller</h1>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm p-2 rounded-lg shadow-2xl border border-violet-500/30">
                        <canvas ref={webcamCanvasRef} width="320" height="240" className="rounded-md"></canvas>
                    </div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm py-3 px-6 rounded-lg text-center border border-violet-500/30">
                    {loading && (
                        <div className="flex items-center space-x-3 text-violet-300">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium text-lg">{status}</span>
                        </div>
                    )}
                    {error && <p className="text-red-400 font-bold">{error}</p>}
                    {!loading && !error && !showInstructions && <p className="font-medium text-lg text-violet-300">{status}</p>}
                </div>
            </div>

            {/* --- Instructions Modal --- */}
            {showInstructions && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-gray-800/80 border border-violet-500/50 rounded-xl p-8 max-w-md w-11/12 text-center flex flex-col items-center shadow-2xl">
                        <h2 className="text-3xl font-bold text-violet-300 mb-6">How to Control</h2>
                        <div className="flex flex-col md:flex-row gap-8 w-full mb-8">
                            <div className="flex-1 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-violet-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="text-xl font-semibold mb-2">Rotate</h3>
                                <p className="text-gray-400 text-sm">Move your index finger around the screen to rotate the object.</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-violet-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" /></svg>
                                <h3 className="text-xl font-semibold mb-2">Zoom</h3>
                                <p className="text-gray-400 text-sm">Pinch your thumb and index finger together or spread them apart to zoom.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowInstructions(false)}
                            className="bg-violet-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-violet-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Start Controlling
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default App;