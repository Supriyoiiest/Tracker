import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Flame, Dumbbell, ShieldCheck, Plus, Trash2, 
  Play, Pause, RotateCcw, Activity, CheckSquare, 
  Smartphone, Camera, Wallet, BookOpen, Settings, 
  Globe, HardDrive, RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('timetable');
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
  }, [tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget, appsScriptUrl]);

  // --- CLOUD ENGINE ---
  const syncTimeout = useRef(null);

  const triggerSync = () => {
    if (!appsScriptUrl) return;
    setSyncStatus('Syncing...');
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      const payload = { tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget };
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
        setSyncStatus('Success');
        alert('✅ Force Sync Complete');
      }
    } catch (e) {
      setSyncStatus('Failed');
      alert('❌ Pull failed');
    }
  };

  // Sync whenever data changes
  useEffect(() => { triggerSync(); }, [tasks, todos, gymStreak, weightLogs, habits, screenUsed, transactions, monthlyBudget]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-900 text-white p-8 shadow-2xl border-b-8 border-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ShieldCheck className="text-blue-400 mx-auto" size={40} />
          <blockquote className="text-xl font-serif italic text-slate-200 leading-relaxed">
            "We must all suffer from one of two pains: the pain of discipline or the pain of regret."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">— Jim Rohn</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${syncStatus === 'Synced' ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'}`}>
              CLOUD: {syncStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6">
        <div className="flex overflow-x-auto gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 hide-scrollbar">
          <TabBtn active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} icon={<Clock size={18} />} label="Timetable" />
          <TabBtn active={activeTab === 'gym'} onClick={() => setActiveTab('gym')} icon={<Dumbbell size={18} />} label="Gym" />
          <TabBtn active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} icon={<Flame size={18} />} label="Habits" />
          <TabBtn active={activeTab === 'detox'} onClick={() => setActiveTab('detox')} icon={<Smartphone size={18} />} label="Detox" />
          <TabBtn active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<Wallet size={18} />} label="Finance" />
          <TabBtn active={activeTab === 'setup'} onClick={() => setActiveTab('setup')} icon={<Settings size={18} />} label="Setup" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {activeTab === 'timetable' && <Timetable tasks={tasks} setTasks={setTasks} todos={todos} setTodos={setTodos} />}
          {activeTab === 'gym' && <Gym gymStreak={gymStreak} setGymStreak={setGymStreak} weightLogs={weightLogs} setWeightLogs={setWeightLogs} url={appsScriptUrl} />}
          {activeTab === 'habits' && <Habits habits={habits} setHabits={setHabits} />}
          {activeTab === 'detox' && <Detox used={screenUsed} setUsed={setScreenUsed} />}
          {activeTab === 'budget' && <Finance tx={transactions} setTx={setTransactions} budget={monthlyBudget} setBudget={setMonthlyBudget} />}
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
          <form className="flex gap-2 mb-4" onSubmit={e=>{e.preventDefault(); setTasks([...tasks, {id:Date.now(), time, text:t}]); setT(''); setTime('');}}>
            <input className="w-24 p-2 border rounded-lg text-sm font-bold" placeholder="05:00" value={time} onChange={e=>setTime(e.target.value)} required />
            <input className="flex-1 p-2 border rounded-lg text-sm font-bold" placeholder="Objective" value={t} onChange={e=>setT(e.target.value)} required />
            <button className="bg-slate-900 text-white p-2 rounded-lg"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {tasks.map(x => <div key={x.id} className="flex justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-bold"><span className="text-blue-600 w-16">{x.time}</span><span className="flex-1">{x.text}</span><button onClick={()=>setTasks(tasks.filter(y=>y.id!==x.id))}><Trash2 size={14}/></button></div>)}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-slate-100 pb-2">Action Items</h2>
          <form className="flex gap-2 mb-4" onSubmit={e=>{e.preventDefault(); setTodos([...todos, {id:Date.now(), text:todo, completed:false}]); setTodo('');}}>
            <input className="flex-1 p-2 border rounded-lg text-sm font-bold" placeholder="Specific intention..." value={todo} onChange={e=>setTodo(e.target.value)} required />
            <button className="bg-slate-900 text-white p-2 rounded-lg"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {todos.map(x => <div key={x.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"><input type="checkbox" checked={x.completed} onChange={()=>setTodos(todos.map(y=>y.id===x.id?{...y,completed:!y.completed}:y))} /><span className={`flex-1 text-sm font-bold ${x.completed?'line-through text-slate-400':''}`}>{x.text}</span></div>)}
          </div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-3xl p-10 text-center text-white h-fit shadow-xl border-t-8 border-red-600">
        <h3 className="text-xs font-black tracking-widest text-red-500 uppercase mb-2">Deep Work Protocol</h3>
        <div className="text-7xl font-mono font-black mb-8">{Math.floor(sec/60)}:{(sec%60).toString().padStart(2,'0')}</div>
        <div className="flex gap-4 justify-center">
          <button onClick={()=>setRun(!run)} className="bg-red-600 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm">{run?'Pause':'Engage'}</button>
          <button onClick={()=>{setRun(false);setSec(25*60)}} className="bg-slate-800 p-3 rounded-xl"><RotateCcw size={20}/></button>
        </div>
      </div>
    </div>
  );
}

function Gym({ gymStreak, setGymStreak, weightLogs, setWeightLogs, url }) {
  const [w, setW] = useState(''); const [waist, setWaist] = useState(''); const [neck, setNeck] = useState('');
  const [loading, setLoading] = useState(false); const [imgUrl, setImgUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if(!file || !url) return;
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch(url, {
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
      <div className="flex items-center justify-between bg-blue-600 p-8 rounded-3xl text-white shadow-lg">
        <div><h2 className="text-2xl font-black uppercase tracking-tighter italic">Iron Streak</h2><p className="text-blue-100 text-xs font-bold uppercase mt-1">Consistency is the only variable.</p></div>
        <div className="text-center">
          <div className="text-6xl font-black">{gymStreak}</div>
          <div className="text-[10px] font-black uppercase text-blue-200">Days Clean</div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={()=>setGymStreak(s=>s+1)} className="bg-white text-blue-600 px-6 py-2 rounded-xl font-black text-xs uppercase shadow-md">+ Log Session</button>
          <button onClick={()=>setGymStreak(0)} className="text-blue-200 text-[10px] font-black uppercase hover:text-white">Reset</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <form className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4" onSubmit={e=>{
          e.preventDefault();
          setWeightLogs([{id:Date.now(), date:new Date().toLocaleDateString(), weight:w, waist, neck}, ...weightLogs]);
          setW(''); setWaist(''); setNeck('');
        }}>
          <h3 className="font-black uppercase text-sm mb-4 border-b pb-2">Body Metrics (US Navy Formula)</h3>
          <div className="grid grid-cols-3 gap-3">
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Weight</label><input className="w-full p-2 border rounded-lg font-bold" type="number" step="0.1" value={w} onChange={e=>setW(e.target.value)} required /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Waist</label><input className="w-full p-2 border rounded-lg font-bold" type="number" step="0.1" value={waist} onChange={e=>setWaist(e.target.value)} /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Neck</label><input className="w-full p-2 border rounded-lg font-bold" type="number" step="0.1" value={neck} onChange={e=>setNeck(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Physique Update</label>
            <input type="file" className="w-full text-xs" onChange={handleUpload} disabled={loading} />
            {loading && <p className="text-[10px] text-blue-600 font-black animate-pulse">TRANSMITTING TO CLOUD DRIVE...</p>}
          </div>
          <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Save Metric</button>
        </form>
        <div className="space-y-4">
           {weightLogs.slice(0,3).map(l => (
             <div key={l.id} className="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm">
               <div><div className="text-xl font-black">{l.weight}kg</div><div className="text-[10px] font-bold text-slate-400">{l.date}</div></div>
               <div className="flex gap-4 text-center">
                 <div><div className="text-xs font-black">{l.waist||'-'}</div><div className="text-[8px] text-slate-400 font-black uppercase">Waist</div></div>
                 <div><div className="text-xs font-black">{l.neck||'-'}</div><div className="text-[8px] text-slate-400 font-black uppercase">Neck</div></div>
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
  return (
    <div className="space-y-8">
       <h2 className="text-xl font-black uppercase border-b-4 border-slate-900 pb-2">Addiction Control</h2>
       <form className="flex gap-2" onSubmit={e=>{e.preventDefault(); setHabits([...habits, {id:Date.now(), name:n.toUpperCase(), daysClean:0}]); setN('');}}>
          <input className="flex-1 p-3 border rounded-xl font-bold" placeholder="Habit to break..." value={n} onChange={e=>setN(e.target.value)} required />
          <button className="bg-slate-900 text-white px-6 rounded-xl font-black uppercase text-xs">Add Tracker</button>
       </form>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {habits.map(h => (
            <div key={h.id} className="bg-white border-4 border-slate-900 p-6 rounded-3xl text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="text-5xl font-black mb-1">{h.daysClean}</div>
               <div className="text-[10px] font-black uppercase text-red-500 mb-6 tracking-widest">Days Clean</div>
               <div className="text-xs font-black uppercase mb-6 h-8 flex items-center justify-center leading-tight">{h.name}</div>
               <div className="flex gap-2">
                 <button onClick={()=>setHabits(habits.map(x=>x.id===h.id?{...x,daysClean:x.daysClean+1}:x))} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-widest">+1 Day</button>
                 <button onClick={()=>setHabits(habits.map(x=>x.id===h.id?{...x,daysClean:0}:x))} className="bg-slate-100 p-2 rounded-lg"><RotateCcw size={14}/></button>
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
       <h2 className="text-4xl font-black uppercase italic tracking-tighter">Digital Detox</h2>
       <div className="text-9xl font-black text-slate-900 my-10">{used} <span className="text-xl text-slate-400 block uppercase tracking-[1em] mt-2">Minutes</span></div>
       <div className="flex justify-center gap-4">
         <button onClick={()=>setUsed(used+15)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm">+15 MIN</button>
         <button onClick={()=>setUsed(0)} className="bg-slate-100 p-4 rounded-2xl border border-slate-200"><RotateCcw size={24}/></button>
       </div>
       <p className="text-xs font-bold text-slate-400 uppercase mt-8 italic max-w-md mx-auto">Source: Hunt, M. G., et al. (2018). Limiting Social Media Decreases Loneliness and Depression.</p>
    </div>
  );
}

function Finance({ tx, setTx, budget, setBudget }) {
  const [a, setA] = useState(''); const [d, setD] = useState(''); const [type, setType] = useState('expense');
  const inv = tx.filter(x=>x.type==='investment').reduce((s,x)=>s+x.amount,0);
  const exp = tx.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);
  return (
    <div className="space-y-8">
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg"><div className="text-[10px] font-black uppercase text-emerald-400 mb-1">Invested</div><div className="text-2xl font-black">₹{inv.toLocaleString()}</div></div>
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border-l-8 border-red-600"><div className="text-[10px] font-black uppercase text-slate-400 mb-1">Spent</div><div className="text-2xl font-black">₹{exp.toLocaleString()}</div></div>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 hidden sm:block"><div className="text-[10px] font-black uppercase text-slate-400 mb-1">Balance</div><div className="text-2xl font-black">₹{(budget-inv-exp).toLocaleString()}</div></div>
       </div>
       <div className="grid md:grid-cols-2 gap-10">
          <form className="space-y-4" onSubmit={e=>{e.preventDefault(); setTx([{id:Date.now(), amount:Number(a), desc:d, type, date:new Date().toISOString()}, ...tx]); setA(''); setD('');}}>
             <h3 className="font-black uppercase text-sm border-b pb-2">Log Resource Allocation</h3>
             <input className="w-full p-3 border rounded-xl font-bold" placeholder="Amount (₹)" type="number" value={a} onChange={e=>setA(e.target.value)} required />
             <input className="w-full p-3 border rounded-xl font-bold" placeholder="Description" value={d} onChange={e=>setD(e.target.value)} required />
             <select className="w-full p-3 border rounded-xl font-bold" value={type} onChange={e=>setType(e.target.value)}>
               <option value="expense">Expense</option>
               <option value="investment">Investment</option>
             </select>
             <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Confirm Entry</button>
          </form>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
             {tx.slice(0,10).map(x => <div key={x.id} className="flex justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm"><div className="font-black text-xs uppercase">{x.desc}</div><div className={`font-mono font-bold ${x.type==='investment'?'text-emerald-600':'text-red-500'}`}>{x.type==='investment'?'+':'-'}₹{x.amount}</div></div>)}
          </div>
       </div>
    </div>
  );
}

function Setup({ url, setUrl, onPull }) {
  return (
    <div className="space-y-8 max-w-xl mx-auto py-10">
       <div className="text-center"><Globe className="text-blue-600 mx-auto mb-4" size={48} /><h2 className="text-2xl font-black uppercase italic">Infrastructure</h2></div>
       <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-3xl space-y-6 shadow-inner">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-blue-900">Apps Script Endpoint</label>
            <input className="w-full p-4 border-2 border-blue-300 rounded-2xl font-mono text-xs focus:border-blue-600 outline-none" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
          </div>
          <div className="flex gap-4">
             <button onClick={onPull} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><RefreshCw size={16}/> Force Pull (Sync All)</button>
          </div>
          <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed opacity-70">
            This URL acts as your global database. To share with your trainer, send them this exact link. They will see your live dashboard instantly.
          </p>
       </div>
    </div>
  );
}

function GeetaGyan() {
  const verses = [{t: "You have a right to action, but never to its fruits.", a: "Anxiety comes from outcome-dependency. Focus on the set, the page, the hour."}, {t: "For him who has conquered the mind, the mind is the best of friends.", a: "The mind is a tool, not a master. Discipline is the process of taming it."}];
  const [v, setV] = useState(verses[0]);
  return (
    <div className="text-center space-y-8 py-10">
       <BookOpen className="text-amber-500 mx-auto" size={48} />
       <div className="bg-amber-50 border-4 border-amber-200 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <p className="text-3xl font-serif italic font-bold text-slate-800 leading-tight">"{v.t}"</p>
          <div className="h-1 w-20 bg-amber-400 mx-auto my-8"></div>
          <p className="text-sm font-bold text-amber-900 uppercase tracking-widest opacity-60">{v.a}</p>
       </div>
       <button onClick={()=>setV(verses[Math.floor(Math.random()*verses.length)])} className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-amber-700 transition-all">Seek Guidance</button>
    </div>
  );
}
