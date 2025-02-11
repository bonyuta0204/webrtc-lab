import { useEffect, useRef, useState } from "react";

type TrackDetail = {
  track: MediaStreamTrack;
  settings: MediaTrackSettings;
  constraints: MediaTrackConstraints;
};

const CameraAccessDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [tracks, setTracks] = useState<TrackDetail[]>([]);

  useEffect(() => {
    console.log("useEffect");
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setTracks([]);
        stream.getTracks().forEach((track) => {
          setTracks((prev) => [
            ...prev,
            {
              track,
              settings: track.getSettings(),
              constraints: track.getConstraints(),
            },
          ]);
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(
          "Failed to access camera: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Camera Access Demo</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {tracks.map((trackDetail, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Track {index + 1}</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p>
                <strong>id:</strong> {trackDetail.track.id}
              </p>
              <p>
                <strong>label:</strong> {trackDetail.track.label}
              </p>
              <p>
                <strong>Enabled:</strong> {trackDetail.track.enabled.toString()}
              </p>
              <p>
                <strong>Muted:</strong> {trackDetail.track.muted.toString()}
              </p>
            </div>
            <div>
              <p>
                <strong>Kind:</strong> {trackDetail.track.kind}
              </p>
              <p>
                <strong>Width:</strong> {trackDetail.settings.width}px
              </p>
              <p>
                <strong>Height:</strong> {trackDetail.settings.height}px
              </p>
              <p>
                <strong>Frame Rate:</strong> {trackDetail.settings.frameRate}fps
              </p>
            </div>
            <div className="col-span-2">
              <pre className="overflow-y-auto whitespace-pre-wrap bg-gray-200 p-2 rounded-lg text-left">
                {JSON.stringify(trackDetail, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ))}
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
