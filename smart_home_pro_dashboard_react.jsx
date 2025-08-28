import React, { useEffect, useMemo, useState } from "react";

// SmartHomePro - single-file React dashboard
// - Tailwind CSS classes assumed
// - Drop into a Vite React project as src/App.jsx
// - No attribution or extraneous comments

const SAMPLE_DEVICES = [
  { id: "living-light", name: "Living Light", type: "light", room: "Living Room", icon: "💡", state: { power: false, brightness: 80, colorTemp: 4000 }, schedules: [] },
  { id: "kitchen-light", name: "Kitchen Main", type: "light", room: "Kitchen", icon: "🔆", state: { power: false, brightness: 90, colorTemp: 5000 }, schedules: [] },
  { id: "bed-fan", name: "Ceiling Fan", type: "fan", room: "Bedroom", icon: "🌀", state: { power: false, speed: 2 }, schedules: [] },
  { id: "coffee-plug", name: "Coffee Maker", type: "plug", room: "Kitchen", icon: "🔌", state: { power: false }, schedules: [] }
];

const LS_KEYS = { devices: "shp.devices", settings: "shp.settings" };
const ROOMS_ORDER = ["All", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Garage"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function useLocal(key, initial) {
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

function IconButton({ children, onClick, title }){
  return (
    <button title={title} onClick={onClick} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
      {children}
    </button>
  );
}

function Header({ onToggleTheme, theme, query, setQuery }){
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">SmartHomePro</div>
        <div className="text-sm text-zinc-500">Control center</div>
      </div>
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search devices or rooms" className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-zinc-900" />
      </div>
      <div className="flex items-center gap-2">
        <IconButton title="Toggle theme" onClick={onToggleTheme}>{theme === 'dark' ? '🌙' : '☀️'}</IconButton>
        <IconButton title="Quick actions">⚡</IconButton>
      </div>
    </header>
  );
}

function Sidebar({ rooms, activeRoom, setActiveRoom, settings, setSettings, quickAllOn, quickAllOff }){
  return (
    <aside className="w-72 p-4 border-r border-zinc-200 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Rooms</h3>
        <div className="mt-2 space-y-2">
          {rooms.map(r => (
            <button key={r} onClick={()=>setActiveRoom(r)} className={`w-full text-left px-3 py-2 rounded-lg ${activeRoom===r? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Quick</h3>
        <div className="mt-2 flex gap-2">
          <button onClick={quickAllOn} className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white">All On</button>
          <button onClick={quickAllOff} className="flex-1 px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800">All Off</button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Settings</h3>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.saveHistory} onChange={(e)=>setSettings({...settings, saveHistory: e.target.checked})} /> Save history</label>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.automationsEnabled} onChange={(e)=>setSettings({...settings, automationsEnabled: e.target.checked})} /> Automations</label>
      </div>
    </aside>
  );
}

function DeviceCard({ device, onToggle, onChange, openEditor }){
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl">{device.icon}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{device.name}</div>
              <div className="text-xs text-zinc-500">{device.room} • {device.type}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>onToggle(device)} className={`px-3 py-1 rounded-full text-sm ${device.state.power? 'bg-emerald-600 text-white' : 'bg-zinc-200'}`}>{device.state.power ? 'On' : 'Off'}</button>
              <button onClick={()=>openEditor(device)} className="px-2 py-1 rounded-lg border text-sm">Edit</button>
            </div>
          </div>

          {device.type === 'light' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={100} value={device.state.brightness} onChange={(e)=>onChange(device, { brightness: Number(e.target.value) })} className="flex-1" />
                <div className="w-10 text-right text-sm tabular-nums">{device.state.brightness}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs">Color</label>
                <input type="range" min={2700} max={6500} step={100} value={device.state.colorTemp} onChange={(e)=>onChange(device, { colorTemp: Number(e.target.value) })} className="flex-1" />
              </div>
            </div>
          )}

          {device.type === 'fan' && (
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm">Speed</label>
              <select value={device.state.speed} onChange={(e)=>onChange(device, { speed: Number(e.target.value) })} className="px-2 py-1 rounded-lg border">
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          )}

          {device.type === 'plug' && (
            <div className="mt-4 text-sm text-zinc-500">Smart plug — power control only</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <div>{device.schedules?.length || 0} schedules</div>
        <div>Last updated: —</div>
      </div>
    </div>
  );
}

function EditorModal({ device, onClose, onSave }){
  const [local, setLocal] = useState(device || {});
  useEffect(()=> setLocal(device || {}), [device]);
  if(!device) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit {device.name}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded">✕</button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">Name<input value={local.name} onChange={(e)=>setLocal({...local, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-transparent" /></label>
          <label className="block text-sm">Room<input value={local.room} onChange={(e)=>setLocal({...local, room: e.target.value})} className="w-full px-3 py-2 rounded-lg border bg-transparent" /></label>
          {local.type === 'light' && (
            <div className="flex gap-2">
              <label className="flex-1 text-sm">Brightness<input type="range" min={1} max={100} value={local.state?.brightness || 70} onChange={(e)=>setLocal({...local, state:{...local.state, brightness: Number(e.target.value)}})} /></label>
              <label className="flex-1 text-sm">Color<input type="range" min={2700} max={6500} step={100} value={local.state?.colorTemp || 4000} onChange={(e)=>setLocal({...local, state:{...local.state, colorTemp: Number(e.target.value)}})} /></label>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={()=>{onSave(local); onClose();}} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Save</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [devices, setDevices] = useLocal(LS_KEYS.devices, SAMPLE_DEVICES);
  const [settings, setSettings] = useLocal(LS_KEYS.settings, { theme: 'light', saveHistory: false, automationsEnabled: true });
  const [activeRoom, setActiveRoom] = useState('All');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(()=>{ document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  const rooms = useMemo(()=>{
    const r = new Set(devices.map(d=>d.room));
    return [...new Set([...ROOMS_ORDER.filter(Boolean), ...Array.from(r)])];
  }, [devices]);

  const filtered = useMemo(()=> devices.filter(d=>{
    if(activeRoom !== 'All' && d.room !== activeRoom) return false;
    if(query && !(`${d.name} ${d.room} ${d.type}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  }), [devices, activeRoom, query]);

  const toggleDevice = (device) => {
    const next = devices.map(d => d.id===device.id ? {...d, state: {...d.state, power: !d.state.power}} : d);
    setDevices(next);
  };

  const changeDevice = (device, patch) => {
    const next = devices.map(d => d.id===device.id ? {...d, state: {...d.state, ...patch}} : d);
    setDevices(next);
  };

  const saveDevice = (updated) => {
    setDevices(prev => prev.map(d => d.id===updated.id ? {...d, ...updated} : d));
  };

  const quickAllOn = () => setDevices(prev => prev.map(d=>({...d, state:{...d.state, power: true}})));
  const quickAllOff = () => setDevices(prev => prev.map(d=>({...d, state:{...d.state, power: false}})));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-7xl mx-auto grid grid-cols-[280px_1fr] gap-6 p-6">
        <Sidebar rooms={rooms} activeRoom={activeRoom} setActiveRoom={setActiveRoom} settings={settings} setSettings={setSettings} quickAllOn={quickAllOn} quickAllOff={quickAllOff} />
        <main className="p-4">
          <Header onToggleTheme={()=>setSettings(s=>({...s, theme: s.theme==='dark'?'light':'dark'}))} theme={settings.theme} query={query} setQuery={setQuery} />

          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => (
              <DeviceCard key={d.id} device={d} onToggle={toggleDevice} onChange={changeDevice} openEditor={(dev)=>setEditing(dev)} />
            ))}
          </section>

          {filtered.length === 0 && (
            <div className="mt-6 text-center text-zinc-500">No devices found — add devices in the code or use storage</div>
          )}
        </main>
      </div>

      <EditorModal device={editing} onClose={()=>setEditing(null)} onSave={saveDevice} />
    </div>
  );
}
