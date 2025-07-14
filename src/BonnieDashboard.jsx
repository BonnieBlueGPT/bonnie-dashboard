// BonnieDashboard.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Dashboard.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ DEBUG: Print .env variables
console.log("📦 SUPABASE_URL:", supabaseUrl);
console.log("🔑 SUPABASE_ANON_KEY:", supabaseAnonKey ? '✔️ Loaded' : '❌ MISSING');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BonnieDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();

      console.log('📅 Fetching logs since:', isoToday);

      const { data, error } = await supabase
        .from('bonnie_logs')
        .select('session_id,sender,created_at')
        .gte('created_at', isoToday);

      if (error) {
        console.error('❌ Error fetching logs:', error);
        return;
      }

      console.log('✅ Logs fetched:', data);

      setLogs(data);
      setUniqueUsers(new Set(data.map(log => log.session_id)).size);
      setTotalMessages(data.length);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>💬 Bonnie Activity Dashboard</h1>
      <div className="summary">
        <p>👤 Unique Users: {uniqueUsers}</p>
        <p>💌 Total Messages Today: {totalMessages}</p>
      </div>
      <div className="log-table">
        <h2>📜 Recent Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Sender</th>
              <th>Session ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.created_at).toLocaleTimeString()}</td>
                <td>{log.sender}</td>
                <td>{log.session_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BonnieDashboard;
