import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iplbsbhaiyyugutmddpr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbGJzYmhhaXl5dWd1dG1kZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjQ0MTYsImV4cCI6MjA2NzgwMDQxNn0.ezDIsmf12mxj6dTNi5WOXUSFtwsxDsy0rmaVjKuuB34"
);

export default function BonnieDashboard() {
  const [messagesToday, setMessagesToday] = useState(0);
  const [uniqueUsersToday, setUniqueUsersToday] = useState(0);
  const [activeSessions, setActiveSessions] = useState([]);
  const [chatDuration, setChatDuration] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("bonnie_logs")
        .select("session_id, sender, created_at")
        .gte("created_at", startOfDay.toISOString());

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      setMessagesToday(data.length);

      const sessions = [...new Set(data.map((row) => row.session_id))];
      setUniqueUsersToday(sessions.length);

      const latestPerSession = sessions.map((sessionId) => {
        const messages = data.filter((msg) => msg.session_id === sessionId);
        return { sessionId, latest: messages[messages.length - 1] };
      });

      const active = latestPerSession.filter(({ latest }) => {
        const now = new Date();
        const lastMsg = new Date(latest.created_at);
        const timeDiff = (now - lastMsg) / 1000;
        const isActive = timeDiff < 600;
        console.log(`🔍 Checking session: ${latest.session_id}`);
        console.log(`🕒 Last message: ${lastMsg.toISOString()}`);
        console.log(`⏱️ Seconds since last message: ${timeDiff}`);
        console.log(`✅ Active: ${isActive}`);
        return isActive;
      });

      setActiveSessions(active);

      if (active.length > 0) {
        const start = new Date(
          data.filter((msg) => msg.session_id === active[0].sessionId)[0].created_at
        );
        const now = new Date();
        const duration = Math.floor((now - start) / 60000);
        setChatDuration(duration);
      } else {
        setChatDuration(0);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Bonnie Activity</h2>
      <div style={styles.card}>
        <span style={styles.greenDot} /> Bonnie is {isOnline ? "online" : "offline"}
      </div>
      <div style={styles.card}>
        💬 {activeSessions.length > 0
          ? `${activeSessions.length} active session${activeSessions.length > 1 ? "s" : ""} now`
          : "No one talking to Bonnie"}
      </div>
      <div style={styles.grid}>
        <div style={styles.miniCard}>
          ❤️ People talked to Bonnie today: <strong>{uniqueUsersToday}</strong>
        </div>
        <div style={styles.miniCard}>
          ✉️ Messages sent: <strong>{messagesToday}</strong>
        </div>
      </div>
      <div style={styles.card}>
        🕒 Current chat: {chatDuration > 0 ? `${chatDuration} minute${chatDuration !== 1 ? "s" : ""} long` : "None"}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#111",
    color: "#fff",
    minHeight: "100vh",
  },
  header: {
    fontSize: "28px",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#222",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "10px",
    fontSize: "16px",
  },
  miniCard: {
    backgroundColor: "#222",
    borderRadius: "12px",
    padding: "12px",
    margin: "5px",
    width: "100%",
    textAlign: "center",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    justifyContent: "space-between",
  },
  greenDot: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    backgroundColor: "#4CAF50",
    borderRadius: "50%",
    marginRight: "10px",
  },
};
