import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Flame, Dumbbell, ShieldCheck, Plus, Trash2, 
  RotateCcw, Smartphone, Wallet, BookOpen, Settings, 
  Globe, HardDrive, RefreshCw, GraduationCap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('wisdom');
  const [syncStatus, setSyncStatus] = useState('Idle');

  // --- LIFTED STATE (Required for Global Sync) ---
  const [appsScriptUrl, setAppsScriptUrl] = useState(localStorage.getItem('dh_url') || '');
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('dh_tasks')) || [{ id: 1, time: '05:00 AM', text: 'Wake. Hydrate. Attack.' }]);
  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('dh_todos')) || [{ id: 1, text: 'Review mission critical goals', completed: false }]);
  const [gymStreak, setGymStreak] = useState(Number(localStorage.getItem('dh_streak')) || 0);
  const [weightLogs, setWeightLogs] = useState(JSON.parse(localStorage.getItem('dh_weightLogs')) || []);
  const [habits, setHabits] = useState(JSON.parse(localStorage.getItem('dh_habits')) || [
    { id: 1, name: 'NO PORN / MASTURBATION', daysClean: 0 },
    { id: 2, name: 'FIDELITY', daysClean: 0 },
    { id: 3, name: 'NO JUNK FOOD', daysClean: 0 }
  ]);
  const [screenUsed, setScreenUsed] = useState(Number(localStorage.getItem('dh_screen')) || 0);
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('dh_tx')) || []);
  const [monthlyBudget, setMonthlyBudget] = useState(Number(localStorage.getItem('dh_budget')) || 50000);
  const [studyLogs, setStudyLogs] = useState(JSON.parse(localStorage.getItem('dh_studyLogs')) || []);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('dh_url', appsScriptUrl);
    localStorage.setItem('dh_tasks', JSON.stringify(tasks));
    localStorage.setItem('dh_todos', JSON.stringify(todos));
    localStorage.setItem('dh_streak', gymStreak);
    localStorage.setItem('dh_weightLogs', JSON.stringify(weightLogs));
    localStorage.setItem('dh_habits', JSON.stringify(habits));
    localStorage.setItem('dh_screen', screenUsed);
    localStorage.setItem('dh_tx', JSON.stringify(transactions));
    localStorage.setItem('dh_budget', monthlyBudget);
    localStorage.setItem('dh_studyLogs', JSON.stringify(studyLogs));
  }, [tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget, studyLogs, appsScriptUrl]);

  // --- CLOUD ENGINE ---
  const syncTimeout = useRef(null);

  const triggerSync = () => {
    if (!appsScriptUrl) return;
    setSyncStatus('Syncing...');
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      // All variables included for global payload
      const payload = { tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget, studyLogs };
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'sync', data: payload })
        });
        setSyncStatus('Synced');
      } catch (e) {
        setSyncStatus('Error');
      }
    }, 2000);
  };

  const forcePull = async () => {
    if (!appsScriptUrl) return alert('Set URL first');
    setSyncStatus('Pulling...');
    try {
      const res = await fetch(`${appsScriptUrl}?action=get`);
      const result = await res.json();
      if (result.status === 'success' && result.data) {
        const d = result.data;
        if (d.tasks) setTasks(d.tasks);
        if (d.todos) setTodos(d.todos);
        if (d.gymStreak !== undefined) setGymStreak(d.gymStreak);
        if (d.weightLogs) setWeightLogs(d.weightLogs);
        if (d.habits) setHabits(d.habits);
        if (d.screenUsed !== undefined) setScreenUsed(d.screenUsed);
        if (d.transactions) setTransactions(d.transactions);
        if (d.monthlyBudget !== undefined) setMonthlyBudget(d.monthlyBudget);
        if (d.studyLogs) setStudyLogs(d.studyLogs);
        setSyncStatus('Success');
        alert('✅ Global Sync Complete');
      }
    } catch (e) {
      setSyncStatus('Failed');
      alert('❌ Cloud pull failed');
    }
  };

  // Sync whenever data changes
  useEffect(() => { triggerSync(); }, [tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget, studyLogs]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      <header className="bg-slate-900 text-white p-8 shadow-2xl border-b-8 border-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ShieldCheck className="text-blue-400 mx-auto" size={40} />
          <blockquote className="text-xl font-serif italic text-slate-200 leading-relaxed">
            "We must all suffer from one of two pains: the pain of discipline or the pain of regret."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">— Jim Rohn</span>
            {appsScriptUrl ? (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${syncStatus === 'Synced' ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'}`}>
                CLOUD: {syncStatus.toUpperCase()}
              </span>
            ) : (
              <span className="text-[10px] font-black px-2 py-0.5 rounded border border-red-500 text-red-500">
                OFFLINE (LOCAL ONLY)
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6">
        
        {/* Disconnected Warning Banner */}
        {!appsScriptUrl && (
          <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-sm font-bold">
              <strong className="uppercase tracking-widest text-red-900 mr-2">Warning:</strong> 
              Data is only saving locally to this device. Global sync is disabled.
            </div>
            <button onClick={() => setActiveTab('setup')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-red-700 whitespace-nowrap">
              Connect Cloud
            </button>
          </div>
        )}

        <div className="flex overflow-x-auto gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 hide-scrollbar">
          <TabBtn active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} icon={<Clock size={18} />} label="Timetable" />
          <TabBtn active={activeTab === 'gym'} onClick={() => setActiveTab('gym')} icon={<Dumbbell size={18} />} label="Gym" />
          <TabBtn active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} icon={<Flame size={18} />} label="Habits" />
          <TabBtn active={activeTab === 'detox'} onClick={() => setActiveTab('detox')} icon={<Smartphone size={18} />} label="Detox" />
          <TabBtn active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<Wallet size={18} />} label="Finance" />
          <TabBtn active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<GraduationCap size={18} />} label="Study" />
          <TabBtn active={activeTab === 'wisdom'} onClick={() => setActiveTab('wisdom')} icon={<BookOpen size={18} />} label="Philosophy" />
          <TabBtn active={activeTab === 'setup'} onClick={() => setActiveTab('setup')} icon={<Settings size={18} />} label="Setup" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {activeTab === 'timetable' && <Timetable tasks={tasks} setTasks={setTasks} todos={todos} setTodos={setTodos} />}
          {activeTab === 'gym' && <Gym gymStreak={gymStreak} setGymStreak={setGymStreak} weightLogs={weightLogs} setWeightLogs={setWeightLogs} url={appsScriptUrl} />}
          {activeTab === 'habits' && <Habits habits={habits} setHabits={setHabits} />}
          {activeTab === 'detox' && <Detox used={screenUsed} setUsed={setScreenUsed} />}
          {activeTab === 'budget' && <Finance tx={transactions} setTx={setTransactions} budget={monthlyBudget} setBudget={setMonthlyBudget} />}
          {activeTab === 'study' && <Study studyLogs={studyLogs} setStudyLogs={setStudyLogs} />}
          {activeTab === 'wisdom' && <Philosophy />}
          {activeTab === 'setup' && <Setup url={appsScriptUrl} setUrl={setAppsScriptUrl} onPull={forcePull} />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all shrink-0 ${active ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon} {label}
    </button>
  );
}

function Timetable({ tasks, setTasks, todos, setTodos }) {
  const [t, setT] = useState(''); const [time, setTime] = useState('');
  const [todo, setTodo] = useState('');
  const [sec, setSec] = useState(25*60); const [run, setRun] = useState(false);
  
  useEffect(() => {
    let i = null; if(run && sec > 0) i = setInterval(()=>setSec(s=>s-1), 1000);
    return () => clearInterval(i);
  }, [run, sec]);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-slate-100 pb-2">Execution Plan</h2>
          <form className="flex flex-col sm:flex-row gap-2 mb-4" onSubmit={e=>{e.preventDefault(); setTasks([...tasks, {id:Date.now(), time, text:t}]); setT(''); setTime('');}}>
            <input className="w-full sm:w-28 p-3 sm:p-2 border rounded-lg text-sm font-bold outline-none focus:border-blue-600" placeholder="05:00" value={time} onChange={e=>setTime(e.target.value)} required />
            <input className="flex-1 p-3 sm:p-2 border rounded-lg text-sm font-bold outline-none focus:border-blue-600" placeholder="Objective" value={t} onChange={e=>setT(e.target.value)} required />
            <button className="bg-slate-900 text-white p-3 sm:p-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center w-full sm:w-auto"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {tasks.map(x => <div key={x.id} className="flex flex-wrap sm:flex-nowrap justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-bold items-center gap-2"><span className="text-blue-600 w-16">{x.time}</span><span className="flex-1">{x.text}</span><button onClick={()=>setTasks(tasks.filter(y=>y.id!==x.id))} className="text-slate-400 hover:text-red-600 p-2 sm:p-0"><Trash2 size={16}/></button></div>)}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-slate-100 pb-2">Action Items</h2>
          <form className="flex flex-col sm:flex-row gap-2 mb-4" onSubmit={e=>{e.preventDefault(); setTodos([...todos, {id:Date.now(), text:todo, completed:false}]); setTodo('');}}>
            <input className="flex-1 p-3 sm:p-2 border rounded-lg text-sm font-bold outline-none focus:border-blue-600" placeholder="Specific intention..." value={todo} onChange={e=>setTodo(e.target.value)} required />
            <button className="bg-slate-900 text-white p-3 sm:p-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center w-full sm:w-auto"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {todos.map(x => <div key={x.id} className="flex items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"><input type="checkbox" checked={x.completed} onChange={()=>setTodos(todos.map(y=>y.id===x.id?{...y,completed:!y.completed}:y))} className="w-5 h-5 mt-0.5 sm:mt-0 accent-blue-600 shrink-0" /><span className={`flex-1 text-sm font-bold ${x.completed?'line-through text-slate-400':''}`}>{x.text}</span></div>)}
          </div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-center text-white h-fit shadow-xl border-t-8 border-red-600">
        <h3 className="text-xs font-black tracking-widest text-red-500 uppercase mb-2">Deep Work Protocol</h3>
        <div className="text-6xl sm:text-7xl font-mono font-black mb-8 tracking-tighter">{Math.floor(sec/60)}:{(sec%60).toString().padStart(2,'0')}</div>
        <div className="flex gap-4 justify-center">
          <button onClick={()=>setRun(!run)} className="flex-1 sm:flex-none bg-red-600 px-6 sm:px-8 py-4 sm:py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition">{run?'Pause':'Engage'}</button>
          <button onClick={()=>{setRun(false);setSec(25*60)}} className="bg-slate-800 p-4 sm:p-3 rounded-xl hover:bg-slate-700 transition flex items-center justify-center"><RotateCcw size={20}/></button>
        </div>
      </div>
    </div>
  );
}

function Gym({ gymStreak, setGymStreak, weightLogs, setWeightLogs, url }) {
  const [w, setW] = useState(''); const [waist, setWaist] = useState(''); const [neck, setNeck] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if(!file || !url) return;
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await fetch(url, {
          method: 'POST', mode: 'no-cors',
          body: JSON.stringify({ action: 'uploadPhoto', data: reader.result.split(',')[1], mimeType: file.type, filename: file.name })
        });
        alert('Sent to processing. If sync is active, it will appear shortly.');
      } catch(e) { alert('Upload error'); }
      setLoading(false);
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-600 p-6 sm:p-8 rounded-3xl text-white shadow-lg flex-wrap gap-6 text-center sm:text-left">
        <div><h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">Iron Streak</h2><p className="text-blue-100 text-xs font-bold uppercase mt-1">Consistency is the only variable.</p></div>
        <div className="text-center">
          <div className="text-6xl sm:text-7xl font-black tracking-tighter">{gymStreak}</div>
          <div className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Days Clean</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={()=>setGymStreak(s=>s+1)} className="w-full sm:w-auto bg-white text-blue-600 px-6 py-4 sm:py-3 rounded-xl font-black text-sm sm:text-xs uppercase shadow-md hover:bg-blue-50">+ Log Session</button>
          <button onClick={()=>setGymStreak(0)} className="w-full sm:w-auto border border-blue-400 sm:border-none text-blue-100 py-3 sm:py-0 text-xs sm:text-[10px] font-black uppercase hover:text-white transition rounded-xl sm:rounded-none">Reset</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <form className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4" onSubmit={e=>{
          e.preventDefault();
          setWeightLogs([{id:Date.now(), date:new Date().toLocaleDateString(), weight:w, waist, neck}, ...weightLogs]);
          setW(''); setWaist(''); setNeck('');
        }}>
          <h3 className="font-black uppercase text-sm mb-4 border-b pb-2">Body Metrics (US Navy Formula)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             <div className="space-y-1 col-span-2 sm:col-span-1"><label className="text-[10px] font-black text-slate-400 uppercase">Weight</label><input className="w-full p-3 sm:p-2 border rounded-lg font-bold outline-none focus:border-blue-600" type="number" step="0.1" value={w} onChange={e=>setW(e.target.value)} required /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Waist</label><input className="w-full p-3 sm:p-2 border rounded-lg font-bold outline-none focus:border-blue-600" type="number" step="0.1" value={waist} onChange={e=>setWaist(e.target.value)} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Neck</label><input className="w-full p-3 sm:p-2 border rounded-lg font-bold outline-none focus:border-blue-600" type="number" step="0.1" value={neck} onChange={e=>setNeck(e.target.value)} /></div>
          </div>
          <div className="space-y-2 mt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Physique Update</label>
            <input type="file" className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-3 sm:file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:bg-slate-900 file:text-white" onChange={handleUpload} disabled={loading} />
            {loading && <p className="text-[10px] text-blue-600 font-black animate-pulse mt-1">TRANSMITTING TO CLOUD DRIVE...</p>}
          </div>
          <button className="w-full bg-slate-900 text-white py-4 sm:py-3 rounded-xl font-black uppercase text-sm sm:text-xs shadow-lg hover:bg-blue-600 transition mt-2">Save Metric</button>
        </form>
        <div className="space-y-4">
           {weightLogs.slice(0,4).map(l => (
             <div key={l.id} className="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm">
               <div><div className="text-xl sm:text-2xl font-black text-slate-900">{l.weight}kg</div><div className="text-[10px] font-bold text-slate-400 uppercase">{l.date}</div></div>
               <div className="flex gap-2 sm:gap-4 text-center">
                 <div className="bg-slate-50 p-2 rounded-lg"><div className="text-xs sm:text-sm font-black text-slate-900">{l.waist||'-'}</div><div className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Waist</div></div>
                 <div className="bg-slate-50 p-2 rounded-lg"><div className="text-xs sm:text-sm font-black text-slate-900">{l.neck||'-'}</div><div className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Neck</div></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function Habits({ habits, setHabits }) {
  const [n, setN] = useState('');
  const [resetId, setResetId] = useState(null);
  return (
    <div className="space-y-8">
       <h2 className="text-xl font-black uppercase border-b-4 border-slate-900 pb-2">Addiction Control</h2>
       <form className="flex flex-col sm:flex-row gap-3 sm:gap-2" onSubmit={e=>{e.preventDefault(); setHabits([...habits, {id:Date.now(), name:n.toUpperCase(), daysClean:0}]); setN('');}}>
          <input className="flex-1 p-4 sm:p-3 border-2 rounded-xl font-bold outline-none focus:border-blue-600" placeholder="Habit to break..." value={n} onChange={e=>setN(e.target.value)} required />
          <button className="bg-slate-900 text-white p-4 sm:px-6 sm:py-3 rounded-xl font-black uppercase text-sm sm:text-xs hover:bg-blue-600 transition w-full sm:w-auto">Add Tracker</button>
       </form>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(h => (
            <div key={h.id} className="bg-white border-4 border-slate-900 p-6 rounded-3xl text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
               <button onClick={() => setHabits(habits.filter(x=>x.id !== h.id))} className="absolute top-3 right-3 text-slate-300 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg"><Trash2 size={16}/></button>
               <div className="text-6xl sm:text-7xl font-black mb-1 tracking-tighter">{h.daysClean}</div>
               <div className="text-[10px] font-black uppercase text-red-500 mb-6 tracking-widest">Days Clean</div>
               <div className="text-sm font-black uppercase mb-6 h-10 flex items-center justify-center leading-tight px-4">{h.name}</div>
               <div className="flex gap-2">
                 {resetId === h.id ? (
                   <>
                     <button onClick={()=>{setHabits(habits.map(x=>x.id===h.id?{...x,daysClean:0}:x)); setResetId(null);}} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Execute</button>
                     <button onClick={()=>setResetId(null)} className="bg-slate-200 text-slate-800 py-3 px-4 rounded-xl font-black text-[10px] uppercase">Abort</button>
                   </>
                 ) : (
                   <>
                     <button onClick={()=>setHabits(habits.map(x=>x.id===h.id?{...x,daysClean:x.daysClean+1}:x))} className="flex-1 bg-slate-900 text-white py-3 sm:py-2.5 rounded-xl font-black text-xs sm:text-[10px] uppercase tracking-widest hover:bg-blue-600 transition">+1 Day</button>
                     <button onClick={()=>setResetId(h.id)} className="bg-slate-100 p-3 sm:p-2.5 rounded-xl text-slate-500 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center"><RotateCcw size={18}/></button>
                   </>
                 )}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function Detox({ used, setUsed }) {
  return (
    <div className="space-y-8 text-center py-10">
       <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">Digital Detox</h2>
       <div className="text-7xl sm:text-9xl font-black text-slate-900 my-8 sm:my-10 tracking-tighter">{used} <span className="text-lg sm:text-xl text-slate-400 block uppercase tracking-[0.5em] sm:tracking-[1em] mt-2">Minutes</span></div>
       <div className="flex justify-center gap-3 sm:gap-4">
         <button onClick={()=>setUsed(used+15)} className="bg-slate-900 text-white px-6 sm:px-8 py-4 rounded-2xl font-black uppercase text-sm sm:text-base hover:bg-blue-600 transition shadow-lg">+15 MIN</button>
         <button onClick={()=>setUsed(0)} className="bg-slate-100 p-4 rounded-2xl border border-slate-200 hover:bg-slate-200 transition flex items-center justify-center"><RotateCcw size={24}/></button>
       </div>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10 max-w-md mx-auto border-t border-slate-200 pt-4 px-4 leading-relaxed">
         Reference: Hunt, M. G., et al. (2018). "No More FOMO: Limiting Social Media Decreases Loneliness and Depression". Journal of Social and Clinical Psychology.
       </p>
    </div>
  );
}

function Finance({ tx, setTx, budget, setBudget }) {
  const [a, setA] = useState(''); const [d, setD] = useState(''); const [type, setType] = useState('expense');
  const inv = tx.filter(x=>x.type==='investment').reduce((s,x)=>s+x.amount,0);
  const exp = tx.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full sm:w-fit">
         <label className="text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Monthly Budget (₹)</label>
         <input type="number" className="p-3 sm:p-2 border rounded-lg font-bold w-full sm:w-32 outline-none focus:border-blue-600 text-center sm:text-left" value={budget} onChange={e=>setBudget(Number(e.target.value))} />
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg flex sm:block justify-between items-center"><div className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Invested</div><div className="text-3xl font-black">₹{inv.toLocaleString()}</div></div>
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border-l-8 border-red-600 flex sm:block justify-between items-center"><div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Spent</div><div className="text-3xl font-black">₹{exp.toLocaleString()}</div></div>
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 flex sm:block justify-between items-center"><div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Balance</div><div className="text-3xl font-black text-slate-900">₹{(budget-inv-exp).toLocaleString()}</div></div>
       </div>
       <div className="grid md:grid-cols-2 gap-10">
          <form className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit" onSubmit={e=>{e.preventDefault(); setTx([{id:Date.now(), amount:Number(a), desc:d, type, date:new Date().toISOString()}, ...tx]); setA(''); setD('');}}>
             <h3 className="font-black uppercase text-sm border-b pb-2 mb-4">Log Resource Allocation</h3>
             <input className="w-full p-4 sm:p-3 border rounded-xl font-bold outline-none focus:border-blue-600" placeholder="Amount (₹)" type="number" value={a} onChange={e=>setA(e.target.value)} required />
             <input className="w-full p-4 sm:p-3 border rounded-xl font-bold outline-none focus:border-blue-600" placeholder="Description" value={d} onChange={e=>setD(e.target.value)} required />
             <select className="w-full p-4 sm:p-3 border rounded-xl font-bold outline-none focus:border-blue-600" value={type} onChange={e=>setType(e.target.value)}>
               <option value="expense">Expense</option>
               <option value="investment">Investment</option>
             </select>
             <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase shadow-lg hover:bg-blue-600 transition tracking-widest mt-2">Log Entry</button>
          </form>
          <div>
            <h3 className="font-black uppercase text-sm border-b-2 border-slate-100 pb-2 mb-4">Financial Ledger</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
               {tx.slice(0,15).map(x => (
                 <div key={x.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition group gap-4">
                   <div className="flex-1 min-w-0">
                     <div className="font-black text-sm uppercase text-slate-900 truncate">{x.desc}</div>
                     <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(x.date).toLocaleDateString()}</div>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                     <div className={`font-mono font-black text-base sm:text-lg ${x.type==='investment'?'text-emerald-600':'text-red-600'}`}>{x.type==='investment'?'+':'-'}₹{x.amount}</div>
                     <button onClick={()=>setTx(tx.filter(i=>i.id !== x.id))} className="text-slate-300 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition p-2 sm:p-0"><Trash2 size={18}/></button>
                   </div>
                 </div>
               ))}
               {tx.length === 0 && <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">No transactions logged.</div>}
            </div>
          </div>
       </div>
    </div>
  );
}

function Study({ studyLogs, setStudyLogs }) {
  const [topic, setTopic] = useState(''); const [dur, setDur] = useState(''); const [notes, setNotes] = useState('');
  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-slate-900 pb-4 gap-4">
          <div>
             <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Knowledge Acquisition</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Based on the Active Recall Protocol (Karpicke & Roediger, 2008)</p>
          </div>
       </div>
       <div className="grid md:grid-cols-3 gap-8">
          <form className="md:col-span-1 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 h-fit" onSubmit={e=>{
            e.preventDefault(); setStudyLogs([{id:Date.now(), topic, duration:Number(dur), notes, date:new Date().toLocaleDateString()}, ...studyLogs]);
            setTopic(''); setDur(''); setNotes('');
          }}>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic</label><input className="w-full p-4 sm:p-3 border rounded-xl font-bold outline-none focus:border-blue-600 mt-1" value={topic} onChange={e=>setTopic(e.target.value)} required /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Min)</label><input type="number" className="w-full p-4 sm:p-3 border rounded-xl font-bold outline-none focus:border-blue-600 mt-1" value={dur} onChange={e=>setDur(e.target.value)} required /></div>
            <div>
               <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Takeaways</label><span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Brain Dump</span></div>
               <textarea className="w-full p-4 sm:p-3 border rounded-xl font-medium outline-none focus:border-blue-600 mt-1 h-32 resize-none text-sm" placeholder="Retrieve the concepts from memory..." value={notes} onChange={e=>setNotes(e.target.value)} required></textarea>
            </div>
            <button className="w-full bg-slate-900 text-white py-4 sm:py-3 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition text-sm">Log Data</button>
          </form>
          <div className="md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {studyLogs.map(l => (
              <div key={l.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col group">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                   <div>
                     <h4 className="font-black uppercase text-base sm:text-lg text-slate-900 leading-tight">{l.topic}</h4>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.date}</span>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0 mt-2 sm:mt-0 border-slate-100">
                     <span className="font-black text-xl sm:text-2xl text-slate-900">{l.duration} <span className="text-[10px] sm:text-xs text-red-600 uppercase tracking-widest">MIN</span></span>
                     <button onClick={()=>setStudyLogs(studyLogs.filter(i=>i.id!==l.id))} className="text-slate-400 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg"><Trash2 size={18}/></button>
                   </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic border-l-4 border-l-slate-900">
                   "{l.notes}"
                 </div>
              </div>
            ))}
            {studyLogs.length === 0 && <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">No study sessions logged.</div>}
          </div>
       </div>
    </div>
  );
}

function Philosophy() {
  return (
    <div className="space-y-8 py-4">
      <div className="text-center mb-10">
        <BookOpen className="text-slate-900 mx-auto mb-4" size={48} />
        <h2 className="text-3xl font-black uppercase tracking-tighter">Philosophical Frameworks</h2>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Mental Models for Extreme Resilience</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Stoicism */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border-2 border-slate-200 flex flex-col shadow-sm">
          <h3 className="text-xl font-black uppercase text-slate-900 mb-4 border-b-2 border-slate-300 pb-3">Stoicism</h3>
          <p className="text-sm text-slate-700 font-medium leading-relaxed flex-1 mb-6">
            <strong className="text-slate-900 block mb-2 uppercase tracking-widest text-[11px]">The Dichotomy of Control</strong>
            Direct absolute energy only toward your own actions, judgments, and will. Radically accept all external variables (outcomes, weather, opinions of others) as indifferent. This separation immediately eliminates victimhood and minimizes psychological entropy.
          </p>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-slate-300">
            Ref: Epictetus, <span className="italic">Enchiridion</span> (c. 125 AD).
          </div>
        </div>

        {/* Nihilism */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col border-b-8 border-red-600">
          <h3 className="text-xl font-black uppercase text-white mb-4 border-b border-slate-700 pb-3">Active Nihilism</h3>
          <p className="text-sm text-slate-300 font-medium leading-relaxed flex-1 mb-6">
            <strong className="text-white block mb-2 uppercase tracking-widest text-[11px]">The Will to Power</strong>
            The universe possesses no inherent, objective meaning. Rather than despairing over this void (passive nihilism), you must use this absolute, terrifying freedom to construct your own robust value system and execute a self-determined purpose.
          </p>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-slate-700">
            Ref: Nietzsche, F. (1883), <span className="italic">Thus Spoke Zarathustra</span>.
          </div>
        </div>

        {/* Gita */}
        <div className="bg-amber-50 p-6 sm:p-8 rounded-3xl border-2 border-amber-200 flex flex-col shadow-sm">
          <h3 className="text-xl font-black uppercase text-amber-900 mb-4 border-b-2 border-amber-300 pb-3">Bhagavad Gita</h3>
          <p className="text-sm text-amber-800 font-medium leading-relaxed flex-1 mb-6">
            <strong className="text-amber-900 block mb-2 uppercase tracking-widest text-[11px]">Nishkama Karma (Detached Action)</strong>
            You possess the right to perform your prescribed duty, but absolutely no entitlement to the fruits of your actions. Absolute devotion to the execution of the process—without emotional dependency on the outcome—cures performance anxiety.
          </p>
          <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-amber-300">
            Ref: Vyasa, <span className="italic">Bhagavad Gita</span> (Ch. 2, Verse 47).
          </div>
        </div>

      </div>

      {/* Recommended Academic & Historical Texts */}
      <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
        <h3 className="text-xl font-black uppercase text-slate-900 mb-6 border-b-2 border-slate-100 pb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" /> Curated Web Texts
        </h3>
        <div className="space-y-4">
          
          <a href="http://classics.mit.edu/Antoninus/meditations.html" target="_blank" rel="noopener noreferrer" className="block group">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 group-hover:border-slate-400 group-hover:shadow-md transition-all">
              <h4 className="font-black text-sm uppercase text-slate-900 flex justify-between items-center">
                1. Meditations (Marcus Aurelius) <span className="text-slate-400 group-hover:text-blue-600 transition-colors">↗</span>
              </h4>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                <strong className="text-slate-900">Summary:</strong> The private diary of a Roman Emperor. Acts as a highly practical manual on emotional regulation, duty, and maintaining the dichotomy of control amidst extreme stress.
              </p>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Source: MIT Internet Classics Archive</div>
            </div>
          </a>

          <a href="https://plato.stanford.edu/entries/nietzsche/" target="_blank" rel="noopener noreferrer" className="block group">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 group-hover:border-slate-400 group-hover:shadow-md transition-all">
              <h4 className="font-black text-sm uppercase text-slate-900 flex justify-between items-center">
                2. Friedrich Nietzsche (Active Nihilism) <span className="text-slate-400 group-hover:text-red-600 transition-colors">↗</span>
              </h4>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                <strong className="text-slate-900">Summary:</strong> A peer-reviewed academic breakdown of Nietzsche's transition from passive despair to "Active Nihilism"—the concept of destroying old values to forge an unbreakable personal philosophy.
              </p>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Source: Stanford Encyclopedia of Philosophy (SEP)</div>
            </div>
          </a>

          <a href="https://sacred-texts.com/hin/gita/index.htm" target="_blank" rel="noopener noreferrer" className="block group">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 group-hover:border-slate-400 group-hover:shadow-md transition-all">
              <h4 className="font-black text-sm uppercase text-slate-900 flex justify-between items-center">
                3. The Bhagavad Gita <span className="text-slate-400 group-hover:text-amber-600 transition-colors">↗</span>
              </h4>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                <strong className="text-slate-900">Summary:</strong> A seminal Eastern philosophical text detailing the framework of <em>Nishkama Karma</em>. It mathematically argues for taking aggressive action while remaining completely detached from the rewards or failures.
              </p>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Source: Internet Sacred Text Archive</div>
            </div>
          </a>

        </div>
      </div>

    </div>
  );
}

function Setup({ url, setUrl, onPull }) {
  return (
    <div className="space-y-8 max-w-xl mx-auto py-10">
       <div className="text-center">
          <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Globe size={40} /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Infrastructure Database</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Serverless Sync & Trainer Portal</p>
       </div>
       <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-blue-900 flex items-center gap-2"><HardDrive size={14} /> Apps Script API Endpoint</label>
            <input className="w-full p-4 border-2 border-blue-300 rounded-xl font-mono text-xs focus:border-blue-600 outline-none bg-white shadow-inner" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
             <button onClick={onPull} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition transform hover:-translate-y-0.5"><RefreshCw size={16}/> Force Pull (Sync All)</button>
          </div>
          <div className="pt-4 border-t border-blue-200 text-[10px] font-bold text-blue-800 uppercase leading-relaxed opacity-80">
            <strong>Critical:</strong> Data will not sync globally until a valid Google Apps Script Web App URL is provided. Once linked, send this exact URL to your trainer—it automatically converts into a secure HTML dashboard for them to monitor your metrics.
          </div>
       </div>
    </div>
  );
}
