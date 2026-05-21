import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface CallModalProps {
  isOpen: boolean;
  role: "caller" | "receiver";
  callType: "audio" | "video";
  peer: Profile;
  myProfile: Profile | null;
  callRoomId: string;
  onClose: (reason?: string) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function CallModal({
  isOpen,
  role,
  callType,
  peer,
  myProfile,
  callRoomId,
  onClose,
}: CallModalProps) {
  const [status, setStatus] = useState<string>(
    role === "caller" ? "dialing" : "incoming"
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(callType === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize call signaling channel
  useEffect(() => {
    if (!isOpen) return;

    const channelName = `call_room_${callRoomId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channelRef.current = channel;

    channel
      .on("broadcast", { event: "webrtc-offer" }, async ({ payload }) => {
        if (role === "receiver" && pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(payload.offer)
            );
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            channel.send({
              type: "broadcast",
              event: "webrtc-answer",
              payload: { answer },
            });
            setStatus("connected");
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        }
      })
      .on("broadcast", { event: "webrtc-answer" }, async ({ payload }) => {
        if (role === "caller" && pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(payload.answer)
            );
            setStatus("connected");
          } catch (err) {
            console.error("Error handling answer:", err);
          }
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (pcRef.current && payload.candidate) {
          try {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(payload.candidate)
            );
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      })
      .on("broadcast", { event: "call-accepted" }, () => {
        if (role === "caller") {
          setStatus("connecting");
          startWebRTC();
        }
      })
      .on("broadcast", { event: "call-declined" }, () => {
        toast.error(`${peer.display_name} declined the call.`);
        cleanUpAndClose();
      })
      .on("broadcast", { event: "call-ended" }, () => {
        toast.info("Call ended by remote user.");
        cleanUpAndClose();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (role === "caller") {
            // Signal to peer that we are calling them
            // We also send a global notification so their app picks it up
            const notifyChannel = supabase.channel(`calls_${peer.user_id}`, {
              config: { broadcast: { self: false } },
            });
            notifyChannel.subscribe(async (s) => {
              if (s === "SUBSCRIBED") {
                await notifyChannel.send({
                  type: "broadcast",
                  event: "incoming-call",
                  payload: {
                    caller: myProfile,
                    callType,
                    callRoomId,
                  },
                });
                window.setTimeout(() => supabase.removeChannel(notifyChannel), 1200);
              }
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, callRoomId, role]);

  // Clean up WebRTC and media tracks
  const cleanUpAndClose = (reason?: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "call-ended",
        payload: {},
      });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    onClose(reason);
  };

  const handleDecline = async () => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "call-declined",
        payload: {},
      });
    }
    cleanUpAndClose("declined");
  };

  const handleAccept = async () => {
    setStatus("connecting");
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "call-accepted",
        payload: {},
      });
    }
    await startWebRTC();
  };

  // Start Media Stream and WebRTC Connection
  const startWebRTC = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video" ? { facingMode: "user" } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Send ICE candidates to remote peer
      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { candidate: event.candidate },
          });
        }
      };

      // If we are the caller, we initiate the offer
      if (role === "caller") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "webrtc-offer",
            payload: { offer },
          });
        }
      }
    } catch (err: any) {
      console.error("Failed to access media devices:", err);
      toast.error(
        "Could not access camera or microphone. Please check permissions."
      );
      cleanUpAndClose("error");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300 p-4">
      {/* Container Card */}
      <div className="relative flex h-[85vh] max-h-[750px] w-full max-w-[450px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        
        {/* Background visual element for Audio Call */}
        {callType === "audio" && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-background to-background" />
        )}

        {/* Video Elements Layout */}
        {callType === "video" && status === "connected" && (
          <div className="relative flex-1 bg-black">
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />

            {/* Local Video (Floating Mini Screen) */}
            {!isCameraOff && localStream && (
              <div className="absolute bottom-24 right-4 h-36 w-28 overflow-hidden rounded-2xl border-2 border-white/20 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Audio Interface or Ringing/Dialing Interface */}
        {(callType === "audio" || status !== "connected") && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center z-10">
            {/* Caller/Receiver Avatar and Name */}
            <div className="relative mb-6">
              {status === "dialing" || status === "connecting" || status === "incoming" ? (
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000" />
              ) : null}
              {peer.avatar_url ? (
                <img
                  src={peer.avatar_url}
                  alt={peer.display_name}
                  className="relative h-28 w-28 rounded-full border-4 border-border object-cover"
                />
              ) : (
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-grad-indigo text-4xl font-bold text-primary-foreground">
                  {peer.display_name.trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h3 className="font-display text-2xl font-bold text-foreground">
              {peer.display_name}
            </h3>

            {/* Call Status Label */}
            <p className="mt-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {status === "dialing" && "Calling..."}
              {status === "incoming" && `Incoming ${callType} Call`}
              {status === "connecting" && "Connecting..."}
              {status === "connected" && "Active Call"}
            </p>

            {/* Micro animation for ongoing call */}
            {status === "connected" && callType === "audio" && (
              <div className="mt-8 flex gap-1 justify-center items-center h-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="w-1 bg-primary rounded-full animate-bounce"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "0.8s"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons / Controls Area */}
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-md p-6 z-10">
          {status === "incoming" ? (
            /* Incoming call controls (Accept/Decline) */
            <div className="flex justify-around items-center">
              <button
                onClick={handleDecline}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:scale-105 active:scale-95 transition"
                aria-label="Decline Call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
              <button
                onClick={handleAccept}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition animate-pulse"
                aria-label="Accept Call"
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
          ) : (
            /* Active call or Outgoing call controls */
            <div className="flex flex-col gap-4">
              <div className="flex justify-around items-center">
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  disabled={status === "dialing" || status === "connecting"}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                    isMuted
                      ? "bg-destructive border-destructive text-white"
                      : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                  } disabled:opacity-40`}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={() => cleanUpAndClose("ended")}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:scale-105 active:scale-95 transition"
                  aria-label="End Call"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>

                {/* Video Toggle Button */}
                <button
                  onClick={toggleCamera}
                  disabled={callType === "audio" || status !== "connected"}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                    isCameraOff
                      ? "bg-destructive border-destructive text-white"
                      : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                  } disabled:opacity-40`}
                  aria-label={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isCameraOff ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
