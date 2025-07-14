// LiveStats.jsx
import React from 'react';
import {
  UserIcon,
  MailIcon,
  ClockIcon,
  PlusCircleIcon
} from 'lucide-react';

const statsConfig = [
  {
    icon: <UserIcon className="w-5 h-5" />,
    label: 'Active Users',
    key: 'activeUsers',
    color: 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200'
  },
  {
    icon: <MailIcon className="w-5 h-5" />,
    label: 'Messages Today',
    key: 'messagesToday',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-800 dark:text-pink-200'
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    label: 'Longest Session',
    key: 'longestSession',
    suffix: 'min',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-200'
  },
  {
    icon: <PlusCircleIcon className="w-5 h-5" />,
    label: 'New Users',
    key: 'newUsers',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
  }
];

const LiveStats = ({ stats }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {statsConfig.map(({ icon, label, key, suffix = '', color }) => (
        <div
          key={key}
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 shadow rounded-2xl px-4 py-4 transition-colors"
        >
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-white">
              {stats[key]} {suffix}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default LiveStats;
