import React from 'react';
import { 
  BookOpen, ExternalLink, Download, Lightbulb, Scroll, Link2
} from 'lucide-react';

interface TextbookViewerProps {
  pdfUrl: string;
  onSelectChapter: (chapterName: string) => void;
  completedChapters: string[];
  onToggleChapter: (chapterName: string) => void;
}

export function TextbookViewer({ 
  pdfUrl, 
  onSelectChapter, 
  completedChapters, 
  onToggleChapter 
}: TextbookViewerProps) {
  
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col h-full" id="textbook-card">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">المنهج الدراسي المعتمد والكتاب المقرّر</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">تصفح الكتاب الدراسي الرسمي من خلال الرابط المباشر أو القارئ المضمن</p>
        </div>

        {/* Outer launch and download buttons */}
        <div className="flex items-center gap-1.5">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="فتح الرابط الرسمي الخارجي للكتاب مباشرة في صفحة مستقلة لتصفحه بكل حرية"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">افتتاح في علامة تبويب</span>
          </a>
          
          <a 
            href={pdfUrl} 
            download
            className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
            title="تحميل الكتاب كملف PDF محلي على جهازك"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Prominent Direct URL Link Block as Requested ("فقط اوضع الرابط") */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-4" id="direct-book-link-box">
        <span className="block text-right text-xs font-black text-slate-500 mb-1.5">رابط تصفح وتحميل الكتاب الدراسي المباشر (PDF):</span>
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl">
          <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-emerald-600 font-mono font-bold truncate hover:underline text-left flex-1 select-all"
            dir="ltr"
            title="رابط الكتاب المنهجي الرسمي"
          >
            {pdfUrl}
          </a>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition shrink-0 cursor-pointer text-center"
          >
            اضغط هنا لفتح الكتاب مباشرة
          </a>
        </div>
      </div>

      {/* Embedded PDF Viewer Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-2" id="pdf-container-panel">
          
          {/* Quick Helper Tips about the PDF */}
          <div className="bg-amber-50/75 border border-amber-100/80 text-amber-800 text-[11px] rounded-xl p-2.5 px-3 mb-2 flex items-start gap-2.5">
            <Lightbulb className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>💡 نصيحة دراسية:</strong> يمكنك استخدام الرابط المباشر بالأعلى لفتح وتصفح الكتاب خارج المنصة، أو تصفحه بسلاسة مباشرة في مشغل الـ PDF أدناه.
            </div>
          </div>

          {/* Main iframe element with robust fallbacks */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden relative">
            <iframe 
              src={`${pdfUrl}#toolbar=1`}
              title="الكتاب المنهجي المقرر للاختبار"
              className="w-full h-full border-0 rounded-xl"
              style={{ minHeight: '380px' }}
              loading="lazy"
            />
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <Scroll className="w-3.5 h-3.5 text-slate-300" />
              <span>الناشر: بوابة التعليم الفلسطينية - المناهج الرسمية</span>
            </span>
            <a 
              href="https://www.wepal.net" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-600 hover:underline"
            >
              موقع ويبال التعليمي wepal.net
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
