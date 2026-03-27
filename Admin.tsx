import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Filter, AlertTriangle, UserPlus, Clock } from "lucide-react";

const supabase = createClient("URL_SUPABASE", "KEY_SUPABASE");

export default function AdminAttendance() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [filterShift, setFilterShift] = useState("Semua");
  const [settings, setSettings] = useState({ in: "08:00", out: "17:00" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: emp } = await supabase.from("employees").select("*").order("name");
    const { data: att } = await supabase.from("attendance_logs").select("*").order("created_at", { ascending: false });
    if (emp) setEmployees(emp);
    if (att) setLogs(att);
  };

  const getWorstAbsence = () => {
    return employees.map(e => {
      const userLogs = logs.filter(l => l.employee_id === e.employee_id);
      const violations = userLogs.filter(l => l.is_late || l.is_early_out).length;
      return { ...e, violations };
    }).filter(e => e.violations > 0).sort((a, b) => b.violations - a.violations);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Attendance Control</h1>
            <p className="text-red-600 font-bold text-[10px] tracking-[0.3em] uppercase">Admin Command Center</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3 text-xs font-bold">
               <Clock size={16} className="text-red-600"/>
               In: <input type="time" value={settings.in} onChange={e => setSettings({...settings, in: e.target.value})} className="bg-transparent outline-none"/>
               Out: <input type="time" value={settings.out} onChange={e => setSettings({...settings, out: e.target.value})} className="bg-transparent outline-none"/>
            </div>
            <select onChange={(e) => setFilterShift(e.target.value)} className="bg-white px-6 rounded-2xl shadow-sm border font-black text-[10px] uppercase">
               <option>Semua</option><option>Siang</option><option>Malam</option>
            </select>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Section: Pelanggaran Terburuk */}
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl border border-red-100">
             <h3 className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest mb-6">
                <AlertTriangle size={16}/> Warning: Bad Performance Staff
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getWorstAbsence().slice(0, 6).map(e => (
                  <div key={e.id} className="bg-red-50 p-4 rounded-2xl border border-red-100">
                     <p className="font-black text-xs uppercase truncate">{e.name}</p>
                     <p className="text-[10px] font-bold text-red-600 uppercase mt-1">{e.violations} Pelanggaran</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
             <h3 className="font-black text-xs uppercase tracking-widest mb-4">Quick Stats</h3>
             <div className="space-y-4">
                <div className="flex justify-between"><span>Terlambat Hari Ini</span><span className="font-black text-red-500">{logs.filter(l => l.is_late && l.date === new Date().toISOString().split('T')[0]).length}</span></div>
                <div className="flex justify-between"><span>Pulang Awal</span><span className="font-black text-orange-500">{logs.filter(l => l.is_early_out).length}</span></div>
             </div>
          </div>
        </div>

        {/* Section: Tabel Manage Code */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Karyawan</th>
                    <th className="px-8 py-6">Shift</th>
                    <th className="px-8 py-6">Set Unique Code (🔑)</th>
                    <th className="px-8 py-6">Status Log</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {employees.filter(e => filterShift === "Semua" || e.shift === filterShift).map(emp => {
                   const log = logs.find(l => l.employee_id === emp.employee_id && l.date === new Date().toISOString().split('T')[0]);
                   return (
                     <tr key={emp.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-8 py-5">
                           <p className="font-black uppercase text-slate-800">{emp.name}</p>
                           <p className="text-[9px] font-bold text-slate-400">{emp.employee_id}</p>
                        </td>
                        <td className="px-8 py-5">
                           <select 
                             defaultValue={emp.shift}
                             onChange={async (e) => await supabase.from("employees").update({ shift: e.target.value }).eq("id", emp.id)}
                             className="bg-slate-100 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase"
                           >
                             <option>Siang</option><option>Malam</option>
                           </select>
                        </td>
                        <td className="px-8 py-5">
                           <input 
                             placeholder="6 Digit"
                             defaultValue={emp.unique_code}
                             onBlur={async (e) => await supabase.from("employees").update({ unique_code: e.target.value }).eq("id", emp.id)}
                             className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-red-600 font-mono font-black text-sm w-32 focus:ring-2 focus:ring-red-600 outline-none"
                           />
                        </td>
                        <td className="px-8 py-5">
                           {log ? (
                             <div className="flex gap-2">
                               <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${log.is_late ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                 {log.is_late ? "Terlambat" : "Tepat Waktu"}
                               </span>
                               {log.is_early_out && <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[8px] font-black uppercase">Early Out</span>}
                             </div>
                           ) : <span className="text-slate-300 italic text-[10px]">No Log Today</span>}
                        </td>
                     </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
