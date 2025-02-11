import { useEffect, useRef, useState } from "react";

const createPeerConnection = async () => {};

const WebRTCDemo = () => {
  const [pc1, setPc1] = useState<RTCPeerConnection | null>(null);
  const [pc2, setPc2] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (pc1VideoRef.current) {
          pc1VideoRef.current.srcObject = stream;
        }

        const peerConnection1 = new RTCPeerConnection();
        const peerConnection2 = new RTCPeerConnection();

        setPc1(peerConnection1);
        setPc2(peerConnection2);

        peerConnection1.addEventListener("icecandidate", (event) =>
          onIceCandidate(peerConnection2, event)
        );

        peerConnection1.addEventListener("signalingstatechange", (event) => {
          console.log("[pc1] signalingState: ", peerConnection1.signalingState);
        });

        peerConnection2.addEventListener("icecandidate", (event) =>
          onIceCandidate(peerConnection1, event)
        );

        peerConnection2.addEventListener("signalingstatechange", (event) => {
          console.log("[pc2] signalingState: ", peerConnection2.signalingState);
        });

        peerConnection2.addEventListener("track", (event) => {
          console.log("[pc2] track: ", event);
          if (pc2VideoRef.current) {
            pc2VideoRef.current.srcObject = event.streams[0];
          }
        });

        stream.getTracks().forEach((track) => {
          peerConnection1.addTrack(track, stream);
        });

        const offer = await peerConnection1.createOffer();
        console.log("[pc1] offer: ", offer);
        await peerConnection1.setLocalDescription(offer);
        await peerConnection2.setRemoteDescription(offer);
        const answer = await peerConnection2.createAnswer();
        console.log("[pc2] answer: ", answer);
        await peerConnection2.setLocalDescription(answer);
        await peerConnection1.setRemoteDescription(answer);
      } catch (err) {
        console.error(err);
      }
    };

    start();

    createPeerConnection();
  }, []);

  function onIceCandidate(
    pc: RTCPeerConnection,
    event: RTCPeerConnectionIceEvent
  ) {
    if (!event.candidate) return;
    console.log("onIceCandidate", event);
    pc.addIceCandidate(event.candidate);
  }

  const pc1VideoRef = useRef<HTMLVideoElement>(null);
  const pc2VideoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Web RTC Demo</h1>
      <div className="flex w-full">
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
  );
};

export default WebRTCDemo;
