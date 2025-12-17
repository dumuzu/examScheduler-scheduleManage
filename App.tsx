import React, { useRef } from 'react';
import { Upload, Download, Calendar, Trash } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/components';
import { useScheduleStore } from './store/useScheduleStore';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFromExcel, exportToExcel, reset, isLoading } = useScheduleStore();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importFromExcel(file);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('确定要清空所有数据吗？此操作无法撤销。')) {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-100">
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-md">
               <Calendar size={20} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">学期日程管理</h1>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".xlsx,.xls" 
              className="hidden" 
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 text-zinc-600 border-zinc-200"
              onClick={handleImportClick}
              disabled={isLoading}
            >
              <Upload size={14} />
              <span className="hidden sm:inline">导入 Excel</span>
            </Button>
            
            <Button 
              size="sm" 
              className="h-9 gap-2 bg-black text-white hover:bg-zinc-800"
              onClick={exportToExcel}
              disabled={isLoading}
            >
              <Download size={14} />
              <span className="hidden sm:inline">导出 Excel</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-zinc-400 hover:text-red-500"
              onClick={handleReset}
              title="清空数据"
            >
               <Trash size={14} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <Dashboard />
      </main>

      {/* Hidden processing indicator */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-black"></div>
             <p className="text-sm font-medium">处理中...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;