"use client";

import { useState, useEffect } from "react";

interface BirthDateSelectProps {
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

export function BirthDateSelect({ value = "", onChange }: BirthDateSelectProps) {
  const currentYear = new Date().getFullYear();
  
  // Parse initial value
  const parts = value.split("-");
  const initialYear = parts[0] || "";
  const initialMonth = parts[1] ? String(parseInt(parts[1], 10)) : "";
  const initialDay = parts[2] ? String(parseInt(parts[2], 10)) : "";

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);

  // Generate Year options (from currentYear down to 1930)
  const years: number[] = [];
  for (let y = currentYear; y >= 1930; y--) {
    years.push(y);
  }

  // Generate Month options (1 to 12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Calculate max days in selected month & year
  const getDaysInMonth = (yStr: string, mStr: string) => {
    const yNum = parseInt(yStr, 10) || 2000;
    const mNum = parseInt(mStr, 10) || 1;
    return new Date(yNum, mNum, 0).getDate();
  };

  const maxDays = getDaysInMonth(year, month);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    updateFullDate(newYear, month, day);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    let validDay = day;
    const daysInNewMonth = getDaysInMonth(year, newMonth);
    if (parseInt(day, 10) > daysInNewMonth) {
      validDay = String(daysInNewMonth);
      setDay(validDay);
    }
    updateFullDate(year, newMonth, validDay);
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    updateFullDate(year, month, newDay);
  };

  const updateFullDate = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const formattedM = m.padStart(2, "0");
      const formattedD = d.padStart(2, "0");
      onChange(`${y}-${formattedM}-${formattedD}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-zinc-700">생년월일 (선택)</label>
        <span className="text-[10px] text-zinc-400">생일 혜택 및 본인 확인용</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {/* Year Select */}
        <div>
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">년도 선택</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">월 선택</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        </div>

        {/* Day Select */}
        <div>
          <select
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">일 선택</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
