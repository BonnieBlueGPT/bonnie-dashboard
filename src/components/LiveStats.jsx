// components/LiveStats.jsx
import React from 'react';
import {
  UserIcon,
  MailIcon,
  ClockIcon,
  PlusCircleIcon
} from 'lucide-react';

const Card = ({ icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white dark:bg-zinc-900 shadow-md rounded-2xl px-4 py-4 w-full sm:w-48 transition-colors`}>
    <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900 dark:text-${color}-300`}>
      {icon}
    </div>
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-xl font-semibold text-gray-800 dark:text-white">{value}</div>
    </div>
  </div>
);

const LiveStats = ({ stats }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <Card icon={<UserIcon size={20} />} label="Active Users" value={stats.activeUsers} color="emerald" />
      <Card icon={<MailIcon size={20} />} label="Messages Today" value={stats.messagesToday} color="pink" />
      <Card icon={<ClockIcon size={20} />} label="Longest Session" value={`${stats.longestSession} min`} color="indigo" />
      <Card icon={<PlusCircleIcon size={20} />} label="New Users" value={stats.newUsers} color="blue" />
    </section>
  );
};

export default LiveStats;
