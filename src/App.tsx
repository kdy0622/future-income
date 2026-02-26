import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Settings, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initial statistics data (Monthly salary by age group index)
// Note: These are standard "All Occupations" values used for growth rate calculations
const INITIAL_X_VALUES: Record<number, number> = {
  1: 243, // 20-24
  2: 311, // 25-29
  3: 367, // 30-34
  4: 416, // 35-39
  5: 441, // 40-44
  6: 446, // 45-49
  7: 445, // 50-54
  8: 416, // 55-59
  9: 293  // 60+
};

const OCCUPATIONS = [
  { id: 'all', label: '전직종 (평균)', wage: 355.4 },
  { id: '1', label: '관리자', wage: 876.1 },
  { id: '2', label: '전문가 및 관련 종사자', wage: 481.5 },
  { id: '3', label: '사무 종사자', wage: 405.4 },
  { id: '4', label: '서비스 종사자', wage: 242.3 },
  { id: '5', label: '판매 종사자', wage: 342.5 },
  { id: '6', label: '농림·어업 숙련 종사자', wage: 311.7 },
  { id: '7', label: '기능원 및 관련 기능 종사자', wage: 374.5 },
  { id: '8', label: '장치·기계 조작 및 조립 종사자', wage: 414.2 },
  { id: '9', label: '단순노무 종사자', wage: 228.5 },
];

const AGE_GROUPS = [
  { id: 1, label: '20 ~ 24세 (x1)' },
  { id: 2, label: '25 ~ 29세 (x2)' },
  { id: 3, label: '30 ~ 34세 (x3)' },
  { id: 4, label: '35 ~ 39세 (x4)' },
  { id: 5, label: '40 ~ 44세 (x5)' },
  { id: 6, label: '45 ~ 49세 (x6)' },
  { id: 7, label: '50 ~ 54세 (x7)' },
  { id: 8, label: '55 ~ 59세 (x8)' },
  { id: 9, label: '60세 이상 (x9)' },
];

const DURATIONS = [10, 15, 20, 30];

export default function App() {
  const [currentIncome, setCurrentIncome] = useState<number>(4000);
  const [ageGroup, setAgeGroup] = useState<number>(2);
  const [selectedDuration, setSelectedDuration] = useState<number>(20);
  const [selectedOccupation, setSelectedOccupation] = useState<string>('all');
  const [xValues, setXValues] = useState<Record<number, number>>(INITIAL_X_VALUES);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const occupationData = useMemo(() => 
    OCCUPATIONS.find(o => o.id === selectedOccupation) || OCCUPATIONS[0]
  , [selectedOccupation]);

  const stats = useMemo(() => {
    const getRate = (startIdx: number, duration: number) => {
      let endIdx = startIdx;
      let count = 0;
      if (duration === 10) { endIdx = startIdx + 2; count = 3; }
      else if (duration === 15) { endIdx = startIdx + 3; count = 4; }
      else if (duration === 20) { endIdx = startIdx + 4; count = 5; }
      else if (duration === 30) { endIdx = startIdx + 6; count = 7; }

      let sum = 0;
      for (let i = startIdx; i <= Math.min(endIdx, 9); i++) {
        sum += xValues[i] || 0;
      }
      return (sum / count) / (xValues[startIdx] || 1);
    };

    // Rule: Choose the most advantageous rate among durations <= selectedDuration
    const availableDurations = DURATIONS.filter(d => d <= selectedDuration);
    let maxRate = 0;
    let bestD = selectedDuration;

    availableDurations.forEach(d => {
      const r = getRate(ageGroup, d);
      if (r > maxRate) {
        maxRate = r;
        bestD = d;
      }
    });

    const finalIncome = currentIncome * maxRate;

    return {
      maxRate,
      finalIncome,
      bestD
    };
  }, [currentIncome, ageGroup, selectedDuration, xValues]);

  const handleXValueChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setXValues(prev => ({ ...prev, [index]: numValue }));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200"
          >
            <Calculator className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">장래소득 인정 시뮬레이터</h1>
          <p className="text-slate-500 mt-2 font-medium">2024년 고용형태별근로실태조사 및 별표7 인정기준 적용</p>
        </header>

        {/* Statistics Settings */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <Settings className="w-4 h-4" />
              <span>통계 데이터 수정 (연령별 월급여액 xₙ)</span>
            </div>
            {isStatsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {isStatsOpen && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    * 장래소득 증가율 산출을 위한 연령대별 평균 월급여액입니다. (단위: 만원)<br/>
                    * 기본값은 2024년 고용노동통계의 '전직종' 기준을 따릅니다.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.keys(INITIAL_X_VALUES).map((key) => {
                      const idx = parseInt(key);
                      return (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">x{idx} 연령대 월급</label>
                          <input 
                            type="number" 
                            value={xValues[idx]} 
                            onChange={(e) => handleXValueChange(idx, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Input Card */}
        <main className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-8 border border-slate-100">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  현재 연간 소득
                  <span className="text-xs font-normal text-slate-400">(단위: 만원)</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={currentIncome}
                    onChange={(e) => setCurrentIncome(parseFloat(e.target.value) || 0)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="예: 4000"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">만원</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">직종 선택 (참고용)</label>
                <select 
                  value={selectedOccupation}
                  onChange={(e) => setSelectedOccupation(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {OCCUPATIONS.map(occ => (
                    <option key={occ.id} value={occ.id}>{occ.label}</option>
                  ))}
                </select>
                <div className="px-2 text-[11px] text-slate-500">
                  해당 직종 2024년 평균 월급: <span className="font-bold text-blue-600">{occupationData.wage.toLocaleString()}만원</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">신청시 연령 (만)</label>
                <select 
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(parseInt(e.target.value))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {AGE_GROUPS.map(group => (
                    <option key={group.id} value={group.id}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">대출 만기 선택</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map(year => (
                    <button 
                      key={year}
                      onClick={() => setSelectedDuration(year)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                        selectedDuration === year 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {year}년
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <motion.div 
              layout
              className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-100 font-bold text-sm mb-2 uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  인정 장래소득 결과
                </div>
                <div className="text-4xl md:text-5xl font-black tracking-tight">
                  {Math.round(stats.finalIncome).toLocaleString()} <span className="text-2xl font-bold opacity-80">만원</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-blue-100/70 font-medium">평균소득증가율</div>
                    <div className="text-xl font-bold">{stats.maxRate.toFixed(3)}<span className="text-sm ml-1 opacity-70">배</span></div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-bold border border-white/10">
                    * 만기 {selectedDuration}년 이하 중 가장 유리한 비율 적용
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        <footer className="mt-8 text-[11px] text-slate-400 leading-relaxed bg-white/50 p-4 rounded-2xl border border-slate-200/50">
          <p className="mb-1 font-semibold text-slate-500 uppercase tracking-tighter">안내사항</p>
          <ul className="space-y-1">
            <li>• 출처: 고용노동부 2024년 고용형태별근로실태조사 (직종별 임금 및 근로조건)</li>
            <li>• 무주택 근로자의 주택구입목적 대출에 한함</li>
            <li>• 만기 10년 이상 비거치식 분할상환 적용</li>
            <li>• 실제 대출만기 이하에서 유리한 증가율 선택 가능 (주1 적용)</li>
            <li>• 본 시뮬레이션 결과는 참고용이며 실제 대출 심사 결과와 다를 수 있습니다.</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
