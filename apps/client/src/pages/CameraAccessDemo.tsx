import { useEffect, useRef, useState } from 'react';

const CameraAccessDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Failed to access camera: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Camera Access Demo</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-2xl border rounded-lg"
      />
    </div>
  );
};

export default CameraAccessDemo;
