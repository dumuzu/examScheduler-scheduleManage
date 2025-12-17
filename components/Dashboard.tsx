import React, { useState } from 'react';
import { useScheduleStore } from '../store/useScheduleStore';
import { ScheduleType, ScheduleItem } from '../types';
import { formatDate, normalizeDate } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Label } from './ui/components';
import { DatePicker } from './ui/DatePicker';
import { AddEntryDialog } from './AddEntryDialog';
import { RoomUsageWidget } from './RoomUsageWidget';
import { Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ScheduleTable = ({ items, onDelete, type }: { items: ScheduleItem[], onDelete: (id: string) => void, type: ScheduleType }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');

  // 1. Filter Logic using shared normalizeDate
  const filteredItems = items.filter(item => {
    if (!dateFilter) return true;
    // Normalize both sides to strictly match "YYYY-MM-DD"
    const normalizedItemDate = normalizeDate(item.date);
    const normalizedFilter = normalizeDate(dateFilter);
    return normalizedItemDate === normalizedFilter;
  });

  // 2. Sort Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return String(a.period).localeCompare(String(b.period), undefined, { numeric: true });
  });

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const safeCurrentPage = totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  
  // Reset page if filter changes result in fewer pages
  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter]);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const clearFilter = () => setDateFilter('');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-sm">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-[240px]">
            <DatePicker 
              value={dateFilter}
              onChange={setDateFilter}
              language="ja"
              placeholder="筛选日期 (Filter Date)"
            />
          </div>
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilter} className="h-9 px-2 text-zinc-500 hover:text-red-500">
              <X size={14} className="mr-1" /> 清除
            </Button>
          )}
        </div>
        <div className="text-xs text-zinc-400 font-medium">
          {dateFilter ? `筛选结果: ${sortedItems.length} 条` : `全部: ${items.length} 条`}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto w-full relative custom-scrollbar">
        {sortedItems.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
            <p>暂无数据</p>
            {dateFilter && <p className="text-xs mt-1">请尝试清除日期筛选</p>}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">日期</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">科目名</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">时限</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">人数 (京都/东京)</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">教室</th>
                <th className="px-6 py-3 font-medium text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visibleItems.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-6 py-4 text-zinc-700 min-w-[150px]">{item.courseName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 h-6 text-xs font-bold text-zinc-600 bg-zinc-100 rounded-full">
                      {item.period}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs whitespace-nowrap">
                    <span className="text-zinc-900 font-semibold">{item.studentsKyoto || 0}</span> / <span>{item.studentsTokyo || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-block px-2 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 rounded border border-zinc-200 whitespace-nowrap">
                       {item.room}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-white rounded-b-xl">
          <div className="text-xs text-zinc-500">
             {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, sortedItems.length)} / {sortedItems.length}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrev} 
              disabled={safeCurrentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-zinc-700 w-12 text-center">
              {safeCurrentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext} 
              disabled={safeCurrentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { exams, makeups, deleteEntry } = useScheduleStore();
  const [currentTab, setCurrentTab] = useState<ScheduleType>('exam');

  return (
    <div className="container mx-auto max-w-7xl pt-6 px-4 pb-20">
      <Tabs defaultValue="exam" onValueChange={(v) => setCurrentTab(v as ScheduleType)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-zinc-100/50 border border-zinc-200 p-1">
            <TabsTrigger value="exam" className="px-8">期末考试</TabsTrigger>
            <TabsTrigger value="makeup" className="px-8">补讲</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[600px] flex flex-col">
            <TabsContent value="exam" className="mt-0 h-full">
              <ScheduleTable items={exams} onDelete={(id) => deleteEntry('exam', id)} type="exam" />
            </TabsContent>
            <TabsContent value="makeup" className="mt-0 h-full">
              <ScheduleTable items={makeups} onDelete={(id) => deleteEntry('makeup', id)} type="makeup" />
            </TabsContent>
          </div>

          <div className="lg:col-span-1 space-y-6 h-[600px]">
            <RoomUsageWidget 
              items={currentTab === 'exam' ? exams : makeups} 
              title={currentTab === 'exam' ? "期末考试" : "补讲"}
            />
          </div>
        </div>
      </Tabs>
      
      <AddEntryDialog type={currentTab} />
    </div>
  );
};