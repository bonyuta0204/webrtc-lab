import { useRef, useState } from "react";
import { WebSocketClient } from "../lib/websocket";

const WebRTCDemo2 = () => {
  const localPeerConnection = useRef<RTCPeerConnection | null>(null);
  const remotePeerConnection = useRef<RTCPeerConnection | null>(null);
  const [localCandidates, setLocalCandidates] = useState<RTCIceCandidate[]>([]);
  const [remoteCandidates, setRemoteCandidates] = useState<RTCIceCandidate[]>(
    []
  );
  const wsClient = useRef<WebSocketClient | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const RTCConfiguration: RTCConfiguration = {
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

  async function setupMediaStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    console.log("[MEDIA] Successfully accessed user media stream");

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }

  async function setupWebSocket() {
    const ws = new WebSocketClient("ws://localhost:3000");

    await ws.connect();
    console.log("Connected to the signaling server");
    wsClient.current = ws;
  }

  async function setupLocalPeerConnection(
    stream: MediaStream,
    ws: WebSocketClient
  ) {
    const localPC = new RTCPeerConnection(RTCConfiguration);
    localPeerConnection.current = localPC;
    console.log("[LOCAL] Created new RTCPeerConnection");

    localPC.addEventListener("icecandidate", (event) => {
      console.log("[LOCAL] ICE candidate", event.candidate);
      if (event.candidate) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            payload: event.candidate,
            target: "remote",
          })
        );
      }
    });

    localPC.addEventListener("signalingstatechange", () => {
      console.log("[LOCAL] Signaling state changed:", localPC.signalingState);
      console.log("[LOCAL] Connection state:", localPC.connectionState);
    });

    localPC.addEventListener("connectionstatechange", () => {
      console.log("[LOCAL] Connection state changed:", localPC.connectionState);
    });

    stream.getTracks().forEach((track) => {
      localPC.addTrack(track, stream);
    });

    const offer = await localPC.createOffer();
    await localPC.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: "offer", payload: offer }));

    return localPC;
  }

  function setupRemotePeerConnection(ws: WebSocketClient) {
    const remotePC = new RTCPeerConnection(RTCConfiguration);
    remotePeerConnection.current = remotePC;
    console.log("[REMOTE] Created new RTCPeerConnection");

    remotePC.addEventListener("icecandidate", (event) => {
      console.log("[REMOTE] ICE candidate", event.candidate);
      if (event.candidate) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            payload: event.candidate,
            target: "local",
          })
        );
      }
    });

    remotePC.addEventListener("signalingstatechange", () => {
      console.log("[REMOTE] Signaling state changed:", remotePC.signalingState);
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

    // Set up message handler for WebSocket

    return remotePC;
  }

  async function handleOffer(offer: RTCSessionDescriptionInit) {
    console.log("[REMOTE] Received offer", offer);
    console.log("[REMOTE] remotePeerConnection", remotePeerConnection);
    remotePeerConnection.current?.setRemoteDescription(offer);
    const answer = await remotePeerConnection.current?.createAnswer();
    remotePeerConnection.current?.setLocalDescription(answer);
    console.log("[REMOTE] Sending answer", answer);
    wsClient.current?.send(JSON.stringify({ type: "answer", payload: answer }));
  }

  function handleAnswer(answer: RTCSessionDescriptionInit) {
    console.log("[LOCAL] Received answer", answer);
    localPeerConnection.current?.setRemoteDescription(answer);
  }

  function handleLocalCandidate(candidate: RTCIceCandidateInit) {
    console.log("[LOCAL] Received ICE candidate", candidate);
    localPeerConnection.current?.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }

  function handleRemoteCandidate(candidate: RTCIceCandidateInit) {
    console.log("[REMOTE] Received ICE candidate", candidate);
    remotePeerConnection.current?.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }

  async function startCasting() {
    try {
      // Step 1: Set up media stream
      const stream = await setupMediaStream();

      // Step 2: Set up WebSocket connection
      await setupWebSocket();

      wsClient.current?.onMessage((event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "offer":
            handleOffer(message.payload);
            break;
          case "answer":
            handleAnswer(message.payload);
            break;
          case "candidate":
            if (message.target === "local") {
              handleLocalCandidate(message.payload);
            } else if (message.target === "remote") {
              handleRemoteCandidate(message.payload);
            } else {
              console.error();
            }
            break;
        }
      });

      // Step 3: Set up peer connections
      setupLocalPeerConnection(stream, wsClient.current);
      setupRemotePeerConnection(wsClient.current);
    } catch (error) {
      console.error("Error in startCasting:", error);
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
