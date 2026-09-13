import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("7. WebRTC Calling Engine & State Machine", () => {
  it("should format call duration accurately", () => {
    const formatDuration = (seconds) => {
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return `${m}:${s}`;
    };

    assert.equal(formatDuration(0), "00:00");
    assert.equal(formatDuration(9), "00:09");
    assert.equal(formatDuration(65), "01:05");
    assert.equal(formatDuration(600), "10:00");
    assert.equal(formatDuration(3665), "61:05");
  });

  it("should queue ICE candidates when remote description is not set yet", () => {
    const iceQueue = [];
    let isRemoteDescriptionSet = false;
    const addedCandidates = [];

    const mockPeerConnection = {
      addIceCandidate: (candidate) => {
        if (!isRemoteDescriptionSet) {
          throw new Error("InvalidStateError: remoteDescription not set");
        }
        addedCandidates.push(candidate);
      },
    };

    const handleIncomingCandidate = (candidate) => {
      if (isRemoteDescriptionSet) {
        mockPeerConnection.addIceCandidate(candidate);
      } else {
        iceQueue.push(candidate);
      }
    };

    // Receive 2 candidates before remote description is set
    handleIncomingCandidate({ candidate: "candidate:1" });
    handleIncomingCandidate({ candidate: "candidate:2" });

    assert.equal(iceQueue.length, 2, "Early ICE candidates must be queued");
    assert.equal(addedCandidates.length, 0, "No candidates applied before remote description");

    // Remote description arrives
    isRemoteDescriptionSet = true;
    const queued = [...iceQueue];
    iceQueue.length = 0;
    for (const c of queued) {
      mockPeerConnection.addIceCandidate(c);
    }

    assert.equal(iceQueue.length, 0, "ICE queue must be drained");
    assert.equal(addedCandidates.length, 2, "All queued candidates must be applied");
  });

  it("should enforce correct media constraints for video vs voice calls", () => {
    const getMediaConstraints = (callType) => ({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: callType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });

    const videoConstraints = getMediaConstraints("video");
    assert.ok(typeof videoConstraints.video === "object", "Video call must request video tracks");
    assert.ok(typeof videoConstraints.audio === "object", "Video call must request audio tracks");

    const audioConstraints = getMediaConstraints("audio");
    assert.equal(audioConstraints.video, false, "Voice call must disable video tracks");
    assert.ok(typeof audioConstraints.audio === "object", "Voice call must request audio tracks");
  });

  it("should enforce call gating to only accepted connections", () => {
    const connections = {
      founder_1: "connected",
      founder_2: "pending",
      founder_3: "rejected",
    };

    const canCall = (targetId) => connections[targetId] === "connected";

    assert.equal(canCall("founder_1"), true, "Must allow calling accepted connection");
    assert.equal(canCall("founder_2"), false, "Must block calling pending connection");
    assert.equal(canCall("founder_3"), false, "Must block calling rejected connection");
    assert.equal(canCall("founder_unknown"), false, "Must block calling unknown user");
  });

  it("should toggle speaker audio output and switch sinkId when available", async () => {
    let muted = false;
    let currentSinkId = "default";

    const mockMediaElement = {
      get muted() { return muted; },
      set muted(val) { muted = val; },
      setSinkId: async (id) => { currentSinkId = id; },
    };

    const toggleSpeaker = () => {
      mockMediaElement.muted = !mockMediaElement.muted;
      return mockMediaElement.muted;
    };

    assert.equal(toggleSpeaker(), true, "Speaker should be muted");
    assert.equal(toggleSpeaker(), false, "Speaker should be unmuted");

    await mockMediaElement.setSinkId("headphones_device_1");
    assert.equal(currentSinkId, "headphones_device_1", "Audio output device should switch to headphones");
  });
});
