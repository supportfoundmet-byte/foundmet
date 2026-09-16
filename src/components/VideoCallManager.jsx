/**
 * VideoCallManager (forwardRef)
 *
 * Full WebRTC video/audio call UI + signaling via Socket.IO.
 * Supports:
 *  - High-reliability P2P WebRTC with ICE candidate buffering
 *  - Custom synthesizer ringtones for caller (dialing tone) and callee (incoming ringtone)
 *  - 30-second ring timeout with missed call recording
 *  - Audio & Video call modes with PiP preview, mute, camera toggle & fullscreen
 *  - Secure connection checks & automatic session teardown
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

// ── Public STUN servers ───────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

const avatarFor = (name, photo) =>
  photo ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "F")}&background=0B5CFF&color=fff&size=120`;

const formatDuration = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const RING_TIMEOUT_MS = 30000; // 30s auto-hangup if unanswered

const VideoCallManager = forwardRef(function VideoCallManager({ socket, currentUser }, ref) {
  // ── Call lifecycle state ──────────────────────────────────────────────────
  const [callState, setCallState] = useState("idle"); // idle | calling | incoming | active
  const [callId, setCallId] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null); // { _id, name, photo }
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callType, setCallType] = useState("video"); // "video" | "audio"
  const [callDuration, setCallDuration] = useState(0);

  // Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedSinkId, setSelectedSinkId] = useState("");
  const [showSpeakerMenu, setShowSpeakerMenu] = useState(false);

  // ── Refs for WebRTC & Audio ───────────────────────────────────────────────
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const durationTimerRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringtoneTimerRef = useRef(null);

  // Mirror refs for async callbacks & event handlers
  const callIdRef = useRef(null);
  const remoteUserRef = useRef(null);
  const iceQueueRef = useRef([]); // Buffers incoming ICE candidates before setRemoteDescription

  useEffect(() => { callIdRef.current = callId; }, [callId]);
  useEffect(() => { remoteUserRef.current = remoteUser; }, [remoteUser]);

  // ── Ringtone Generator ─────────────────────────────────────────────────────
  const stopRingtone = useCallback(() => {
    if (ringtoneTimerRef.current) {
      clearInterval(ringtoneTimerRef.current);
      ringtoneTimerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch { /* ignore */ }
      audioContextRef.current = null;
    }
  }, []);

  const playSound = useCallback((mode = "incoming") => {
    stopRingtone();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const beep = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
        try {
          if (ctx.state === "suspended") ctx.resume();

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          if (mode === "incoming") {
            // Dual-tone modern telephone ring
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
          } else {
            // Outgoing gentle dial tone beep
            osc.frequency.setValueAtTime(425, ctx.currentTime);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.2);
          }
        } catch { /* ignore */ }
      };

      beep();
      ringtoneTimerRef.current = setInterval(beep, mode === "incoming" ? 2200 : 3500);
    } catch { /* ignore */ }
  }, [stopRingtone]);

  // ── Teardown & Reset ───────────────────────────────────────────────────────
  const resetCallState = useCallback(() => {
    stopRingtone();

    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Stop and release media devices
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch { /* ignore */ }
      });
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      try { pcRef.current.close(); } catch { /* ignore */ }
      pcRef.current = null;
    }

    iceQueueRef.current = [];
    callIdRef.current = null;
    remoteUserRef.current = null;
    setCallState("idle");
    setCallId(null);
    setRemoteUser(null);
    setIncomingOffer(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsFullscreen(false);
    setIsSpeakerMuted(false);
    setShowSpeakerMenu(false);
    setAudioOutputDevices([]);
  }, [stopRingtone]);

  // ── Acquire Media Devices ──────────────────────────────────────────────────
  const getLocalStream = useCallback(async (type) => {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: type === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // ── Build RTCPeerConnection with ICE candidate relay ──────────────────────
  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Send generated ICE candidates to remote peer
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket && targetUserId) {
        socket.emit("webrtc_ice_candidate", {
          callId: callIdRef.current,
          candidate,
          targetUserId: String(targetUserId),
        });
      }
    };

    // Receive remote video/audio track
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        resetCallState();
      }
    };

    return pc;
  }, [socket, resetCallState]);

  // ── Drain ICE Candidates Queue ─────────────────────────────────────────────
  const drainIceCandidates = useCallback(async (pc) => {
    if (!pc || !pc.remoteDescription) return;
    const queued = [...iceQueueRef.current];
    iceQueueRef.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] addIceCandidate drain error:", err.message);
      }
    }
  }, []);

  // ── Caller: Start Call ─────────────────────────────────────────────────────
  const startCall = useCallback(
    async (contact, type = "video") => {
      if (!socket || !currentUser || !contact?._id) return;
      if (callState !== "idle") return;

      try {
        setCallState("calling");
        setRemoteUser(contact);
        setCallType(type);
        playSound("outgoing");

        // 1. Get user media
        const stream = await getLocalStream(type);

        // 2. Create peer connection & add local tracks
        const pc = createPeerConnection(String(contact._id));
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // 3. Create offer SDP
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 4. Send call request to server
        socket.timeout(12000).emit(
          "call_user",
          { calleeId: String(contact._id), offer, callType: type },
          (err, response) => {
            if (err || !response?.ok) {
              stopRingtone();
              alert(response?.message || "Could not connect call. User might be offline.");
              resetCallState();
              return;
            }
            setCallId(response.callId);

            // Set 30s ringing timeout
            ringTimeoutRef.current = setTimeout(() => {
              stopRingtone();
              if (socket && response.callId) {
                socket.emit("call_ended", { callId: response.callId });
              }
              alert("No answer from " + (contact.name || "founder"));
              resetCallState();
            }, RING_TIMEOUT_MS);
          },
        );
      } catch (err) {
        console.error("[WebRTC] startCall error:", err);
        stopRingtone();
        alert("Camera / Microphone permission is required to start a call.");
        resetCallState();
      }
    },
    [socket, currentUser, callState, playSound, stopRingtone, getLocalStream, createPeerConnection, resetCallState],
  );

  // ── Callee: Accept Call ────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!socket || !incomingOffer || !callIdRef.current || !remoteUserRef.current) return;
    stopRingtone();
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);

    try {
      setCallState("active");
      const stream = await getLocalStream(callType);
      const pc = createPeerConnection(String(remoteUserRef.current._id));
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set remote offer SDP
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Drain queued ICE candidates
      await drainIceCandidates(pc);

      // Create and set local answer SDP
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to caller
      socket.emit("call_accepted", { callId: callIdRef.current, answer });

      // Start call duration timer
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("[WebRTC] acceptCall error:", err);
      alert("Could not access camera/microphone.");
      if (socket && callIdRef.current) {
        socket.emit("call_rejected", { callId: callIdRef.current });
      }
      resetCallState();
    }
  }, [socket, incomingOffer, callType, stopRingtone, getLocalStream, createPeerConnection, drainIceCandidates, resetCallState]);

  // ── Callee: Reject Call ────────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    stopRingtone();
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (socket && callIdRef.current) {
      socket.emit("call_rejected", { callId: callIdRef.current });
    }
    resetCallState();
  }, [socket, stopRingtone, resetCallState]);

  // ── Either: End Call ───────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    stopRingtone();
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (socket && callIdRef.current) {
      socket.emit("call_ended", { callId: callIdRef.current });
    }
    resetCallState();
  }, [socket, stopRingtone, resetCallState]);

  // ── Controls: Mute, Camera & Speaker ─────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((off) => !off);
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (remoteVideoRef.current) {
      const next = !remoteVideoRef.current.muted;
      remoteVideoRef.current.muted = next;
      setIsSpeakerMuted(next);
    } else {
      setIsSpeakerMuted((prev) => !prev);
    }
  }, []);

  const changeAudioOutput = useCallback(async (sinkId) => {
    try {
      if (remoteVideoRef.current && typeof remoteVideoRef.current.setSinkId === "function") {
        await remoteVideoRef.current.setSinkId(sinkId);
        setSelectedSinkId(sinkId);
      }
    } catch (err) {
      console.warn("[WebRTC] setSinkId error:", err.message);
    }
    setShowSpeakerMenu(false);
  }, []);

  // ── Expose startCall via ref ───────────────────────────────────────────────
  useImperativeHandle(ref, () => ({ startCall }), [startCall]);

  // ── Attach Video Streams & Enumerate Audio Output Devices on Render ───────
  useEffect(() => {
    if (callState === "active") {
      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      // Enumerate available speaker/headphone devices
      if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === "function") {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            const outputs = devices.filter((d) => d.kind === "audiooutput");
            setAudioOutputDevices(outputs);
          })
          .catch(() => {});
      }
    }
  }, [callState]);

  // ── Socket.IO Event Listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // 1. Caller receives answer from callee
    const onCallAccepted = async ({ callId: cId, answer }) => {
      stopRingtone();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);

      if (!pcRef.current) return;
      setCallId(cId);
      setCallState("active");

      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await drainIceCandidates(pcRef.current);

        clearInterval(durationTimerRef.current);
        durationTimerRef.current = setInterval(() => {
          setCallDuration((d) => d + 1);
        }, 1000);
      } catch (err) {
        console.error("[WebRTC] setRemoteDescription (answer) error:", err);
      }
    };

    // 2. Caller receives rejection or busy
    const onCallRejected = ({ reason }) => {
      stopRingtone();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);

      const msgs = {
        rejected: "Call was declined.",
        offline: "Founder is currently offline.",
        busy: "Founder is currently on another call.",
      };
      alert(msgs[reason] || "Call disconnected.");
      resetCallState();
    };

    // 3. Callee receives incoming call
    const onCallIncoming = ({ callId: cId, callerId, callerName, callerPhoto, offer, callType: ct }) => {
      console.log("[VideoCall] Incoming call received from:", callerName, "callId:", cId);

      // Auto-reject only if already in an active or calling state
      if (callState === "active" || callState === "calling") {
        socket.emit("call_rejected", { callId: cId, reason: "busy" });
        return;
      }

      callIdRef.current = cId;
      remoteUserRef.current = { _id: callerId, name: callerName, photo: callerPhoto };

      setCallId(cId);
      setRemoteUser({ _id: callerId, name: callerName, photo: callerPhoto });
      setIncomingOffer(offer);
      setCallType(ct || "video");
      setCallState("incoming");
      playSound("incoming");

      // Auto-timeout after 30 seconds if unanswered
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = setTimeout(() => {
        stopRingtone();
        resetCallState();
      }, RING_TIMEOUT_MS);

      // Push / Notification
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(`📞 Incoming ${ct === "audio" ? "voice" : "video"} call`, {
            body: `${callerName} is calling you`,
            icon: callerPhoto || "/favicon.svg",
            tag: `call-${cId}`,
          });
        } catch { /* ignore */ }
      }
    };

    // 4. Either side hangs up
    const onCallEnded = () => {
      stopRingtone();
      resetCallState();
    };

    // 5. ICE candidate arrived from remote peer
    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("[WebRTC] addIceCandidate error:", err.message);
        }
      } else {
        // Buffer until remote description is set
        iceQueueRef.current.push(candidate);
      }
    };

    // 6. SDP offer re-negotiation
    const onOffer = async ({ callId: cId, offer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("webrtc_answer", {
          callId: cId,
          answer,
          targetUserId: remoteUserRef.current?._id,
        });
      } catch (err) {
        console.warn("[WebRTC] renegotiate offer error:", err.message);
      }
    };

    // 7. SDP answer re-negotiation
    const onAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.warn("[WebRTC] renegotiate answer error:", err.message);
      }
    };

    socket.on("call_accepted", onCallAccepted);
    socket.on("call_rejected", onCallRejected);
    socket.on("call_incoming", onCallIncoming);
    socket.on("call_ended", onCallEnded);
    socket.on("webrtc_ice_candidate", onIceCandidate);
    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);

    return () => {
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_rejected", onCallRejected);
      socket.off("call_incoming", onCallIncoming);
      socket.off("call_ended", onCallEnded);
      socket.off("webrtc_ice_candidate", onIceCandidate);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
    };
  }, [socket, playSound, stopRingtone, drainIceCandidates, resetCallState]);

  // Clean up on unmount
  useEffect(() => () => resetCallState(), [resetCallState]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (callState === "idle") return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 9999, background: "rgba(10, 15, 30, 0.92)", backdropFilter: "blur(8px)" }}
    >
      {/* ── INCOMING CALL MODAL ── */}
      {callState === "incoming" && (
        <div
          className="card border-0 rounded-4 shadow-lg text-center p-4 bg-white"
          style={{ minWidth: 320, maxWidth: 380 }}
        >
          <div className="position-relative d-inline-block mx-auto mb-3">
            <img
              src={avatarFor(remoteUser?.name, remoteUser?.photo)}
              alt=""
              className="rounded-circle border border-3 border-primary shadow"
              style={{ width: 88, height: 88, objectFit: "cover" }}
            />
            <span
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white p-2"
              title="Online"
            />
          </div>

          <h5 className="fw-bold mb-1 text-dark">{remoteUser?.name || "Founder"}</h5>
          <p className="text-secondary small mb-4">
            Incoming {callType === "audio" ? "Voice" : "Video"} Call…
          </p>

          <div className="d-flex justify-content-center gap-4">
            <button
              type="button"
              onClick={rejectCall}
              className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: 64, height: 64 }}
              title="Decline"
            >
              <i className="bi bi-telephone-x-fill fs-4" />
            </button>
            <button
              type="button"
              onClick={acceptCall}
              className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: 64, height: 64 }}
              title="Accept Call"
            >
              <i className={`bi bi-${callType === "audio" ? "telephone-fill" : "camera-video-fill"} fs-4`} />
            </button>
          </div>
        </div>
      )}

      {/* ── OUTGOING / CALLING SCREEN ── */}
      {callState === "calling" && (
        <div
          className="card border-0 rounded-4 shadow-lg text-center p-4 bg-white"
          style={{ minWidth: 320, maxWidth: 380 }}
        >
          <div className="position-relative d-inline-block mx-auto mb-3">
            <img
              src={avatarFor(remoteUser?.name, remoteUser?.photo)}
              alt=""
              className="rounded-circle border border-3 border-primary shadow"
              style={{ width: 88, height: 88, objectFit: "cover" }}
            />
          </div>

          <h5 className="fw-bold mb-1 text-dark">{remoteUser?.name || "Founder"}</h5>
          <p className="text-secondary small mb-4">
            <span className="spinner-grow spinner-grow-sm text-primary me-2" role="status" />
            Calling {callType === "audio" ? "Voice" : "Video"}…
          </p>

          <button
            type="button"
            onClick={endCall}
            className="btn btn-danger rounded-circle mx-auto d-flex align-items-center justify-content-center shadow"
            style={{ width: 64, height: 64 }}
            title="Cancel Call"
          >
            <i className="bi bi-telephone-x-fill fs-4" />
          </button>
        </div>
      )}

      {/* ── ACTIVE CALL SCREEN ── */}
      {callState === "active" && (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            width: isFullscreen ? "100vw" : 720,
            maxWidth: "96vw",
            height: isFullscreen ? "100vh" : "auto",
          }}
        >
          {/* Main Stage (Remote Video / Audio Avatar) */}
          <div
            className="position-relative rounded-4 overflow-hidden bg-black shadow-lg w-100"
            style={{ aspectRatio: "16/9", maxHeight: isFullscreen ? "82vh" : "60vh" }}
          >
            {callType === "video" ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-100 h-100"
                style={{ objectFit: "cover", background: "#000" }}
              />
            ) : (
              <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white">
                <audio ref={remoteVideoRef} autoPlay playsInline />
                <img
                  src={avatarFor(remoteUser?.name, remoteUser?.photo)}
                  alt=""
                  className="rounded-circle border border-3 border-primary mb-3 shadow"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
                <h5 className="fw-bold mb-1">{remoteUser?.name}</h5>
                <span className="badge bg-success-subtle text-success">Voice Call Connected</span>
              </div>
            )}

            {/* Remote Name & Status Overlay */}
            <div className="position-absolute top-0 start-0 p-3 d-flex align-items-center gap-2">
              <img
                src={avatarFor(remoteUser?.name, remoteUser?.photo)}
                alt=""
                className="rounded-circle border border-white"
                style={{ width: 34, height: 34, objectFit: "cover" }}
              />
              <span className="text-white fw-semibold small text-shadow">{remoteUser?.name}</span>
            </div>

            {/* Call Duration */}
            <div className="position-absolute top-0 end-0 p-3">
              <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill font-monospace">
                <i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: 8 }} />
                {formatDuration(callDuration)}
              </span>
            </div>

            {/* Local PiP (Picture-in-Picture) for Video Calls */}
            {callType === "video" && (
              <div
                className="position-absolute bottom-0 end-0 m-3 rounded-3 overflow-hidden border border-2 border-white shadow-lg"
                style={{ width: 140, aspectRatio: "4/3", zIndex: 10 }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-100 h-100"
                  style={{ objectFit: "cover", transform: "scaleX(-1)", background: "#111" }}
                />
                {isCameraOff && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                    <i className="bi bi-camera-video-off text-white fs-5" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Call Controls Bar */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3 p-2 bg-dark bg-opacity-75 rounded-pill shadow-lg border border-secondary border-opacity-25">
            {/* Mute Microphone */}
            <button
              type="button"
              onClick={toggleMute}
              className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${isMuted ? "btn-danger" : "btn-secondary"}`}
              style={{ width: 52, height: 52 }}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              <i className={`bi bi-${isMuted ? "mic-mute-fill" : "mic-fill"} fs-5`} />
            </button>

            {/* Camera Toggle (Video Call Only) */}
            {callType === "video" && (
              <button
                type="button"
                onClick={toggleCamera}
                className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${isCameraOff ? "btn-danger" : "btn-secondary"}`}
                style={{ width: 52, height: 52 }}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                <i className={`bi bi-${isCameraOff ? "camera-video-off-fill" : "camera-video-fill"} fs-5`} />
              </button>
            )}

            {/* Speaker / Audio Output Toggle & Selector */}
            <div className="position-relative">
              <button
                type="button"
                onClick={audioOutputDevices.length > 1 ? () => setShowSpeakerMenu((s) => !s) : toggleSpeaker}
                className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${isSpeakerMuted ? "btn-danger" : "btn-secondary"}`}
                style={{ width: 52, height: 52 }}
                title={isSpeakerMuted ? "Unmute Speaker" : "Speaker Options"}
              >
                <i className={`bi bi-${isSpeakerMuted ? "volume-mute-fill" : "volume-up-fill"} fs-5`} />
              </button>

              {/* Speaker Device Selector Dropdown */}
              {showSpeakerMenu && (
                <div
                  className="position-absolute bottom-100 start-50 translate-middle-x mb-2 p-2 bg-dark rounded-3 shadow-lg border border-secondary text-nowrap"
                  style={{ zIndex: 100, minWidth: 200 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 px-2 border-bottom border-secondary pb-1">
                    <span className="small fw-bold text-white">Speaker Options</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
                      onClick={() => setShowSpeakerMenu(false)}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  {/* Toggle Mute Output */}
                  <button
                    type="button"
                    onClick={toggleSpeaker}
                    className={`btn btn-sm w-100 text-start mb-2 d-flex align-items-center gap-2 ${isSpeakerMuted ? "btn-danger" : "btn-outline-light"}`}
                  >
                    <i className={`bi bi-${isSpeakerMuted ? "volume-mute-fill" : "volume-up-fill"}`} />
                    <span>{isSpeakerMuted ? "Unmute Sound" : "Mute Sound"}</span>
                  </button>

                  {/* Available Output Devices */}
                  {audioOutputDevices.length > 0 && (
                    <div className="d-flex flex-column gap-1">
                      <div className="text-secondary" style={{ fontSize: 10 }}>OUTPUT DEVICE</div>
                      {audioOutputDevices.map((device, idx) => (
                        <button
                          key={device.deviceId || idx}
                          type="button"
                          onClick={() => changeAudioOutput(device.deviceId)}
                          className={`btn btn-sm text-start py-1 px-2 d-flex align-items-center justify-content-between ${selectedSinkId === device.deviceId ? "btn-primary" : "btn-dark text-white"}`}
                          style={{ fontSize: 12 }}
                        >
                          <span className="text-truncate" style={{ maxWidth: 180 }}>
                            {device.label || `Speaker ${idx + 1}`}
                          </span>
                          {selectedSinkId === device.deviceId && <i className="bi bi-check2" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="btn btn-secondary rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: 52, height: 52 }}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <i className={`bi bi-${isFullscreen ? "fullscreen-exit" : "fullscreen"} fs-5`} />
            </button>

            {/* Hang Up Button */}
            <button
              type="button"
              onClick={endCall}
              className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: 56, height: 56 }}
              title="End Call"
            >
              <i className="bi bi-telephone-x-fill fs-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoCallManager;
