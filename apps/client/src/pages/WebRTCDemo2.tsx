import { useRef, useState } from "react";

const WebRTCDemo2 = () => {
  const [localPeerConnection, setLocalPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remotePeerConnection, setRemotePeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localCandidates, setLocalCandidates] = useState<RTCIceCandidate[]>([]);
  const [remoteCandidates, setRemoteCandidates] = useState<RTCIceCandidate[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  async function startCasting() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      console.log("[MEDIA] Successfully accessed user media stream");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const configuration: RTCConfiguration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      };

      const localPC = new RTCPeerConnection(configuration);
      const remotePC = new RTCPeerConnection(configuration);

      setLocalPeerConnection(localPC);
      setRemotePeerConnection(remotePC);

      console.log("[LOCAL] Created new RTCPeerConnection");
      console.log("[REMOTE] Created new RTCPeerConnection");

      localPC.addEventListener("icecandidate", (event) => {
        console.log("[LOCAL] ICE candidate", event.candidate);
        if (event.candidate) {
          setLocalCandidates((prev) => [...prev, event.candidate!]);
        }
        onIceCandidate(remotePC, event);
      });

      localPC.addEventListener("signalingstatechange", () => {
        console.log(
          "[LOCAL] Signaling state changed:",
          localPC.signalingState
        );
        console.log("[LOCAL] Connection state:", localPC.connectionState);
      });

      localPC.addEventListener("connectionstatechange", () => {
        console.log(
          "[LOCAL] Connection state changed:",
          localPC.connectionState
        );
      });

      remotePC.addEventListener("icecandidate", (event) => {
        console.log("[REMOTE] ICE candidate", event.candidate);
        if (event.candidate) {
          setRemoteCandidates((prev) => [...prev, event.candidate!]);
        }
        onIceCandidate(localPC, event);
      });

      remotePC.addEventListener("signalingstatechange", () => {
        console.log(
          "[REMOTE] Signaling state changed:",
          remotePC.signalingState
        );
        console.log("[REMOTE] Connection state:", remotePC.connectionState);
      });

      remotePC.addEventListener("connectionstatechange", () => {
        console.log(
          "[REMOTE] Connection state changed:",
          remotePC.connectionState
        );
      });

      remotePC.addEventListener("track", (event) => {
        console.log("[REMOTE] Received remote track", {
          kind: event.track.kind,
          id: event.track.id,
          label: event.track.label,
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      });

      stream.getTracks().forEach((track) => {
        localPC.addTrack(track, stream);
      });

      const offer = await localPC.createOffer();
      await localPC.setLocalDescription(offer);
      await remotePC.setRemoteDescription(offer);

      const answer = await remotePC.createAnswer();
      await remotePC.setLocalDescription(answer);
      await localPC.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }

  function onIceCandidate(
    pc: RTCPeerConnection,
    event: RTCPeerConnectionIceEvent
  ) {
    if (event.candidate) {
      pc.addIceCandidate(event.candidate).catch((e) =>
        console.error("Error adding ICE candidate:", e)
      );
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WebRTC Demo 2</h1>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Local Video</h2>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="border border-gray-300 rounded"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Remote Video</h2>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="border border-gray-300 rounded"
            />
          </div>
        </div>
        <button
          onClick={startCasting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Video Call
        </button>
      </div>
    </div>
  );
};

export default WebRTCDemo2;
