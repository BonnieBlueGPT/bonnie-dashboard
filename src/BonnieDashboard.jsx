// BonnieDashboard.jsx — Real-Time Mobile Dashboard
import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiUser, FiMessageCircle, FiSun, FiMoon, FiSettings, FiActivity } from 'react-icons/fi';
import './BonnieDashboard.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function BonnieDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ users: 0, messages: 0, longest: 0, newUsers: 0 });
  const [dark, setDark] = useState(true);
  const [bonnieOnline, setBonnieOnline] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: messages } = await supabase
        .from('bonnie_logs')
        .select('*')
        .gte('timestamp', today.toISOString())
        .order('timestamp', { ascending: false });

      const { data: users } = await supabase.from('users').select('*');

      setLogs(messages.slice(0, 50));
      const grouped = messages.reduce((acc, m) => {
        if (!acc[m.session_id]) acc[m.session_id] = [];
        acc[m.session_id].push(new Date(m.timestamp));
        return acc;
      }, {});

      const durations = Object.values(grouped).map(times => {
        const sorted = times.sort((a, b) => a - b);
        return (sorted[sorted.length - 1] - sorted[0]) / 60000;
      });

      setStats({
        users: Object.keys(grouped).length,
        messages: messages.length,
        longest: Math.round(Math.max(...durations, 0)),
        newUsers: users.filter(u => new Date(u.created_at) > today).length
      });

      // Check Bonnie online status
      const lastBonnie = messages.find(m => m.sender.toLowerCase() === 'bonnie');
      const isOnline = lastBonnie && new Date() - new Date(lastBonnie.timestamp) < 5 * 60000;
      setBonnieOnline(isOnline);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`dashboard ${dark ? 'dark' : 'light'}`}>
      <header className="sticky top-0 z-10 bg-white dark:bg-black px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${bonnieOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <h1 className="text-lg font-bold">Bonnie Dashboard</h1>
        </div>
        <button onClick={() => setDark(d => !d)} className="text-xl">
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </header>

      <section className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <Stat icon={<FiUser />} label="Active Users" value={stats.users} />
          <Stat icon={<FiMessageCircle />} label="Messages" value={stats.messages} />
          <Stat icon={<FiActivity />} label="Longest Session" value={`${stats.longest} min`} />
          <Stat icon={<FiUser />} label="New Users" value={stats.newUsers} />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow overflow-y-auto max-h-[60vh] text-sm">
          {logs.map((log, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{log.sender}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={`p-2 rounded-md ${log.sender === 'Bonnie' ? 'bg-pink-100 dark:bg-pink-900' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                {log.message || '—'}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </section>

      <nav className="fixed bottom-0 w-full bg-white dark:bg-black border-t flex justify-around py-2 text-xl">
        <button className="text-pink-500"><FiActivity /></button>
        <button className="text-gray-500"><FiMessageCircle /></button>
        <button className="text-gray-500"><FiSettings /></button>
      </nav>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
      <span className="text-pink-500">{icon}</span>
      <div>
        <div className="text-xs">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
