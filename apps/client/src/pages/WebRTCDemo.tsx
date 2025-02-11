import { useRef, useState } from "react";

const WebRTCDemo = () => {
  const [pc1, setPc1] = useState<RTCPeerConnection | null>(null);
  const [pc2, setPc2] = useState<RTCPeerConnection | null>(null);
  const [pc1Candidates, setPc1Candidates] = useState<RTCIceCandidate[]>([]);
  const [pc2Candidates, setPc2Candidates] = useState<RTCIceCandidate[]>([]);

  async function startCasting() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      console.log("[MEDIA] Successfully accessed user media stream");

      if (pc1VideoRef.current) {
        pc1VideoRef.current.srcObject = stream;
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

      const peerConnection1 = new RTCPeerConnection(configuration);
      const peerConnection2 = new RTCPeerConnection(configuration);

      setPc1(peerConnection1);
      setPc2(peerConnection2);

      console.log("[PC1] Created new RTCPeerConnection");
      console.log("[PC2] Created new RTCPeerConnection");

      peerConnection1.addEventListener("icecandidate", (event) => {
        console.log("[PC1] ICE candidate", event.candidate);
        if (event.candidate) {
          setPc1Candidates((prev) => [...prev, event.candidate!]);
        }
        onIceCandidate(peerConnection2, event);
      });

      peerConnection1.addEventListener("signalingstatechange", () => {
        console.log(
          "[PC1] Signaling state changed:",
          peerConnection1.signalingState
        );
        console.log("[PC1] Connection state:", peerConnection1.connectionState);
      });

      peerConnection1.addEventListener("connectionstatechange", () => {
        console.log(
          "[PC1] Connection state changed:",
          peerConnection1.connectionState
        );
      });

      peerConnection2.addEventListener("icecandidate", (event) => {
        console.log("[PC2] ICE candidate", event.candidate);
        if (event.candidate) {
          setPc2Candidates((prev) => [...prev, event.candidate!]);
        }
        onIceCandidate(peerConnection1, event);
      });

      peerConnection2.addEventListener("signalingstatechange", () => {
        console.log(
          "[PC2] Signaling state changed:",
          peerConnection2.signalingState
        );
        console.log("[PC2] Connection state:", peerConnection2.connectionState);
      });

      peerConnection2.addEventListener("connectionstatechange", () => {
        console.log(
          "[PC2] Connection state changed:",
          peerConnection2.connectionState
        );
      });

      peerConnection2.addEventListener("track", (event) => {
        console.log("[PC2] Received remote track", {
          kind: event.track.kind,
          id: event.track.id,
          label: event.track.label,
        });
        if (pc2VideoRef.current) {
          pc2VideoRef.current.srcObject = event.streams[0];
        }
      });

      stream.getTracks().forEach((track) => {
        peerConnection1.addTrack(track, stream);
        console.log("[PC1] Added local track", {
          kind: track.kind,
          id: track.id,
          label: track.label,
        });
      });

      const offer = await peerConnection1.createOffer();
      console.log("[PC1] Created offer:", offer.sdp);

      await peerConnection1.setLocalDescription(offer);
      console.log("[PC1] Set local description (offer)");

      await peerConnection2.setRemoteDescription(offer);
      console.log("[PC2] Set remote description (offer)");

      const answer = await peerConnection2.createAnswer();
      console.log("[PC2] Created answer:", answer.sdp);

      await peerConnection2.setLocalDescription(answer);
      console.log("[PC2] Set local description (answer)");

      await peerConnection1.setRemoteDescription(answer);
      console.log("[PC1] Set remote description (answer)");
    } catch (err) {
      console.error("[ERROR] WebRTC setup failed:", {
        name: (err as any).name,
        message: (err as any).message,
        stack: (err as any).stack,
      });
    }
  }

  function onIceCandidate(
    pc: RTCPeerConnection,
    event: RTCPeerConnectionIceEvent
  ) {
    if (!event.candidate) {
      console.log("[ICE] Candidate gathering complete");
      return;
    }
    console.log("[ICE] Adding ICE candidate to peer", {
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex,
    });
    pc.addIceCandidate(event.candidate);
  }

  const pc1VideoRef = useRef<HTMLVideoElement>(null);
  const pc2VideoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Web RTC Demo</h1>
      <div>
        <button onClick={startCasting}>Start</button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">PC1 ICE Candidates</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-auto">
              {pc1Candidates.map((candidate, index) => (
                <div key={index} className="text-sm mb-2">
                  <div className="font-mono break-all bg-white p-2 rounded">
                    {candidate.candidate}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">PC2 ICE Candidates</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-auto">
              {pc2Candidates.map((candidate, index) => (
                <div key={index} className="text-sm mb-2">
                  <div className="font-mono break-all bg-white p-2 rounded">
                    {candidate.candidate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-1/2">
            <div>
              <p>PC1</p>
            </div>
            <div>
              <video ref={pc1VideoRef} playsInline autoPlay></video>
            </div>
          </div>
          <div className="w-1/2">
            <div>
              <p>PC2</p>
            </div>
            <div>
              <video ref={pc2VideoRef} playsInline autoPlay></video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRTCDemo;
