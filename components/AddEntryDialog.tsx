import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from './ui/components';
import { ScheduleType, ScheduleItem } from '../types';
import { generateId } from '../lib/utils';
import { useScheduleStore } from '../store/useScheduleStore';

const formSchema = z.object({
  date: z.string().min(1, "日期不能为空"),
  
  // 关键：时限必须是 string，因为要存 "1,2"
  period: z.string().min(1, "时限不能为空"), 
  
  courseName: z.string().optional(),
  
  // 关键：处理可能为空的情况，强制转为 number
  studentsKyoto: z.number().or(z.nan()).transform(val => (isNaN(val) ? 0 : val)),
  studentsTokyo: z.number().or(z.nan()).transform(val => (isNaN(val) ? 0 : val)),
  
  room: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEntryDialogProps {
  type: ScheduleType;
}

export const AddEntryDialog: React.FC<AddEntryDialogProps> = ({ type }) => {
  const [open, setOpen] = useState(false);
  const addEntry = useScheduleStore(state => state.addEntry);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period: "1",
      studentsKyoto: 0,
      studentsTokyo: 0,
      room: ''
    }
  });

  const onSubmit = (data: FormValues) => {
    const newItem: ScheduleItem = {
      id: generateId(),
      date: data.date,
      period: data.period,
      courseName: data.courseName || '',
      studentsKyoto: data.studentsKyoto,
      studentsTokyo: data.studentsTokyo,
      room: data.room || ''
    };
    addEntry(type, newItem);
    setOpen(false);
    reset();
  };

  const noSpinnerClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-black text-white hover:bg-zinc-800 transition-all duration-300">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加{type === 'exam' ? '期末考试' : '补讲'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">时限 (例如: 1,2)</Label>
              <Input
                id="period"
                type="text"
                placeholder="1,2"
                {...register("period")}
                className={errors.period ? "border-red-500" : ""}
              />
              {errors.period && <span className="text-xs text-red-500">{errors.period.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseName">科目名</Label>
            <Input id="courseName" {...register("courseName")} placeholder="例如：高等数学" />
            {errors.courseName && <span className="text-xs text-red-500">{errors.courseName.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentsKyoto">人数 (京都)</Label>
              <Input
                id="studentsKyoto"
                type="number"
                {...register("studentsKyoto", { valueAsNumber: true })}
                className={noSpinnerClass}
                placeholder="0"
              />
              {errors.studentsKyoto && <span className="text-xs text-red-500">{errors.studentsKyoto.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentsTokyo">人数 (东京)</Label>
              <Input
                id="studentsTokyo"
                type="number"
                {...register("studentsTokyo", { valueAsNumber: true })}
                className={noSpinnerClass}
                placeholder="0"
              />
              {errors.studentsTokyo && <span className="text-xs text-red-500">{errors.studentsTokyo.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">教室</Label>
            <Input id="room" {...register("room")} placeholder="例如：3-201" />
            {errors.room && <span className="text-xs text-red-500">{errors.room.message}</span>}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};