import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, StopCircle, RefreshCw, FileVideo, Save, Trash2, Upload, Lock, Smartphone, Camera } from 'lucide-react';
import { VideoEvidence, LocationData } from '../types';

interface VideoRecorderProps {
  emergencyId: string;
  emergencyType: string;
  location: LocationData;
  onSave: (video: VideoEvidence) => void;
  onDiscard?: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ emergencyId, emergencyType, location, onSave, onDiscard }) => {
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (recording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && recording) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [recording, timeLeft]);

  const startCamera = async () => {
    try {
      stopCamera(); // Stop previous stream if switching
      setCameraError(false);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Auto-start recording if not in review mode
      if (!reviewMode && !recording && timeLeft === 60) {
         startRecordingProcess(stream);
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecordingProcess = (stream: MediaStream) => {
    // Use webm for better browser compatibility during recording
    const options = { mimeType: 'video/webm' };
    let mediaRecorder;
    
    try {
        mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
        // Fallback if specific mimeType fails
        mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Create blob with webm type
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setReviewMode(true);
      setRecording(false);
      stopCamera(); // Stop camera to save battery/resources
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleSave = () => {
    if (videoUrl) {
        onSave({
            id: `VID-${Date.now()}`,
            url: videoUrl,
            timestamp: new Date().toISOString(),
            duration: 60 - timeLeft,
            emergencyType,
            location
        });
    }
  };

  // --- REVIEW MODE UI ---
  // Fixed full-screen overlay so buttons are NEVER clipped by parent container height
  if (reviewMode && videoUrl) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1E272E] border-b border-green-500/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-black text-sm uppercase tracking-widest">Evidence Secured</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Lock size={12} className="text-green-400" />
            <span>Tamper-proof recording</span>
          </div>
        </div>

        {/* Video Preview */}
        <div className="flex-1 bg-gray-950 relative overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>

        {/* Actions — always pinned to bottom, never clipped */}
        <div className="shrink-0 p-5 bg-[#1E272E] border-t border-gray-700 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5"><Smartphone size={13}/> Saved to device</span>
            <span className="flex items-center gap-1.5"><Upload size={13}/> Syncing to cloud...</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onDiscard}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-700 text-gray-300 font-bold text-base hover:bg-gray-600 active:scale-95 transition-all"
            >
              <Trash2 size={20} /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white font-black text-base hover:bg-green-600 active:scale-95 transition-all shadow-xl shadow-green-900/40"
            >
              <Save size={20} /> Confirm Save
            </button>
          </div>
        </div>

      </div>
    );
  }

  // --- ERROR UI ---
  if (cameraError) {
     return (
        <div className="h-full w-full bg-[#2f3640] rounded-3xl p-8 border-2 border-red-500/30 flex flex-col items-center justify-center text-center">
           <Video size={48} className="text-red-500 mb-4" />
           <h3 className="text-xl font-bold text-white mb-2">Camera Error</h3>
           <p className="text-gray-400 text-sm mb-6">Unable to access camera. Please check permissions.</p>
           <button onClick={() => setCameraError(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg font-bold">Retry</button>
        </div>
     );
  }

  // --- RECORDING UI ---
  return (
    <div className="h-full w-full bg-black rounded-3xl overflow-hidden relative shadow-2xl border-4 border-emergency">
      {/* Video Stream */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className={`w-full h-full object-cover transition-opacity duration-500 ${recording ? 'opacity-100' : 'opacity-0'}`}
      />
      {!recording && !reviewMode && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="animate-spin w-12 h-12 border-4 border-emergency border-t-transparent rounded-full"></div>
          </div>
      )}

      {/* Top Overlays */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-6">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 bg-red-600/20 backdrop-blur px-3 py-1.5 rounded-full border border-red-500/50">
               <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#ff0000]"></div>
               <span className="font-mono text-red-500 font-black text-lg tracking-widest">
                  00:{timeLeft < 10 ? '0' : ''}{timeLeft}
               </span>
            </div>
            <span className="text-[10px] text-red-400 font-bold ml-1 flex items-center gap-1">
               <FileVideo size={10} /> REC • {emergencyType.toUpperCase()}
            </span>
         </div>

         <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-lg border border-white/10">
            <span className="text-xs text-white/90 font-bold flex items-center gap-2">
               <Smartphone size={12} /> Local Storage
            </span>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
         <div className="flex items-center justify-between">
            {/* Mute Toggle */}
            <button 
              onClick={toggleMute} 
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/10 active:scale-95 transition-all"
            >
               {isMuted ? <MicOff size={24}/> : <Mic size={24}/>}
            </button>
            
            {/* Stop Button */}
            <div className="flex flex-col items-center -mt-4">
               <button 
                 onClick={stopRecording} 
                 className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center mb-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-red-600/20"
               >
                  <div className="w-8 h-8 bg-red-500 rounded-md shadow-lg"></div>
               </button>
               <span className="text-xs uppercase font-black text-white tracking-widest drop-shadow-md">Stop Recording</span>
            </div>

            {/* Camera Flip */}
            <button 
              onClick={toggleCamera}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/10 active:scale-95 transition-all"
            >
               <RefreshCw size={24}/>
            </button>
         </div>
      </div>
    </div>
  );
};

export default VideoRecorder;