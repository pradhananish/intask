
import React, { useRef, useEffect } from 'react';

const Dashboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
 
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    }
    setupCamera();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Real-Time Face Blurring Dashboard</h1>
      <div className="relative w-full max-w-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-lg shadow-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
      <div className="mt-6 flex gap-4">
        {/* Replace with shadcn/ui button */}
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
          Start Blurring
        </button>
      </div>
    </div>
  );
};

export default Dashboard;