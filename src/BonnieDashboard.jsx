// BonnieDashboard.jsx — updated with LiveStats panel
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LiveStats from './components/LiveStats';
import './BonnieDashboard.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BonnieDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(true);

  const [stats, setStats] = useState({
    activeUsers: 0,
    messagesToday: 0,
    longestSession: 0,
    newUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();

      const { data: messages, error: msgError } = await supabase
        .from('bonnie_logs')
        .select('*')
        .gte('created_at', isoToday)
        .order('created_at', { ascending: false });

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('session_id, created_at');

      if (msgError || userError) return console.error('❌ Fetch error:', msgError || userError);

      setLogs(messages);

      const sessions = {};
      messages.forEach(m => {
        if (!sessions[m.session_id]) sessions[m.session_id] = [];
        sessions[m.session_id].push(new Date(m.created_at));
      });

      const sessionDurations = Object.values(sessions).map(times => {
        const sorted = times.sort((a, b) => a - b);
        const diff = (sorted[sorted.length - 1] - sorted[0]) / 1000 / 60;
        return Math.round(diff);
      });

      const activeUsers = new Set(messages.map(m => m.session_id)).size;
      const messagesToday = messages.length;
      const longestSession = Math.max(...sessionDurations, 0);
      const newUsers = users.filter(u => new Date(u.created_at) > today).length;

      setStats({ activeUsers, messagesToday, longestSession, newUsers });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter(
    log =>
      log.session_id.toLowerCase().includes(search.toLowerCase()) ||
      log.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`dashboard ${dark ? 'dark' : 'light'}`}>
      <header>
        <h1>💬 Bonnie Dashboard</h1>
        <button onClick={() => setDark(!dark)}>
          {dark ? '☀️ Light' : '🌙 Dark'} Mode
        </button>
      </header>

      <LiveStats stats={stats} />

      <input
        className="search"
        type="text"
        placeholder="Search messages or session ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="log-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Sender</th>
              <th>Session</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i} className={log.sender === 'Bonnie' ? 'bonnie-row' : ''}>
                <td>{new Date(log.created_at).toLocaleTimeString()}</td>
                <td>{log.sender}</td>
                <td>{log.session_id}</td>
                <td className="message-cell">{log.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BonnieDashboard;