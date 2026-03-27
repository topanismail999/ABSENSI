import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Unlock, ShieldCheck, AlertCircle, Clock } from "lucide-react";

const supabase = createClient("URL_SUPABASE", "KEY_SUPABASE");

export default function AttendanceApp() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAbsen = async () => {
    const { data: user } = await supabase.from("employees").select("*").eq("unique_code", code).single();
    
    if (!user) {
      setStatus({ type: "error", msg: "KODE TIDAK VALID" });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    // Logic Jam Kerja (Bisa diatur di Admin)
    const shiftStart = user.shift === "Siang" ? "08:00" : "20:00";
    const shiftEnd = user.shift === "Siang" ? "17:00" : "05:00";

    const { data: log } = await supabase.from("attendance_logs").select("*").eq("employee_id", user.employee_id).eq("date", today).single();

    if (!log) {
      const isLate = currentTime > shiftStart;
      await supabase.from("attendance_logs").insert([{ employee_id: user.employee_id, clock_in: currentTime, is_late: isLate, shift: user.shift }]);
      setStatus({ type: "success", msg: `MASUK: ${user.name}`, detail: isLate ? "TERLAMBAT" : "TEPAT WAKTU" });
    } else if (!log.clock_out) {
      const isEarly = currentTime < shiftEnd;
      await supabase.from("attendance_logs").update({ clock_out: currentTime, is_early_out: isEarly }).eq("id", log.id);
      setStatus({ type: "success", msg: `PULANG: ${user.name}`, detail: isEarly ? "PULANG AWAL" : "SELESAI" });
    } else {
      setStatus({ type: "error", msg: "SUDAH ABSEN HARI INI" });
    }
    setCode("");
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full"></div>
      
      {/* Clock Display */}
      <div className="mb-12 text-center z-10">
        <h2 className="text-6xl font-black tracking-tighter mb-2">{time.toLocaleTimeString('it-IT')}</h2>
        <p className="text-red-500 font-bold tracking-[0.4em] uppercase text-[10px]">{time.toDateString()}</p>
      </div>

      <div className="w-full max-w-md p-1 bg-gradient-to-b from-red-600 to-transparent rounded-[3.5rem] z-10 shadow-2xl">
        <div className="bg-[#0f0f0f] rounded-[3.4rem] p-12 text-center relative overflow-hidden">
          {status && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-xl animate-in fade-in zoom-in duration-300 ${status.type === 'success' ? 'bg-emerald-600/90' : 'bg-red-600/90'}`}>
               {status.type === 'success' ? <ShieldCheck size={80} /> : <AlertCircle size={80} />}
               <h3 className="text-2xl font-black mt-4 uppercase tracking-tighter">{status.msg}</h3>
               <p className="font-bold text-[10px] tracking-widest mt-1 opacity-80">{status.detail}</p>
            </div>
          )}

          <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-8 flex items-center justify-center text-3xl font-black italic">B</div>
          <h1 className="text-xl font-black tracking-widest uppercase mb-10">Employee <span className="text-red-600 text-shadow-glow">Access</span></h1>
          
          <input 
            type="password" value={code} maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAbsen()}
            className="w-full bg-black/50 border-2 border-white/5 rounded-3xl py-6 text-center text-4xl font-black tracking-[0.8em] text-red-500 focus:border-red-600 transition-all outline-none"
            placeholder="••••••"
          />
          
          <button onClick={handleAbsen} className="w-full mt-8 bg-white text-black py-5 rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3">
            <Unlock size={20} /> Verify Identity
          </button>
        </div>
      </div>
      
      <p className="mt-10 text-white/20 text-[8px] font-bold tracking-[0.5em] uppercase">Buymore Strategic Human Capital System v2.0</p>
    </div>
  );
}
