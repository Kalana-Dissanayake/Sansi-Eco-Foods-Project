interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'green' | 'blue' | 'yellow' | 'purple';
  change?: string;
  changePositive?: boolean;
}

const COLOR_MAP = {
  green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconText: 'text-green-700', valueText: 'text-green-700' },
  blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-700', valueText: 'text-blue-700' },
  yellow: { bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', iconText: 'text-yellow-700', valueText: 'text-yellow-700' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-700', valueText: 'text-purple-700' },
};

export default function StatCard({
  label,
  value,
  icon,
  color,
  change,
  changePositive,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-6 border border-white shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.iconBg} ${colors.iconText} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${changePositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {changePositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className={`text-3xl font-black ${colors.valueText} mb-1`}>{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  );
}
