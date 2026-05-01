import { CalendarDays } from "lucide-react";

export default function Header() {
  return (
    <div className="flex justify-end items-center gap-4 mb-6 p-2">
      <CalendarDays className="w-5 h-5 text-gray-600" />
      <div className="w-8 h-8 bg-gray-300 rounded-full" />
    </div>
  );
}