import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WhiteboardViewer } from './components/WhiteboardViewer';
import { TextbookViewer } from './components/TextbookViewer';
import { BoardImage } from './types';
import { Sparkles, Star } from 'lucide-react';

const defaultDistinctImages: BoardImage[] = [
  {
    id: 'board_cover',
    url: 'https://i.imgur.com/kqHb7p4.jpg',
    title: 'لوحة الشرح التمهيدية: منهاج كيمياء التوجيهي الشامل',
    description: 'اللوح الرئيسي التأسيسي لشرح مادة الكيمياء وسرعة التفاعلات والاتزان لثانوية التميز.',
    category: 'اللوح الرئيسي'
  }
];

export default function App() {
  
  const bookPdfUrl = "https://www.wepal.net/upload/legacy/2019/09-2019/content/5d82baf7a4750.pdf";

  // Whiteboard images state
  const [images, setImages] = useState<BoardImage[]>(() => {
    const saved = localStorage.getItem('study_board_images');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we do not load state containing Unsplash placeholders
      const hasUnsplash = parsed.some((img: any) => img.url && img.url.includes('unsplash.com'));
      if (parsed.length > 0 && !hasUnsplash) {
        return parsed;
      }
    }
    return defaultDistinctImages;
  });

  // Client-side dynamic scraper to fetch unblocked boards directly in the user's browser
  useEffect(() => {
    const fetchImgurAlbum = async () => {
      // Direct API endpoints to query in the student's browser (bypasses UK/Google Cloud blocks)
      const endpoints = [
        {
          url: 'https://api.imgur.com/post/v1/posts/9TP6hPU?client_id=546c25a59c58ad7&include=media',
          parser: (json: any) => {
            if (json && json.media && Array.isArray(json.media)) {
              return json.media.map((item: any, idx: number) => ({
                id: `board_${item.id}`,
                url: item.url || `https://i.imgur.com/${item.id}.jpg`,
                title: item.metadata?.title || `لوحة الشرح والتلخيص ${idx + 1}`,
                description: item.metadata?.description || `اللوح الدراسي رقم ${idx + 1} لمراجعة الكيمياء والتمثيل البياني والاتزان الكيميائي.`,
                category: 'لوح المعلم'
              }));
            }
            return null;
          }
        },
        {
          url: 'https://api.imgur.com/3/album/9TP6hPU/images',
          headers: { 'Authorization': 'Client-ID 546c25a59c58ad7' },
          parser: (json: any) => {
            if (json && json.data && Array.isArray(json.data)) {
              return json.data.map((item: any, idx: number) => ({
                id: `board_${item.id}`,
                url: item.link || `https://i.imgur.com/${item.id}.jpg`,
                title: item.title || `لوحة الشرح والتلخيص ${idx + 1}`,
                description: item.description || `اللوح الدراسي رقم ${idx + 1} لمراجعة الكيمياء والتمثيل البياني والاتزان الكيميائي.`,
                category: 'لوح المعلم'
              }));
            }
            return null;
          }
        },
        {
          url: 'https://api.imgur.com/3/album/9TP6hPU/images',
          headers: { 'Authorization': 'Client-ID 4e1d1e43689408e' },
          parser: (json: any) => {
            if (json && json.data && Array.isArray(json.data)) {
              return json.data.map((item: any, idx: number) => ({
                id: `board_${item.id}`,
                url: item.link || `https://i.imgur.com/${item.id}.jpg`,
                title: item.title || `لوحة الشرح والتلخيص ${idx + 1}`,
                description: item.description || `اللوح الدراسي رقم ${idx + 1} لمراجعة الكيمياء والتمثيل البياني والاتزان الكيميائي.`,
                category: 'لوح المعلم'
              }));
            }
            return null;
          }
        }
      ];

      for (const endpoint of endpoints) {
        try {
          const fetchOptions: RequestInit = {};
          if (endpoint.headers) {
            fetchOptions.headers = endpoint.headers;
          }
          const response = await fetch(endpoint.url, fetchOptions);
          if (!response.ok) continue;

          const json = await response.json();
          const parsedImages = endpoint.parser(json);
          if (parsedImages && parsedImages.length > 0) {
            console.log(`Successfully fetched ${parsedImages.length} images from Imgur directly:`, endpoint.url);
            setImages(parsedImages);
            localStorage.setItem('study_board_images', JSON.stringify(parsedImages));
            return; // Successfully loaded, skip fallbacks
          }
        } catch (err) {
          console.log(`Direct fetch failed for ${endpoint.url}:`, err);
        }
      }

      // If direct fetches fail, we fall back to scraping via CORS proxies
      const albumUrl = 'https://imgur.com/a/9TP6hPU';
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(albumUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(albumUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(albumUrl)}`
      ];

      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (!response.ok) continue;

          let html = '';
          if (proxy.includes('allorigins')) {
            const json = await response.json();
            html = json.contents || '';
          } else {
            html = await response.text();
          }

          if (html && html.length > 1000 && !html.includes('Content not available in your region')) {
            const hashes = new Set<string>();

            // Pattern 1: search inside window.postDataJSON or standard hash attributes
            const regexHash = /"hash"\s*:\s*"([a-zA-Z0-9]{5,10})"/g;
            let match;
            while ((match = regexHash.exec(html)) !== null) {
              const h = match[1];
              if (h !== '9TP6hPU' && h.length >= 5) {
                hashes.add(h);
              }
            }

            // Pattern 2: search inside default i.imgur.com paths
            const regexImg = /i\.imgur\.com\/([a-zA-Z0-9]{5,10})(\.jpg|\.png|\.jpeg)/gi;
            while ((match = regexImg.exec(html)) !== null) {
              const h = match[1];
              if (h !== '9TP6hPU' && h.length >= 5) {
                hashes.add(h);
              }
            }

            const hashList = Array.from(hashes);
            if (hashList.length > 0) {
              console.log('Successfully scraped Imgur hashes client-side:', hashList.length);
              const mapped = hashList.map((hash, idx) => ({
                id: `board_${hash}`,
                url: `https://i.imgur.com/${hash}.jpg`,
                title: `لوحة الشرح والتلخيص ${idx + 1}`,
                description: `اللوح الدراسي الخطي رقم ${idx + 1} المحمل من الألبوم لمراجعة مسائل المنهج وقوانين الكيمياء.`,
                category: `لوح المعلم`
              }));
              setImages(mapped);
              localStorage.setItem('study_board_images', JSON.stringify(mapped));
              break;
            }
          }
        } catch (e) {
          console.log('Skipping proxy due to local region limitations:', proxy);
        }
      }
    };

    fetchImgurAlbum();
  }, []);

  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Completed textbook chapters (We have 6 chapters in the textbook view, let's track progress metric using them)
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    const saved = localStorage.getItem('study_completed_chapters');
    return saved ? JSON.parse(saved) : ['ch1'];
  });

  // State synchronization with localStorage
  useEffect(() => {
    localStorage.setItem('study_board_images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('study_completed_chapters', JSON.stringify(completedChapters));
  }, [completedChapters]);

  // Image actions handlers
  const handleAddImage = (newImg: BoardImage) => {
    setImages(prev => {
      const updated = [...prev, newImg];
      // Automatically switch focus to the newly added image
      setActiveIdx(updated.length - 1);
      return updated;
    });
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Reset active index if we deleted the last one or active image is out of bounds
      if (activeIdx >= filtered.length) {
        setActiveIdx(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Chapter Toggle Handlers
  const handleToggleChapter = (chapterId: string) => {
    setCompletedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId) 
        : [...prev, chapterId]
    );
  };

  // Progress metrics computed based on the 5 principal Textbook Chapters
  const totalChaptersCount = 5;
  const completedChaptersCount = completedChapters.length;
  const progressPercentage = Math.round((completedChaptersCount / totalChaptersCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" dir="rtl" id="applet-root">
      
      {/* Top Header Section */}
      <Header 
        progressPercentage={progressPercentage}
        totalTaskCount={totalChaptersCount}
        completedTaskCount={completedChaptersCount}
      />

      {/* Main Study Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6" id="main-study-panels-grid">
        
        {/* RIGHT PANEL - Teacher's Sabboora Board Screenshots */}
        <section className="flex flex-col h-full" id="whiteboard-section-container">
          <div className="flex-1">
            <WhiteboardViewer 
              images={images}
              activeIdx={activeIdx}
              onSelectIndex={(idx) => setActiveIdx(idx)}
              onAddImage={handleAddImage}
              onDeleteImage={handleDeleteImage}
            />
          </div>
          
          {/* Quick study guidance sidebar under whiteboard */}
          <div className="mt-4 bg-emerald-50 border border-emerald-100/60 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-emerald-800">💡 تعليمات تصفح واستخدام اللوحة التفاعلية:</h3>
              <ul className="text-[11px] text-emerald-700/85 space-y-1 mt-1.5 list-disc list-inside">
                <li>يسهم <strong>التقديم للأمام (سهم اليمين)</strong> في الانتقال للأمام للوح التالي.</li>
                <li>يسهم <strong>الرجوع للخلف (سهم الشمال)</strong> في الانتقال التراجعي للوح السابق.</li>
                <li>استخدم الفأرة أو اللمس <strong>لسحب (Pan) وتقريب (Zoom) اللوح</strong> حتى تقرأ تفاصيل الرموز والمعادلات الصغيرة.</li>
                <li>فَعِّلْ <strong>"وضع اللوح الليلي 🌙"</strong> لقلب الخلفية البيضاء إلى سوداء دافئة، لتريح عينيك أثناء الحفظ بمكان مظلم.</li>
                <li>غيّر منزلقات <strong>السطوع والتباين</strong> لتبرز كتابة الخطاطين والمعلم في لقطات الكاميرا غير الواضحة.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* LEFT PANEL - School Book PDF Viewer */}
        <section className="flex flex-col h-full" id="textbook-and-notes-section-container">
          {/* Textbook viewer */}
          <div className="flex-1 min-h-[600px] flex flex-col">
            <TextbookViewer 
              pdfUrl={bookPdfUrl}
              onSelectChapter={(name) => console.log('Chapter selected: ' + name)}
              completedChapters={completedChapters}
              onToggleChapter={handleToggleChapter}
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 مساعد الدراسة للاختبار النهائي الذكي. تم التصميم والتنفيذ لثانوية التميز.</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              مخصص للطلاب المنجزين
            </span>
            <span className="text-slate-300">|</span>
            <a 
              href="https://www.wepal.net" 
              target="_blank" 
              rel="noopener" 
              className="hover:text-emerald-500 transition"
            >
              بوابة ويبال التعليمية الفلسطينية
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
