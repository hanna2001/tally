type Props = {
  title: string;
  value: string;
  change?: string;
};

export default function StatCard({ title, value, change }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-xs text-gray-300">{title}</p>
      <h2 className="text-2xl font-semibold text-[#8C5A3C]">{value}</h2>
      {change && (
        <p className="text-sm text-green-600">{change}</p>
      )}
    </div>
  );
}