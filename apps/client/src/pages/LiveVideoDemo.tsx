import { useEffect, useRef, useState } from 'react';

const LiveVideoDemo = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Failed to access media devices: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    startVideo();

    return () => {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Video Demo</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid gap-4">
        <div>
          <h2 className="text-xl mb-2">Local Video</h2>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-2xl border rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LiveVideoDemo;
