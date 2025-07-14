// BonnieDashboard.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './BonnieDashboard.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count > 0) {
      return `${count} ${i.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

export default function BonnieDashboard() {
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [totalMessagesToday, setTotalMessagesToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();

      const { data, error } = await supabase
        .from('bonnie_logs')
        .select('created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Fetch error:', error);
        return;
      }

      if (data.length > 0) setLastMessageTime(data[0].created_at);

      const messagesToday = data.filter(log => log.created_at >= isoToday);
      setTotalMessagesToday(messagesToday.length);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard bonnie-theme">
      <header>
        <h1>💗 Bonnie Status</h1>
      </header>
      <div className="stats">
        <div className="card">
          <h2>🕒 Last Spoken</h2>
          <p>{lastMessageTime ? timeSince(lastMessageTime) : 'Loading…'}</p>
        </div>
        <div className="card">
          <h2>💬 Messages Today</h2>
          <p>{totalMessagesToday}</p>
        </div>
      </div>
    </div>
  );
}
