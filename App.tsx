
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, QrCode, User as UserIcon, Wallet, ShieldCheck, 
  MapPin, Activity, Award, Bell, Menu, X, CheckCircle, AlertTriangle, 
  ChevronRight, RefreshCw, Smartphone, Copy, ScanFace, Zap, Download, Share2,
  CreditCard, Settings, LogOut, HelpCircle, Fingerprint, Plus, Navigation, Clock
} from 'lucide-react';
import { 
  AnimatePresence, motion, useAnimation, useMotionValue, useTransform 
} from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { CLASSES, CURRENT_USER, MOCK_NOTIFICATIONS, MOCK_BLOCKS, NAV_ITEMS, getDistanceFromLatLonInM } from './constants';
import { User, Role, ScanStep, ClassSession, AttendanceRecord } from './types';

// --- Shared Components ---

const GlassCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  variant?: 'default' | 'neon';
}> = ({ children, className = '', onClick, variant = 'default' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${className} ${
        variant === 'neon' ? 'shadow-[0_0_15px_rgba(0,224,255,0.15)] border-neon-blue/30' : ''
      }`}
    >
      {variant === 'neon' && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

const NeonButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ children, onClick, variant = 'primary', fullWidth = false, disabled = false, loading = false, className = '' }) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold font-mono tracking-wide transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-neon-blue to-neon-purple text-black shadow-[0_0_20px_rgba(0,224,255,0.4)] hover:shadow-[0_0_30px_rgba(0,224,255,0.6)]",
    secondary: "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700",
    danger: "bg-neon-red/10 text-neon-red border border-neon-red/50 hover:bg-neon-red/20",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
    >
      {loading ? <RefreshCw className="animate-spin" size={20} /> : children}
      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
      )}
    </motion.button>
  );
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    LIVE: "bg-neon-green/10 text-neon-green border-neon-green/30 animate-pulse",
    UPCOMING: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
    COMPLETED: "bg-gray-700/30 text-gray-400 border-gray-600/30",
    FRAUD_FLAG: "bg-neon-red/10 text-neon-red border-neon-red/30",
    PRESENT: "bg-neon-green/10 text-neon-green border-neon-green/30",
    ABSENT: "bg-neon-red/10 text-neon-red border-neon-red/30",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${styles[status] || styles.COMPLETED} flex items-center gap-1`}>
      {status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />}
      {status}
    </span>
  );
};

const NotificationToast: React.FC<{ title: string; message: string; onClose: () => void }> = ({ title, message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.9 }}
    className="fixed top-24 right-4 z-[60] w-80"
  >
    <GlassCard variant="neon" className="flex items-start gap-3 bg-black/90 border-l-4 border-l-neon-blue shadow-2xl">
      <div className="p-2 bg-neon-blue/20 rounded-full text-neon-blue mt-1 shrink-0">
        <Bell size={18} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-white font-mono">{title}</h4>
        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-white shrink-0"><X size={16} /></button>
    </GlassCard>
  </motion.div>
);

const Header: React.FC<{ user: User, toggleRole: () => void }> = ({ user, toggleRole }) => (
  <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-mono font-bold text-black text-xs">
        SX
      </div>
      <h1 className="font-mono font-bold text-lg tracking-tighter">SmartAttend<span className="text-neon-blue">X</span></h1>
    </div>
    
    <div className="flex items-center gap-4">
      <button onClick={toggleRole} className="text-xs font-mono text-neon-blue border border-neon-blue/30 px-2 py-1 rounded bg-neon-blue/5">
        {user.role} VIEW
      </button>
      <div className="relative">
        <Bell size={20} className="text-gray-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-red rounded-full animate-pulse"></span>
      </div>
      <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
    </div>
  </div>
);

// --- Visualizations ---

const MotionWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.08; // Speed of the wave
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Style
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#FFD369'; // Neon Yellow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 211, 105, 0.4)';

      ctx.beginPath();

      // Generate waveform
      for (let x = 0; x <= width; x+=2) {
        // Superposition of sine waves for "natural" motion look
        // Primary wave
        const y1 = Math.sin(x * 0.02 + time * 2) * (height * 0.15);
        // Secondary jitter
        const y2 = Math.sin(x * 0.05 - time * 3) * (height * 0.08);
        // Micro jitter
        const y3 = Math.sin(x * 0.1 + time * 5) * (height * 0.04);
        
        const y = (height / 2) + y1 + y2 + y3;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />;
};

// --- Feature Components ---

const CreateClassModal: React.FC<{ 
  onClose: () => void; 
  onCreate: (cls: Partial<ClassSession>) => void; 
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [radius, setRadius] = useState(30);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const getMyLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLoc(false);
        },
        (error) => {
          console.error(error);
          setLoadingLoc(false);
          alert("Could not fetch location. Using mock default.");
          setCoords({ lat: 17.4486, lng: 78.3912 }); // Fallback
        }
      );
    }
  };

  const handleSubmit = () => {
    if (!title || !code || !coords) return;
    onCreate({
      title,
      code,
      location: `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`,
      lat: coords.lat,
      lng: coords.lng,
      radius,
      status: 'LIVE',
      time: timeRange || 'Just Started'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="glass-panel w-full max-w-md rounded-2xl p-6 bg-[#0a0a0a] border-neon-blue/20 shadow-[0_0_50px_rgba(0,224,255,0.1)]">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold font-mono">Create New Class</h2>
           <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
         </div>

         <div className="space-y-4">
           <div>
             <label className="text-xs text-gray-400 uppercase font-mono block mb-1">Class Title</label>
             <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none" placeholder="e.g. Physics 101" />
           </div>
           
           <div>
             <label className="text-xs text-gray-400 uppercase font-mono block mb-1">Subject Code</label>
             <input value={code} onChange={e => setCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none" placeholder="e.g. PHY-101" />
           </div>

           <div>
             <label className="text-xs text-gray-400 uppercase font-mono block mb-1">Time Range</label>
             <input value={timeRange} onChange={e => setTimeRange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none" placeholder="e.g. 10:00 AM - 11:30 AM" />
           </div>

           <div>
             <label className="text-xs text-gray-400 uppercase font-mono block mb-1">Geofence Radius (meters)</label>
             <div className="flex items-center gap-4">
                <input type="range" min="10" max="100" value={radius} onChange={e => setRadius(Number(e.target.value))} className="flex-1 accent-neon-blue" />
                <span className="font-mono text-neon-blue">{radius}m</span>
             </div>
           </div>

           <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
             <div className="flex justify-between items-center">
               <span className="text-sm font-bold flex items-center gap-2"><MapPin size={16} className="text-neon-purple"/> Class Location</span>
               {coords && <span className="text-xs text-neon-green flex items-center gap-1"><CheckCircle size={10} /> Set</span>}
             </div>
             {coords ? (
               <p className="text-[10px] font-mono text-gray-400">Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}</p>
             ) : (
               <p className="text-[10px] text-gray-500">Location required for student validation.</p>
             )}
             <NeonButton variant="secondary" onClick={getMyLocation} loading={loadingLoc} className="text-xs py-2 mt-2">
                {coords ? 'Update Location' : 'Get Current Location'}
             </NeonButton>
           </div>

           <NeonButton fullWidth onClick={handleSubmit} disabled={!title || !code || !coords} className="mt-4">
             Create & Go Live
           </NeonButton>
         </div>
       </div>
    </div>
  );
};

const QRCodeModal: React.FC<{ 
  session: { title: string; code: string }; 
  onClose: () => void; 
}> = ({ session, onClose }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(session.code)}&bgcolor=111111&color=00e0ff&margin=10`;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="glass-panel rounded-3xl p-8 w-full max-w-sm bg-[#0a0a0a] border border-white/10 relative shadow-[0_0_50px_rgba(0,224,255,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
        
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold font-mono text-white tracking-tight">{session.title}</h3>
          <div className="inline-block mt-2 px-3 py-1 rounded bg-neon-blue/10 border border-neon-blue/30">
            <p className="text-neon-blue font-mono text-sm tracking-widest">{session.code}</p>
          </div>
        </div>

        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue to-neon-purple blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="bg-black p-4 rounded-2xl mx-auto w-fit relative border border-white/10 shadow-2xl">
            <img src={qrUrl} alt="Class QR Code" className="w-56 h-56 rounded-lg" />
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-blue -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-blue translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-blue -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-blue translate-x-1 translate-y-1" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ScannerOverlay: React.FC<{ 
  onClose: () => void; 
  onComplete: (success: boolean) => void;
  session: ClassSession; 
}> = ({ onClose, onComplete, session }) => {
  const [step, setStep] = useState<ScanStep>(ScanStep.GPS);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    let mounted = true;
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      
      // Step 1: GPS Validation
      if (step === ScanStep.GPS) {
        addLog("Acquiring Satellite Lock...");
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!mounted) return;
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            // Check if class has coordinates
            const classLat = session.lat || 17.4486; // Default fallback for demo
            const classLng = session.lng || 78.3912;
            const allowedRadius = session.radius || 50;

            const dist = getDistanceFromLatLonInM(userLat, userLng, classLat, classLng);
            
            addLog(`Loc: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
            addLog(`Distance to Class: ${dist.toFixed(1)}m`);

            if (dist <= allowedRadius + 20) { // +20m buffer for GPS accuracy drift
               addLog("Geofence: INSIDE");
               setStep(ScanStep.FACE);
            } else {
               setError(`You are ${dist.toFixed(0)}m away. Move closer.`);
               setStep(ScanStep.FAILED);
            }
          },
          (err) => {
             addLog("GPS Error: " + err.message);
             // For demo purposes, we might want to fail or fallback.
             // Failing for strictness.
             setError("GPS Signal Lost.");
             setStep(ScanStep.FAILED);
          }
        );
      }
    };
    sequence();
    return () => { mounted = false; };
  }, [step]); 

  // Better approach: use useEffect to trigger transitions
  useEffect(() => {
    if (step === ScanStep.FACE) {
      const timer = setTimeout(() => {
        addLog("Biometric Check: PASSED");
        setStep(ScanStep.MOTION);
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (step === ScanStep.MOTION) {
      const timer = setTimeout(() => {
        addLog("Motion Signature: NATURAL");
        setStep(ScanStep.FUSION);
      }, 3500); // Give enough time to enjoy the waveform
      return () => clearTimeout(timer);
    }
    if (step === ScanStep.FUSION) {
       const timer = setTimeout(() => {
        addLog("TRM Consensus: VERIFIED");
        setStep(ScanStep.SUCCESS);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (step === ScanStep.SUCCESS) {
      const timer = setTimeout(() => {
        onComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
    >
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full">
        <X size={24} />
      </button>

      <div className="w-full max-w-sm text-center relative z-10">
        <h2 className="text-2xl font-mono font-bold mb-1">{session.title}</h2>
        <p className="text-gray-400 text-sm mb-8">{session.location}</p>

        {/* Visual Scanner */}
        <div className="relative w-72 h-72 mx-auto mb-8 flex items-center justify-center">
           {/* Rings only animate if not failed */}
          <motion.div 
            animate={step === ScanStep.FAILED ? { rotate: 0, borderColor: '#ff5e7e' } : { rotate: 360 }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 border-2 border-dashed ${step === ScanStep.FAILED ? 'border-neon-red' : 'border-neon-blue/30'} rounded-full`} 
          />
          
          <div className="absolute inset-2 rounded-full overflow-hidden bg-gray-900/80 backdrop-blur border border-white/10 flex items-center justify-center z-10">
            <AnimatePresence mode='wait'>
              {(step === ScanStep.GPS || step === ScanStep.IDLE) && (
                <motion.div key="gps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                   <MapPin className="text-neon-blue animate-bounce" size={48} />
                   <div className="mt-2 text-xs font-mono text-neon-blue">GPS LOCKING</div>
                </motion.div>
              )}
              {step === ScanStep.FACE && (
                <motion.div key="face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
                   <img src="https://picsum.photos/200/200" className="w-full h-full object-cover opacity-50" alt="Face" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-48 h-48 border-2 border-neon-green rounded-full opacity-50"></div>
                   </div>
                   <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-neon-green uppercase font-mono animate-pulse">Camera Active</div>
                   <ScanFace className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neon-green w-16 h-16" />
                   <div className="scanner-line"></div>
                </motion.div>
              )}
              {step === ScanStep.MOTION && (
                <motion.div key="motion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/80">
                   <div className="flex items-center gap-2 mb-2">
                      <Activity className="text-neon-yellow animate-pulse" size={20} />
                      <span className="text-[10px] font-mono text-neon-yellow">ACCELEROMETER</span>
                   </div>
                   
                   <div className="w-full h-32 relative rounded-lg overflow-hidden border border-neon-yellow/20 bg-black/50">
                      {/* Grid Background */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-2">
                         {[...Array(12)].map((_, i) => (
                           <div key={i} className="border border-white/5" />
                         ))}
                      </div>
                      <MotionWaveform />
                   </div>
                   
                   <p className="text-[10px] text-gray-400 mt-3 animate-pulse">Analyzing User Movement...</p>
                </motion.div>
              )}
              {step === ScanStep.SUCCESS && (
                <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                   <ShieldCheck className="text-neon-green" size={80} />
                </motion.div>
              )}
               {step === ScanStep.FAILED && (
                <motion.div key="failed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                   <AlertTriangle className="text-neon-red" size={60} />
                   <span className="text-neon-red font-mono text-sm mt-4">FAILED</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Log */}
        <div className={`h-32 overflow-hidden text-left bg-black/50 p-4 rounded-xl border ${step === ScanStep.FAILED ? 'border-neon-red/50' : 'border-white/10'} font-mono text-[10px] text-gray-400`}>
          {log.map((l, i) => (
            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-1">
              <span className="text-neon-blue">root@smartattend:~$</span> {l}
            </motion.div>
          ))}
          {error && <div className="text-neon-red mt-2">&gt;&gt; ERROR: {error}</div>}
        </div>
        
        {step === ScanStep.FAILED && (
          <NeonButton variant="secondary" onClick={onClose} className="mt-4 w-full">Close & Retry</NeonButton>
        )}
      </div>
    </motion.div>
  );
};

const BlockchainReceipt: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      className="fixed inset-x-0 bottom-0 z-40 bg-gray-900 border-t border-white/20 rounded-t-3xl p-6 pb-12 shadow-2xl"
    >
      <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-mono font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-neon-green" /> Attendance Block
        </h3>
        <button className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-1">Share Proof</button>
      </div>

      <div className="space-y-4">
        <GlassCard className="bg-black/40">
           <div className="flex justify-between text-xs text-gray-400 mb-1">
             <span>Previous Hash</span>
             <span className="font-mono">0x4a...9f</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-xs text-neon-blue font-mono truncate w-4/5">0x712a89c99182d...</span>
             <Copy size={14} className="text-gray-500" />
           </div>
        </GlassCard>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-3">
             <div className="text-xs text-gray-400">Timestamp</div>
             <div className="font-mono text-sm">{new Date().toLocaleTimeString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
             <div className="text-xs text-gray-400">TRM Score</div>
             <div className="font-mono text-sm text-neon-green">98.5%</div>
          </div>
        </div>

        <NeonButton fullWidth onClick={onClose}>Done</NeonButton>
      </div>
    </motion.div>
  );
};

// --- View: Student Screens ---

const StudentHome: React.FC<{ 
  classes: ClassSession[];
  attendanceLogs: AttendanceRecord[];
  onOpenScan: (c: ClassSession) => void 
}> = ({ classes, attendanceLogs, onOpenScan }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [localClasses, setLocalClasses] = useState(classes);

  useEffect(() => {
    setLocalClasses(classes);
  }, [classes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate updating distances
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const updated = localClasses.map(c => {
          if (c.lat && c.lng) {
            const dist = getDistanceFromLatLonInM(pos.coords.latitude, pos.coords.longitude, c.lat, c.lng);
            return { ...c, distance: dist };
          }
          return c;
        });
        setLocalClasses(updated);
        setRefreshing(false);
      }, () => setRefreshing(false));
    } else {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 min-h-screen relative">
      <motion.div 
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
        animate={{ y: refreshing ? 60 : 0, opacity: refreshing ? 1 : 0 }}
      >
        <div className="bg-neon-blue/20 p-2 rounded-full backdrop-blur">
          <RefreshCw className="animate-spin text-neon-blue" size={20} />
        </div>
      </motion.div>

      {/* Pull to refresh trigger area (invisible) */}
      <div 
        className="h-4 absolute top-0 inset-x-0 z-20"
        onTouchEnd={handleRefresh}
      />

      {/* NEW HERO CARD */}
      <GlassCard variant="neon" className="p-6 relative overflow-hidden mb-8">
        {/* Background Gradients */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neon-blue/10 blur-[80px] rounded-full mix-blend-screen" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Today's Status</h3>
              <h1 className="text-3xl font-bold text-white tracking-tight">Hello, {CURRENT_USER.name.split(' ')[0]}</h1>
            </div>
            
            {/* XP Pill */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl group cursor-pointer hover:bg-white/10 transition-colors">
               <Zap size={16} className="text-neon-yellow fill-neon-yellow" />
               <span className="font-bold font-mono text-sm text-white">150 XP</span>
            </div>
          </div>

          {/* Main Stats */}
          <div className="flex items-end justify-between mb-4 px-1">
             <div>
               <div className="text-5xl font-bold text-white tracking-tighter mb-1">87%</div>
               <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Attendance Rate</div>
             </div>
             <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">42</div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Classes Total</div>
             </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '87%' }}
               transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
               className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-purple rounded-full shadow-[0_0_20px_rgba(0,224,255,0.4)]"
             />
          </div>
          <div className="mt-3 text-[10px] text-right text-gray-400 italic font-mono opacity-80">Great consistency this week!</div>
        </div>
        
        {/* Decorative Icon Overlay */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
           <Activity size={180} />
        </div>
      </GlassCard>

      {/* Classes List */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
           <Clock size={20} className="text-neon-blue" />
           <h2 className="text-lg font-bold text-white">Today's Schedule</h2>
           <div className="ml-auto">
             <button onClick={handleRefresh} className="text-xs text-neon-blue flex items-center gap-1 opacity-80 hover:opacity-100">
               <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
             </button>
           </div>
        </div>
        <div className="space-y-4">
          {localClasses.map((cls, idx) => {
            const isPresent = attendanceLogs.some(log => log.className === cls.title && log.status === 'PRESENT');

            return (
              <motion.div 
                key={cls.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="relative overflow-visible">
                  {cls.status === 'LIVE' && !isPresent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{cls.title}</h3>
                      <p className="text-xs text-gray-400 font-mono">{cls.code} • {cls.location}</p>
                      {cls.distance !== undefined && (
                        <p className={`text-[10px] font-mono mt-1 ${cls.distance < (cls.radius || 50) ? 'text-neon-green' : 'text-gray-500'}`}>
                          Distance: {cls.distance.toFixed(0)}m
                        </p>
                      )}
                    </div>
                    <StatusChip status={isPresent ? 'PRESENT' : cls.status} />
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">DA</div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300">{cls.teacher}</p>
                      <p className="text-[10px] text-gray-500">{cls.time}</p>
                    </div>
                    {isPresent ? (
                      <NeonButton disabled variant="secondary" className="px-4 py-2 text-xs opacity-50">
                        <CheckCircle size={14} /> Verified
                      </NeonButton>
                    ) : cls.status === 'LIVE' ? (
                       <NeonButton onClick={() => onOpenScan(cls)} className="px-4 py-2 text-xs">
                         Smart Scan
                       </NeonButton>
                    ) : (
                      <button className="text-gray-500 text-xs px-4 py-2 border border-white/10 rounded-lg">Details</button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          {localClasses.length === 0 && <p className="text-gray-500 text-center text-sm">No classes scheduled.</p>}
        </div>
      </div>
    </div>
  );
};

const WalletView: React.FC = () => (
  <div className="pt-6 px-4 pb-24 space-y-6">
    <GlassCard variant="neon" className="relative overflow-hidden h-48 flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={100} /></div>
      <div>
        <h3 className="text-gray-300 font-mono text-sm">Smart Token Balance</h3>
        <h1 className="text-4xl font-bold mt-2">1,240 <span className="text-lg text-neon-blue">STX</span></h1>
      </div>
      <div className="flex gap-3">
        <NeonButton className="flex-1 text-xs py-2">Redeem</NeonButton>
        <NeonButton variant="secondary" className="flex-1 text-xs py-2">History</NeonButton>
      </div>
    </GlassCard>
    
    <div>
      <h3 className="font-bold mb-4">Recent Rewards</h3>
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <GlassCard key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green"><Award size={18} /></div>
              <div>
                <div className="font-bold text-sm">Perfect Week Streak</div>
                <div className="text-[10px] text-gray-400">Automated Reward</div>
              </div>
            </div>
            <span className="text-neon-green font-mono font-bold">+50 STX</span>
          </GlassCard>
        ))}
      </div>
    </div>
  </div>
);

const ProfileView: React.FC = () => (
  <div className="pt-6 px-4 pb-24 space-y-6">
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full border-2 border-neon-blue p-1 mb-4">
        <img src={CURRENT_USER.avatar} className="w-full h-full rounded-full object-cover" alt="Avatar" />
      </div>
      <h2 className="text-xl font-bold">{CURRENT_USER.name}</h2>
      <p className="text-gray-400 text-sm font-mono">ID: 2024-CS-042</p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <GlassCard className="text-center">
        <div className="text-2xl font-bold text-neon-blue">94%</div>
        <div className="text-[10px] text-gray-400">Attendance</div>
      </GlassCard>
      <GlassCard className="text-center">
        <div className="text-2xl font-bold text-neon-purple">4.8</div>
        <div className="text-[10px] text-gray-400">Reputation</div>
      </GlassCard>
    </div>

    <div className="space-y-2">
      <GlassCard className="flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Settings size={18} className="text-gray-400" />
           <span className="text-sm">Account Settings</span>
         </div>
         <ChevronRight size={16} className="text-gray-500" />
      </GlassCard>
      <GlassCard className="flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Fingerprint size={18} className="text-gray-400" />
           <span className="text-sm">Biometric Data</span>
         </div>
         <ChevronRight size={16} className="text-gray-500" />
      </GlassCard>
       <GlassCard className="flex items-center justify-between border-neon-red/30 bg-neon-red/5">
         <div className="flex items-center gap-3">
           <LogOut size={18} className="text-neon-red" />
           <span className="text-sm text-neon-red">Log Out</span>
         </div>
      </GlassCard>
    </div>
  </div>
);

const ScanHub: React.FC<{ classes: ClassSession[]; onOpenScan: (c: ClassSession) => void }> = ({ classes, onOpenScan }) => {
  const targetClass = classes.find(c => c.status === 'LIVE');

  return (
   <div className="pt-6 px-4 pb-24 h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className={`relative group cursor-pointer ${!targetClass ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => targetClass && onOpenScan(targetClass)}>
        <div className="absolute inset-0 bg-neon-blue/20 blur-xl rounded-full animate-pulse" />
        <div className="w-48 h-48 bg-black border-2 border-neon-blue rounded-full flex items-center justify-center relative z-10 transition-transform active:scale-95">
           <QrCode size={64} className="text-white" />
        </div>
        <div className="absolute inset-0 border border-dashed border-white/20 rounded-full animate-spin-slow" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">Tap to Scan</h2>
        {targetClass ? (
          <div className="mt-2">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Active Session</span>
            <p className="text-neon-blue font-bold text-lg font-mono">{targetClass.title}</p>
            <p className="text-xs text-gray-500">{targetClass.code} • {targetClass.location}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm mt-2">No active class session detected nearby.</p>
        )}
      </div>

      <div className="flex gap-4">
        <button disabled={!targetClass} onClick={() => targetClass && onOpenScan(targetClass)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 w-24 border border-white/5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
           <Smartphone size={24} className="text-neon-purple" />
           <span className="text-[10px]">NFC</span>
        </button>
        <button disabled={!targetClass} onClick={() => targetClass && onOpenScan(targetClass)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 w-24 border border-white/5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
           <MapPin size={24} className="text-neon-green" />
           <span className="text-[10px]">Manual Geo</span>
        </button>
      </div>
   </div>
  );
};

// --- View: Teacher Dashboard ---

const TeacherDashboard: React.FC<{
  classes: ClassSession[];
  attendanceLogs: AttendanceRecord[];
  onCreateClass: (cls: Partial<ClassSession>) => void;
  onTestNotification: () => void;
}> = ({ classes, attendanceLogs, onCreateClass, onTestNotification }) => {
  const [showQR, setShowQR] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const activeClasses = classes.filter(c => c.status === 'LIVE');
  const recentLogs = attendanceLogs.slice(0, 5); // Show last 5

  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="bg-neon-blue/10 border-neon-blue/20">
          <div className="text-3xl font-bold text-neon-blue">92%</div>
          <div className="text-xs text-gray-300">Avg Attendance</div>
        </GlassCard>
        <GlassCard className="bg-neon-red/10 border-neon-red/20">
          <div className="text-3xl font-bold text-neon-red">3</div>
          <div className="text-xs text-gray-300">Fraud Flags</div>
        </GlassCard>
      </div>

      <NeonButton fullWidth onClick={() => setShowCreate(true)} className="flex items-center gap-2">
         <Plus size={20} /> Create New Class
      </NeonButton>

      {/* Active Sessions List */}
      <div>
        <h3 className="font-bold mb-3">Live Sessions</h3>
        {activeClasses.length > 0 ? activeClasses.map(cls => (
          <div key={cls.id} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-neon-green">{cls.title} ({cls.code})</span>
              <button 
                onClick={() => setShowQR(true)}
                className="p-1.5 bg-neon-blue/10 text-neon-blue rounded border border-neon-blue/30"
              >
                <QrCode size={14} />
              </button>
            </div>
            
            <div className="space-y-2">
               {attendanceLogs.filter(l => l.className === cls.title).map((log, i) => (
                  <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <GlassCard className="flex items-center justify-between py-2 px-3">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">ST</div>
                         <div className="text-xs">{log.studentName}</div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neon-green">VERIFIED</span>
                          <CheckCircle size={12} className="text-neon-green"/>
                       </div>
                    </GlassCard>
                  </motion.div>
               ))}
               {attendanceLogs.filter(l => l.className === cls.title).length === 0 && (
                 <div className="text-xs text-gray-500 italic p-2">Waiting for students to join...</div>
               )}
            </div>
          </div>
        )) : (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-gray-500 text-sm">
            No live classes running. Create one to start.
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
          <Settings size={16} /> Console Settings
        </h3>
        <GlassCard className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-lg">
               <Bell size={20} className="text-neon-yellow" />
             </div>
             <div>
               <div className="font-bold text-sm">Test Notifications</div>
               <div className="text-[10px] text-gray-400">Trigger a simulated push alert</div>
             </div>
           </div>
           <NeonButton variant="secondary" onClick={onTestNotification} className="py-2 px-4 text-xs">
             Test Send
           </NeonButton>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showQR && activeClasses[0] && (
          <QRCodeModal 
            session={{ title: activeClasses[0].title, code: activeClasses[0].code }} 
            onClose={() => setShowQR(false)} 
          />
        )}
        {showCreate && (
          <CreateClassModal onClose={() => setShowCreate(false)} onCreate={onCreateClass} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- View: Parent View ---

const ParentView: React.FC<{ attendanceLogs: AttendanceRecord[] }> = ({ attendanceLogs }) => {
  const presentCount = attendanceLogs.filter(l => l.status === 'PRESENT').length;

  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      <div className="text-center py-6">
        <div className="relative inline-block">
          <img src="https://picsum.photos/200/200" className="w-24 h-24 rounded-full border-4 border-neon-purple p-1" alt="Child" />
          <div className="absolute bottom-0 right-0 bg-neon-green text-black text-xs font-bold px-2 py-0.5 rounded-full">On Campus</div>
        </div>
        <h2 className="text-xl font-bold mt-3">Rohith Kumar</h2>
        <p className="text-gray-400 text-sm">B.Tech CS • 3rd Year</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center py-6">
          <div className="text-4xl font-bold text-white mb-1">{2 - (presentCount > 0 ? 1 : 0)}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Absent</div>
        </GlassCard>
        <GlassCard className="text-center py-6">
          <div className="text-4xl font-bold text-neon-green mb-1">{90 + (presentCount * 2)}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Punctuality</div>
        </GlassCard>
      </div>

      <div>
        <h3 className="font-bold mb-4">Activity Feed</h3>
        <div className="space-y-4">
          {attendanceLogs.length > 0 ? attendanceLogs.map((log, i) => (
             <GlassCard key={i} className="flex gap-4">
               <div className="mt-1 p-2 rounded-lg bg-neon-green/20 text-neon-green">
                 <CheckCircle size={16} />
               </div>
               <div>
                 <h4 className="text-sm font-bold">Attendance Marked</h4>
                 <p className="text-xs text-gray-400 mt-1 leading-relaxed">Verified present for {log.className}</p>
                 <span className="text-[10px] text-gray-500 mt-2 block">{new Date(log.timestamp).toLocaleTimeString()}</span>
               </div>
             </GlassCard>
          )) : (
            <div className="text-center text-gray-500 text-xs py-4">No activity today.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('STUDENT');
  const [activeTab, setActiveTab] = useState('home');
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);

  // Global State
  const [allClasses, setAllClasses] = useState<ClassSession[]>(CLASSES);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  // Fake Loading Screen
  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const handleRoleToggle = () => {
    if (role === 'STUDENT') setRole('TEACHER');
    else if (role === 'TEACHER') setRole('PARENT');
    else setRole('STUDENT');
  };

  const handleCreateClass = (newClass: Partial<ClassSession>) => {
    const cls: ClassSession = {
      id: `c${Date.now()}`,
      title: newClass.title || 'New Class',
      code: newClass.code || 'UNK-00',
      time: newClass.time || 'Now',
      location: newClass.location || 'Unknown',
      teacher: 'You (Dr. Abdul)',
      status: 'LIVE',
      distance: 0,
      lat: newClass.lat,
      lng: newClass.lng,
      radius: newClass.radius,
      attendanceCount: 0
    };
    setAllClasses(prev => [cls, ...prev]);
  };

  const handleMarkAttendance = (success: boolean) => {
    if (success && activeSession) {
      setActiveSession(null);
      setShowReceipt(true);
      
      // Update logs
      const newLog: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentName: CURRENT_USER.name,
        className: activeSession.title,
        timestamp: new Date().toISOString(),
        status: 'PRESENT',
        confidenceScore: 0.98,
        hash: '0x' + Math.random().toString(16).substr(2, 10)
      };
      setAttendanceLogs(prev => [newLog, ...prev]);
    }
  };

  const handleTestNotification = () => {
    setNotification({
      title: 'Test Alert',
      message: 'This is a sample notification to verify system connectivity.'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full mb-4"
           />
           <h1 className="text-2xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
             SMARTATTEND<span className="text-white">X</span>
           </h1>
        </div>
      </div>
    );
  }

  const renderStudentContent = () => {
    switch (activeTab) {
      case 'home': return <StudentHome classes={allClasses} attendanceLogs={attendanceLogs} onOpenScan={setActiveSession} />;
      case 'scan': return <ScanHub classes={allClasses} onOpenScan={setActiveSession} />;
      case 'wallet': return <WalletView />;
      case 'profile': return <ProfileView />;
      default: return <StudentHome classes={allClasses} attendanceLogs={attendanceLogs} onOpenScan={setActiveSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neon-blue/30 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-96 bg-neon-blue/10 blur-[100px] pointer-events-none rounded-full -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-full h-96 bg-neon-purple/10 blur-[100px] pointer-events-none rounded-full translate-y-1/2"></div>

      <Header user={{...CURRENT_USER, role}} toggleRole={handleRoleToggle} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${activeTab}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {role === 'STUDENT' ? renderStudentContent() : 
             role === 'TEACHER' ? <TeacherDashboard 
                                     classes={allClasses} 
                                     attendanceLogs={attendanceLogs} 
                                     onCreateClass={handleCreateClass} 
                                     onTestNotification={handleTestNotification}
                                   /> : 
             <ParentView attendanceLogs={attendanceLogs} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation (Only relevant for Student usually, but keeping generic for demo) */}
      {role === 'STUDENT' && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
          <div className="flex justify-around items-center p-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 transition-colors duration-200 ${
                  activeTab === item.id ? 'text-neon-blue' : 'text-gray-500'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${activeTab === item.id ? 'bg-neon-blue/10 translate-y-[-4px]' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      <AnimatePresence>
        {activeSession && (
          <ScannerOverlay 
            session={activeSession} 
            onClose={() => setActiveSession(null)} 
            onComplete={handleMarkAttendance} 
          />
        )}
        {showReceipt && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
              onClick={() => setShowReceipt(false)}
            />
            <BlockchainReceipt onClose={() => setShowReceipt(false)} />
          </>
        )}
        {notification && (
          <NotificationToast 
            title={notification.title} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
