import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { 
  Plane, Hotel, Utensils, ShoppingBag, Car, Clock, Info, ChevronRight, 
  Calendar, Baby, MapPin, Navigation, Coffee, Store, CheckCircle, 
  Star, Map as MapIcon, X, ExternalLink, ListChecks, Sparkles, 
  Smartphone, Briefcase, Smile, Zap, Shirt, Edit3, Ticket, 
  ArrowRight, Heart, Stethoscope, Wind, Plus, Bookmark, Search, Users, Cloud, Copy
} from 'lucide-react';

// --- Firebase 초기화 및 환경 설정 ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'osaka-babymoon-2025';

// --- 아이콘 매핑 ---
const IconMap = {
  Briefcase, Sparkles, Smile, Star, Zap, Shirt, Utensils, ShoppingBag, 
  MapPin, Plane, Car, Navigation, Coffee, Store, CheckCircle, 
  Stethoscope, Wind, Baby, Info, Heart, Ticket, ListChecks, Search
};

const renderIcon = (iconName, size = 18, className = "") => {
  const IconComponent = IconMap[iconName] || Info;
  return <IconComponent size={size} className={className} />;
};

// --- 정적 초기 데이터 ---
const DEFAULT_CHECKLIST_DATA = [
  { category: '필수 항목 (Essentials)', icon: 'Briefcase', items: [{ id: 'p1', name: '여권' }, { id: 'p2', name: '엔화' }, { id: 'p3', name: '유심(USIM)' }, { id: 'p4', name: '여행자 보험' }, { id: 'p5', name: '카드' }] },
  { category: '세안 & 욕실 (Cleansing & Bath)', icon: 'Sparkles', items: [{ id: 'c1', name: '클렌징 오일' }, { id: 'c2', name: '클렌징 폼' }, { id: 'c3', name: '전동 클렌져' }, { id: 'c4', name: '립앤아이리무버' }, { id: 'c5', name: '화장솜' }, { id: 'c6', name: '샤워볼' }, { id: 'c7', name: '양치세트' }, { id: 'c8', name: '치실' }, { id: 'c9', name: '면도기' }] },
  { category: '기초 & 헤어 (Skincare & Hair)', icon: 'Smile', items: [{ id: 's1', name: '패드 & 스킨' }, { id: 's2', name: '앰플 2종류' }, { id: 's3', name: '로션 & 크림' }, { id: 's4', name: '팩' }, { id: 's5', name: '여드름 패치' }, { id: 's6', name: '헤어에센스 & 토너' }, { id: 's7', name: '헤어스프레이' }, { id: 's8', name: '빗 & 롤빗' }, { id: 's9', name: '고무줄 & 머리띠' }, { id: 's10', name: '머리집게' }] },
  { category: '메이크업 (Makeup)', icon: 'Star', items: [{ id: 'm1', name: '썬크림' }, { id: 'm2', name: '정샘물 쿠션 2개' }, { id: 'm3', name: '어바웃톤 팩트' }, { id: 'm4', name: '컨실러 & 브러쉬' }, { id: 'm5', name: '아이섀도우 & 브러쉬' }, { id: 'm6', name: '아이라이너 & 마스카라' }, { id: 'm7', name: '틴트' }] },
  { category: '전자제품 (Electronics)', icon: 'Zap', items: [{ id: 'e1', name: '충전기' }, { id: 'e2', name: '보조배터리' }, { id: 'e3', name: '가습기' }] },
  { category: '개인용품 & 의류 (Personal & Clothes)', icon: 'Shirt', items: [{ id: 'i1', name: '옷 & 속옷' }, { id: 'i2', name: '잠옷' }, { id: 'i3', name: '립밤' }, { id: 'i4', name: '안경 & 안경집' }, { id: 'i5', name: '렌즈통 & 리뉴' }, { id: 'i6', name: '작은 우산 2개' }] }
];

const INITIAL_SAVED_PLACES = [
  { id: 1, name: '멘야 타케이 한큐우메다점', desc: '우메다역 츠케멘 명점. 진한 생선 베이스 육수가 특징.', type: 'food', query: 'Menya Takei Hankyu Umeda', icon: 'Utensils' },
  { id: 2, name: '멘야 스즈메', desc: '신사이바시 츠케멘 맛집.', type: 'food', query: 'Menya Suzume Osaka', icon: 'Utensils' },
  { id: 3, name: '무기토멘키리', desc: '정갈한 면발의 츠케멘.', type: 'food', query: 'Mugi to Menkiri', icon: 'Utensils' },
  { id: 4, name: '하나다코', desc: '우메다 전설의 타코야키.', type: 'food', query: 'Hanadako Umeda', icon: 'Utensils' },
  { id: 5, name: 'KITASUSHI HONTEN', desc: '고품질 스시 전문점.', type: 'food', query: 'Kitasushi Honten Umeda', icon: 'Utensils' },
  { id: 6, name: 'HARBS 다이마루 신사이바시', desc: '밀크 크레이프 케이크 성지.', type: 'food', query: 'HARBS Daimaru Shinsaibashi', icon: 'Coffee' },
  { id: 7, name: '아카짱혼포 오사카 본점', desc: '가장 큰 아기용품 매장.', type: 'shopping', query: 'Akachan Honpo Honmachi', icon: 'Baby' },
  { id: 8, name: '스키야키 호쿠토', desc: '고급 스키야키 보양식.', type: 'food', query: 'Sukiyaki Hokuto Shinsaibashi', icon: 'Utensils' },
  { id: 9, name: '모토무라 규카츠', desc: '겉바속촉 규카츠의 정석.', type: 'food', query: 'Motomura Gyukatsu Osaka', icon: 'Utensils' },
  { id: 10, name: '미즈노', desc: '미슐랭 오코노미야키.', type: 'food', query: 'Mizuno Okonomiyaki', icon: 'Utensils' },
  { id: 11, name: '551 호라이', desc: '오사카 명물 만두.', type: 'food', query: '551 Horai', icon: 'Utensils' },
  { id: 12, name: '오렌지 스트리트', desc: '트렌디한 편집숍 거리.', type: 'shopping', query: 'Orange Street Osaka', icon: 'ShoppingBag' },
  { id: 13, name: '헵파이브 관람차', desc: '우메다 랜드마크.', type: 'landmark', query: 'HEP FIVE Ferris Wheel', icon: 'MapPin' },
  { id: 14, name: '카메스시 총본점', desc: '가성비 스시 맛집.', type: 'food', query: 'Kame Sushi Total Main Store', icon: 'Utensils' }
];

const INITIAL_ITINERARY_BASE = [
  { date: 'PREP', title: '여행 준비 체크리스트', isChecklist: true },
  { date: 'FLIGHT', title: '항공권 & 공항 케어 정보', isFlight: true, flights: [
    { id: 'dep', type: '출국편', airline: '이스타항공', flightNo: 'ZE615', from: 'ICN (인천)', to: 'KIX (간사이)', depTime: '09:55', arrTime: '11:45', date: '2025.12.27', terminal: '제1여객터미널', duration: '1시간 50분', airportCode: 'ICN', airportName: '인천국제공항 (T1)', careInfo: [{ icon: 'CheckCircle', title: '패스트트랙', desc: "체크인 시 우대카드 요청 필수." }, { icon: 'Stethoscope', title: '의료센터', desc: "지하 1층 인하대병원 상주." }] },
    { id: 'ret', type: '귀국편', airline: '이스타항공', flightNo: 'ZE614', from: 'KIX (간사이)', to: 'ICN (인천)', depTime: '18:00', arrTime: '20:30', date: '2025.12.31', terminal: '제1터미널', duration: '2시간 30분', airportCode: 'KIX', airportName: '간사이국제공항 (T1)', careInfo: [{ icon: 'CheckCircle', title: '우선 탑승', desc: "임산부 우선 탑승 배려 요청." }, { icon: 'Baby', title: '너서리 룸', desc: "조용한 전용 휴게공간 완비." }] }
  ]},
  { date: '12/27 (토)', title: '오사카 도착 및 편의점 털기', events: [{ time: '05:30', title: '집에서 출발', desc: '자차 이용', type: 'transport', query: '인천공항', icon: 'Car' }, { time: '12:30', title: '간사이 공항 점심', desc: '카마타케 우동', type: 'food', query: 'Kamatake Udon', icon: 'Utensils' }, { time: '15:30', title: '호텔 체크인', desc: '쉐라톤 미야코 호텔', type: 'rest', query: 'Sheraton Miyako Hotel', icon: 'Hotel' }] },
  { date: '12/28 (일)', title: '아카짱혼포 & 스키야키', events: [{ time: '11:00', title: '아카짱혼포', desc: '쇼핑', type: 'shopping', query: 'Akachan Honpo', icon: 'ShoppingBag' }, { time: '13:30', title: '스키야키 호쿠토', desc: '점심', type: 'food', query: 'Sukiyaki Hokuto', icon: 'Utensils' }] },
  { date: '12/29 (월)', title: '우메다 미식 & 히츠마부시', events: [{ time: '12:00', title: 'KITASUSHI', desc: '스시', type: 'food', query: 'Kitasushi', icon: 'Utensils' }, { time: '18:30', title: 'MARUYA HONTEN', desc: '장어덮밥', type: 'food', query: 'Maruya Honten', icon: 'Utensils' }] },
  { date: '12/30 (화)', title: '여유로운 힐링 & 츠케멘', events: [{ time: '13:00', title: '아베노 하루카스', desc: '전망대', type: 'landmark', query: 'Abeno Harukas', icon: 'MapPin' }] },
  { date: '12/31 (수)', title: '최후의 만찬 후 귀국', events: [{ time: '12:00', title: '피날레 점심', desc: '백화점 식당가', type: 'food', query: 'Kintetsu Department Store', icon: 'Utensils' }, { time: '18:00', title: '간사이 출발', desc: '안전한 귀국', type: 'flight', query: 'Kansai Airport', icon: 'Plane' }] },
  { date: 'SAVED', title: '내 지도 즐겨찾기', isSaved: true }
];

const App = () => {
  const [user, setUser] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('syncing');

  // 실시간 공유 상태
  const [itinerary, setItinerary] = useState(INITIAL_ITINERARY_BASE);
  const [savedPlaces, setSavedPlaces] = useState(INITIAL_SAVED_PLACES);
  const [checkedItems, setCheckedItems] = useState({});
  const [memoItems, setMemoItems] = useState({});

  // 모달 상태
  const [addingPlace, setAddingPlace] = useState(null);
  const [targetDay, setTargetDay] = useState(2);
  const [targetTime, setTargetTime] = useState('14:00');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [newPlaceInput, setNewPlaceInput] = useState({ name: '', desc: '', type: 'food' });

  // --- Auth ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Real-time Sync ---
  useEffect(() => {
    if (!user) return;

    // 경로: artifacts/{appId}/public/data/travelPlan/shared
    const planDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'travelPlan', 'shared');

    const unsubscribe = onSnapshot(planDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.itinerary) setItinerary(data.itinerary);
        if (data.savedPlaces) setSavedPlaces(data.savedPlaces);
        if (data.checkedItems) setCheckedItems(data.checkedItems);
        if (data.memoItems) setMemoItems(data.memoItems);
      } else {
        setDoc(planDocRef, {
          itinerary: INITIAL_ITINERARY_BASE,
          savedPlaces: INITIAL_SAVED_PLACES,
          checkedItems: {},
          memoItems: {}
        });
      }
      setLoading(false);
      setSyncStatus('synced');
    }, (err) => {
      console.error("Sync error:", err);
      setLoading(false);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [user]);

  const updateCloudData = async (newData) => {
    if (!user) return;
    setSyncStatus('syncing');
    const planDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'travelPlan', 'shared');
    try {
      await updateDoc(planDocRef, newData);
      setSyncStatus('synced');
    } catch (err) {
      console.error("Update failed:", err);
      setSyncStatus('error');
    }
  };

  const toggleCheck = (id) => {
    const nextChecked = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(nextChecked);
    updateCloudData({ checkedItems: nextChecked });
  };

  const handleMemoChange = (id, value) => {
    const nextMemo = { ...memoItems, [id]: value };
    setMemoItems(nextMemo);
    updateCloudData({ memoItems: nextMemo });
  };

  const handleAddCustomPlace = () => {
    if (!newPlaceInput.name.trim()) return;
    const newPlace = { 
      id: Date.now(), 
      ...newPlaceInput, 
      query: newPlaceInput.name,
      icon: newPlaceInput.type === 'food' ? 'Utensils' : newPlaceInput.type === 'shopping' ? 'ShoppingBag' : 'MapPin'
    };
    const nextSaved = [newPlace, ...savedPlaces];
    setSavedPlaces(nextSaved);
    updateCloudData({ savedPlaces: nextSaved });
    setIsSearchModalOpen(false);
    setNewPlaceInput({ name: '', desc: '', type: 'food' });
  };

  const addToSchedule = () => {
    if (!addingPlace) return;
    const newEvent = {
      time: targetTime,
      title: addingPlace.name,
      desc: addingPlace.desc,
      icon: addingPlace.icon || (addingPlace.type === 'food' ? 'Utensils' : 'MapPin'),
      type: addingPlace.type,
      query: addingPlace.query
    };
    const updatedItinerary = [...itinerary];
    const targetIdx = targetDay;
    const currentEvents = [...(updatedItinerary[targetIdx].events || []), newEvent];
    currentEvents.sort((a, b) => a.time.localeCompare(b.time));
    updatedItinerary[targetIdx] = { ...updatedItinerary[targetIdx], events: currentEvents };
    
    setItinerary(updatedItinerary);
    updateCloudData({ itinerary: updatedItinerary });
    setAddingPlace(null);
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('링크가 복사되었습니다! 아내분께 전달하세요.');
    } catch (err) {
      console.error('Copy failed', err);
      alert('복사에 실패했습니다.');
    }
    document.body.removeChild(textArea);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'shopping': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'transport': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'flight': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'rest': return 'bg-green-100 text-green-600 border-green-200';
      case 'landmark': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Baby size={48} className="text-indigo-500 animate-bounce" />
        <p className="font-bold text-slate-400">데이터를 동기화 중입니다...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 selection:bg-indigo-100">
      {/* 지도 모달 */}
      {isMapOpen && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getTypeColor(selectedEvent.type)}`}>
                  {renderIcon(selectedEvent.icon || 'MapPin', 20)}
                </div>
                <h3 className="font-bold text-lg">{selectedEvent.title || selectedEvent.name}</h3>
              </div>
              <button onClick={() => setIsMapOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="aspect-video w-full bg-slate-100">
              <iframe title="Map" width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedEvent.query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} allowFullScreen />
            </div>
            <div className="p-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="font-bold text-slate-900 text-center sm:text-left text-sm flex-1">{selectedEvent.query}</p>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedEvent.query)}`} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 whitespace-nowrap transition-all active:scale-95">
                <Navigation size={18} fill="currentColor" /> 구글 맵에서 보기
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 일정 추가 팝업 */}
      {addingPlace && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in">
            <h3 className="text-xl font-black mb-6">일정에 추가</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(day => (
                  <button key={day} onClick={() => setTargetDay(day + 1)} className={`py-3 rounded-2xl font-black transition-all ${targetDay === day + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>D{day}</button>
                ))}
              </div>
              <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className="w-full bg-slate-50 p-4 border-2 border-slate-100 rounded-2xl font-bold" />
              <div className="flex gap-2">
                <button onClick={() => setAddingPlace(null)} className="flex-1 py-4 text-slate-400 font-bold bg-slate-50 rounded-2xl">취소</button>
                <button onClick={addToSchedule} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">추가하기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 장소 검색/추가 팝업 */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800">장소 직접 추가</h3>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">장소명 (검색어)</label>
                <input type="text" placeholder="예: 유니버셜 스튜디오 재팬" value={newPlaceInput.name} onChange={(e) => setNewPlaceInput({...newPlaceInput, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">카테고리</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{val:'food', label:'맛집'}, {val:'shopping', label:'쇼핑'}, {val:'landmark', label:'관광'}].map(cat => (
                    <button key={cat.val} onClick={() => setNewPlaceInput({...newPlaceInput, type: cat.val})} className={`py-3 rounded-2xl font-bold text-xs border-2 ${newPlaceInput.type === cat.val ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-100 text-slate-400'}`}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddCustomPlace} className="w-full bg-pink-500 text-white py-5 rounded-[2rem] font-black shadow-lg mt-4">리스트에 저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#C026D3] text-white pt-16 pb-32 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-white/20 backdrop-blur-lg px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">Collaborative Baby Diary</span>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/10">
               {syncStatus === 'syncing' ? <Cloud size={14} className="text-white animate-pulse" /> : <Cloud size={14} className="text-green-300" />}
               <span className="text-[9px] font-black tracking-tight uppercase">
                 {syncStatus === 'syncing' ? 'Syncing...' : 'Saved to Cloud'}
               </span>
            </div>
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tighter italic uppercase leading-none">
            Osaka<br/>Diary
            <span className="block text-3xl not-italic font-bold text-pink-200 mt-2">with 꾸꾸</span>
          </h1>
          <p className="text-indigo-100/80 flex items-center gap-2 text-sm font-medium"><Calendar size={16} /> 2025.12.27 — 12.31</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto -mt-16 px-4 relative z-20">
        {/* 상단 탭 셀렉터 */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {itinerary.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 snap-center ${
                activeDay === idx 
                ? 'bg-white text-indigo-600 shadow-xl scale-110 border-2 border-indigo-500' 
                : 'bg-white/60 text-slate-400 border-2 border-transparent backdrop-blur-md hover:bg-white/90'
              }`}
            >
              <span className="text-[10px] font-black uppercase mb-1">
                {day.date === 'PREP' ? 'Prep' : day.date === 'FLIGHT' ? 'Air' : day.date === 'SAVED' ? 'Saved' : 'Day'}
              </span>
              <span className="text-2xl font-black leading-none">
                {day.date === 'PREP' ? renderIcon('ListChecks', 24) : day.date === 'FLIGHT' ? renderIcon('Ticket', 24) : day.date === 'SAVED' ? renderIcon('Heart', 24, "fill-current") : idx - 1}
              </span>
            </button>
          ))}
        </div>

        {/* 탭 헤더 카드 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100/50 border border-white mb-8">
          <div className="flex justify-between items-center mb-2">
             <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">{itinerary[activeDay].date}</span>
             {renderIcon('Bookmark', 18, "text-slate-300")}
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{itinerary[activeDay].title}</h2>
        </div>

        {/* 조건부 렌더링 - 체크리스트 */}
        {itinerary[activeDay].isChecklist ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {DEFAULT_CHECKLIST_DATA.map((section, sIdx) => (
              <div key={sIdx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600 shadow-inner">
                    {renderIcon(section.icon, 18)}
                  </div>
                  <h3 className="font-black text-slate-800 tracking-tight">{section.category}</h3>
                </div>
                <div className="space-y-0 border-t border-slate-50 pt-2">
                  {section.items.map((item) => (
                    <div key={item.id} className={`flex items-center px-2 py-3 rounded-2xl transition-all ${checkedItems[item.id] ? 'bg-slate-50/30 opacity-70' : 'hover:bg-slate-50'}`}>
                      <div onClick={() => toggleCheck(item.id)} className={`w-8 h-8 flex-shrink-0 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${checkedItems[item.id] ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-200 bg-white'}`}>
                        {checkedItems[item.id] && <CheckCircle size={16} className="text-white" />}
                      </div>
                      <div className="flex-grow pl-4" onClick={() => toggleCheck(item.id)}>
                        <span className={`text-sm font-bold tracking-tight cursor-pointer transition-all ${checkedItems[item.id] ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.name}</span>
                      </div>
                      <div className="w-48 pl-4 border-l border-slate-100 flex items-center gap-2">
                        <Edit3 size={10} className="text-slate-300 flex-shrink-0" />
                        <input type="text" placeholder="메모" value={memoItems[item.id] || ''} onChange={(e) => handleMemoChange(item.id, e.target.value)} className="w-full bg-transparent text-[11px] font-medium placeholder:text-slate-300 focus:outline-none text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : itinerary[activeDay].isFlight ? (
          /* 항공권 뷰 */
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {itinerary[activeDay].flights.map((flight) => (
              <div key={flight.id} className="space-y-4">
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 relative group transition-all hover:shadow-xl hover:shadow-indigo-50">
                  <div className={`h-2 ${flight.airportCode === 'ICN' ? 'bg-indigo-500' : 'bg-red-500'}`} />
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8 text-xs font-bold text-slate-400">
                       <span className="text-slate-800 uppercase tracking-widest">{flight.type}</span>
                       <span>{flight.date}</span>
                    </div>
                    <div className="flex justify-between items-center mb-10 text-center">
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{flight.from.split(' ')[0]}</h4>
                        <p className="text-xl font-black text-indigo-600 mt-2">{flight.depTime}</p>
                      </div>
                      <div className="flex-grow px-4 opacity-30"><div className="h-px bg-slate-400 dashed w-full" /></div>
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{flight.to.split(' ')[0]}</h4>
                        <p className="text-xl font-black text-indigo-600 mt-2">{flight.arrTime}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">항공사/편명</p>
                        <p className="text-sm font-black text-slate-800 leading-tight">{flight.airline} <span className="block text-xs font-medium text-slate-500">{flight.flightNo}</span></p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">터미널</p>
                        <p className="text-sm font-black text-slate-800 leading-tight">{flight.terminal}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 케어 가이드 */}
                <div className={`rounded-[2.5rem] p-7 border-2 shadow-sm ${flight.airportCode === 'ICN' ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-white p-2 rounded-xl shadow-sm">{renderIcon('Heart', 18, flight.airportCode === 'ICN' ? 'text-indigo-600' : 'text-red-600')}</div>
                    <h4 className="font-black text-slate-800 tracking-tight text-sm">{flight.airportName} 임산부 케어</h4>
                  </div>
                  <div className="grid gap-4">
                    {flight.careInfo.map((care, cIdx) => (
                      <div key={cIdx} className="bg-white/60 p-4 rounded-2xl flex items-start gap-3 border border-white/50">
                        <div className="mt-0.5 text-indigo-500">{renderIcon(care.icon, 14)}</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 mb-0.5">{care.title}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{care.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : itinerary[activeDay].isSaved ? (
          /* 즐겨찾기 리스트 */
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setIsSearchModalOpen(true)} className="w-full bg-slate-800 text-white rounded-[2rem] p-5 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              {renderIcon('Search', 18)} <span className="font-black text-sm uppercase">Search & Add Place</span>
            </button>
            {savedPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="flex-grow relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${getTypeColor(place.type)}`}>{place.type}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">{place.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">{place.desc}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEvent(place)} className="flex-1 bg-slate-100 py-3.5 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2">
                      {renderIcon('MapIcon', 14)} 지도
                    </button>
                    <button onClick={() => setAddingPlace(place)} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                      <Plus size={14} /> 일정 추가
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Bookmark size={60} /></div>
              </div>
            ))}
          </div>
        ) : (
          /* 일일 일정 */
          <div className="space-y-5 relative pl-4">
            <div className="absolute left-6 top-10 bottom-10 w-px bg-slate-200 dashed" />
            {(itinerary[activeDay].events || []).length > 0 ? (
              itinerary[activeDay].events.map((event, idx) => (
                <div key={idx} className="flex gap-6 group relative animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-shrink-0 w-12 pt-3 text-right">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest font-mono">{event.time}</span>
                  </div>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-[1.25rem] border-4 border-white shadow-lg z-10 flex items-center justify-center transition-all ${getTypeColor(event.type)}`}>
                    {renderIcon(event.icon || 'MapPin', 18)}
                  </div>
                  <div onClick={() => handleOpenEvent(event)} className="flex-grow bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer">
                    <h3 className="font-black text-slate-800 text-base mb-1">{event.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{event.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center"><p className="text-sm font-bold text-slate-300">일정이 비어있습니다.</p></div>
            )}
          </div>
        )}

        {/* 공유 가이드 */}
        <div className="mt-12 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl shadow-inner"><Users size={20} /></div>
            <h3 className="font-black italic uppercase text-sm tracking-widest">Collaborative Sync</h3>
          </div>
          <p className="text-xs text-indigo-50 leading-relaxed font-medium mb-6 italic">
            이 링크를 아내분께 공유하세요. 이제 두 분이 실시간으로 동시에 접속하여 여행 계획을 세울 수 있습니다.
          </p>
          <button onClick={handleCopyUrl} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
             <Copy size={14} /> URL 복사하여 아내에게 전달하기
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .dashed { background-image: linear-gradient(to bottom, #cbd5e1 50%, rgba(255, 255, 255, 0) 0%); background-position: left; background-size: 1px 10px; background-repeat: repeat-y; }
      `}</style>
    </div>
  );
};

export default App;
