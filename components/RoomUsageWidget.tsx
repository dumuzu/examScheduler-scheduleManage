import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/components';
import { ScheduleItem } from '../types';
import { formatDate } from '../lib/utils';

interface RoomUsageWidgetProps {
  items: ScheduleItem[];
  title: string;
}

export const RoomUsageWidget: React.FC<RoomUsageWidgetProps> = ({ items, title }) => {
  const stats = useMemo(() => {
    // Map: Room -> Date -> Periods[]
    const roomMap = new Map<string, Map<string, number[]>>();

    items.forEach(item => {
      if (!roomMap.has(item.room)) {
        roomMap.set(item.room, new Map());
      }
      const dates = roomMap.get(item.room)!;
      if (!dates.has(item.date)) {
        dates.set(item.date, []);
      }
      
      // Parse period string (e.g., "1,2") into individual numbers
      const periods = String(item.period)
        .split(/[,，、\s]+/) // Split by comma, ideographic comma, enumeration comma, or whitespace
        .map(p => parseInt(p, 10))
        .filter(n => !isNaN(n));

      dates.get(item.date)?.push(...periods);
    });

    // Convert to array and sort
    return Array.from(roomMap.entries()).map(([room, dates]) => ({
      room,
      usage: Array.from(dates.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    })).sort((a, b) => a.room.localeCompare(b.room));

  }, [items]);

  return (
    <Card className="h-full overflow-hidden flex flex-col border-none shadow-none bg-zinc-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          教室占用 ({title})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto no-scrollbar pb-6">
        <div className="space-y-4">
          {stats.length === 0 && <p className="text-xs text-muted-foreground">暂无数据</p>}
          {stats.map(({ room, usage }) => (
            <div key={room} className="text-sm">
              <div className="font-semibold mb-1 text-zinc-800">{room}</div>
              <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-zinc-200">
                {usage.map(([date, periods]) => {
                  // Deduplicate and sort periods
                  const uniquePeriods = Array.from(new Set(periods)).sort((a, b) => a - b);
                  return (
                    <div key={date} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">{formatDate(date)}</span>
                      <span className="font-mono text-zinc-900 bg-white px-1.5 py-0.5 rounded border border-zinc-100 shadow-sm">
                        {uniquePeriods.join(', ')} 限
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};