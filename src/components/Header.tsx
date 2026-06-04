import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, GraduationCap } from 'lucide-react';

interface HeaderProps {
  progressPercentage: number;
  totalTaskCount: number;
  completedTaskCount: number;
}

export function Header({ progressPercentage, totalTaskCount, completedTaskCount }: HeaderProps) {
  // Target date-time: Tomorrow at 11:30 AM relative to the current session (gregorian morning 11:30)
  const [targetDate] = useState(() => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(11, 30, 0, 0);
    return target;
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = +targetDate - +now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <header className="bg-white border-b border-slate-100 shadow-xs relative overflow-hidden" id="main-app-header">
      {/* Decorative top strip */}
      <div className="h-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-green-600 w-full" />

      <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Brand/Title */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-emerald-100 animate-pulse">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  التحضير للاختبار النهائي
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  ذكي ومنظم
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
                منصة المذاكرة والمراجعة الشاملة
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                كل ما تحتاجه في مكان واحد: الكتاب المدرسي الرسمي ولوح شرح الشروحات التفاعلي مع ملخص المذاكرة
              </p>
            </div>
          </div>

          {/* Exam Countdown */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-start md:justify-end">
            
            {/* Countdown Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 pr-5 pl-5 flex items-center gap-4 shadow-2xs">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs text-slate-500 font-bold">الوقت المتبقي للاختبار (غداً 11:30 صباحاً)</span>
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                
                {timeLeft.isOver ? (
                  <span className="text-emerald-600 font-bold text-sm block mt-1">
                    حان وقت الاختبار! بالتوفيق والنجاح 🎓
                  </span>
                ) : (
                  <div className="flex gap-2 items-center mt-1.5 text-slate-800 font-semibold" dir="ltr">
                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold leading-none">{timeLeft.days}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">يوم</span>
                    </div>
                    <span className="text-slate-300">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">ساعة</span>
                    </div>
                    <span className="text-slate-300">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">دقيقة</span>
                    </div>
                    <span className="text-slate-300">:</span>
                    <div className="flex flex-col items-center text-emerald-600">
                      <span className="text-base font-black leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-[10px] text-emerald-500/80 mt-0.5">ثانية</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
