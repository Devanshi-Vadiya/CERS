import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FaceScannerProps {
    onScanSuccess: (descriptor: Float32Array) => void;
    onCancel: () => void;
    mode: 'register' | 'login';
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onScanSuccess, onCancel, mode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [status, setStatus] = useState<string>('Loading AI models...');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let active = true;
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);
                if (active) {
                    setIsModelLoaded(true);
                    setStatus('Models loaded. Accessing camera...');
                    startVideo();
                }
            } catch (e) {
                console.error("Failed to load models", e);
                if (active) setStatus('Error loading AI models.');
            }
        };
        loadModels();

        return () => {
            active = false;
            stopVideo();
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setStatus('Ready. Positioning face...');
            })
            .catch((err) => {
                console.error("Camera error", err);
                setStatus("Could not access camera.");
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const scanFace = async () => {
        if (!videoRef.current) return;
        setIsScanning(true);
        setStatus('Scanning...');

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                setStatus('Face detected successfully!');
                stopVideo();
                onScanSuccess(detection.descriptor);
            } else {
                setStatus('No face detected. Please try again.');
                setIsScanning(false);
            }
        } catch (e) {
            console.error(e);
            setStatus('Scan failed.');
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-[#2f3640] rounded-3xl border border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-indigo-400 mb-4 font-bold tracking-widest uppercase text-sm">
                <ShieldCheck size={20} />
                {mode === 'login' ? 'Face ID Login' : 'Register Face ID'}
            </div>

            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-6 bg-black flex items-center justify-center">
                {!isModelLoaded ? (
                    <RefreshCw className="animate-spin text-white/50" size={40} />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                )}

                {/* Scan overlay animation */}
                {isScanning && (
                    <div className="absolute inset-0 bg-indigo-500/20 animate-pulse flex items-center justify-center">
                        <div className="w-full h-1 bg-indigo-400 shadow-[0_0_10px_#818cf8] absolute top-1/2 -translate-y-1/2 animate-[scan_1.5s_ease-in-out_infinite]" />
                    </div>
                )}
            </div>

            <p className="text-gray-300 font-medium mb-6 text-center text-sm h-10 flex items-center justify-center">
                {status}
            </p>

            <div className="flex gap-4 w-full">
                <button
                    onClick={() => { stopVideo(); onCancel(); }}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={scanFace}
                    disabled={!isModelLoaded || isScanning}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-indigo-600 rounded-xl font-bold text-white transition-colors flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                    {isScanning ? <RefreshCw className="animate-spin" size={18} /> : <Camera size={18} />}
                    Scan Now
                </button>
            </div>
            {/* Added some global style for the scanner laser inside the component for simplicity */}
            <style>{`
  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
`}</style>
        </div>
    );
};

export default FaceScanner;
