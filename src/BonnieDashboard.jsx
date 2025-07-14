// BonnieDashboard.jsx — GOD UPGRADE VERSION
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './BonnieDashboard.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BonnieDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();

      const { data, error } = await supabase
        .from('bonnie_logs')
        .select('*')
        .gte('created_at', isoToday)
        .order('created_at', { ascending: false });

      if (error) return console.error('❌ Fetch error:', error);

      setLogs(data);
      setUniqueUsers(new Set(data.map(log => log.session_id)).size);
      setTotalMessages(data.length);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
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

      <section className="stats">
        <div className="card pink"><strong>👤 Users:</strong> {uniqueUsers}</div>
        <div className="card blue"><strong>💌 Messages:</strong> {totalMessages}</div>
      </section>

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
              <tr key={i} className={log.sender === 'Bonnie' ? 'bonnie' : 'user'}>
                <td>{new Date(log.created_at).toLocaleTimeString()}</td>
                <td>{log.sender}</td>
                <td>{log.session_id}</td>
                <td>{log.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BonnieDashboard;
