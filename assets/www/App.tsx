
import React, { useState, useEffect, useCallback } from 'react';
import { DebtEntry, MonthlyRate, SummaryReport, CalculationResult } from './types';
import { fetchHistoricalRates } from './geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DebtEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SummaryReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(0);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  const calculateTotalValue = async (entry: DebtEntry) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const endYear = today.getFullYear();
      const endMonth = today.getMonth() + 1;

      const rates = await fetchHistoricalRates(entry.startYear, entry.startMonth, endYear, endMonth);
      
      let totalTry = 0;
      let totalUsd = 0;
      let totalEur = 0;
      let totalGold = 0;

      const results: CalculationResult[] = rates.map(rate => {
        // Round monthly conversions to 2 decimal places as requested
        const usdVal = parseFloat((entry.monthlyAmount / rate.usd).toFixed(2));
        const eurVal = parseFloat((entry.monthlyAmount / rate.eur).toFixed(2));
        const goldVal = parseFloat((entry.monthlyAmount / rate.gold).toFixed(2));

        totalTry += entry.monthlyAmount;
        totalUsd += usdVal;
        totalEur += eurVal;
        totalGold += goldVal;

        return {
          monthLabel: `${months[rate.month - 1]} ${rate.year}`,
          amountTry: entry.monthlyAmount,
          amountUsd: usdVal,
          amountEur: eurVal,
          amountGold: goldVal,
          usdRate: rate.usd,
          eurRate: rate.eur,
          goldRate: rate.gold
        };
      });

      setSelectedEntry({
        totalMonths: rates.length,
        totalTry,
        totalUsd: parseFloat(totalUsd.toFixed(2)),
        totalEur: parseFloat(totalEur.toFixed(2)),
        totalGold: parseFloat(totalGold.toFixed(2)),
        results
      });
    } catch (err) {
      setError("Veriler alınırken bir hata oluştu. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || monthlyAmount <= 0) return;

    const newEntry: DebtEntry = {
      id: crypto.randomUUID(),
      clientName,
      startYear,
      startMonth,
      monthlyAmount,
      createdAt: Date.now()
    };

    setEntries(prev => [newEntry, ...prev]);
    calculateTotalValue(newEntry);
    
    setClientName('');
    setMonthlyAmount(0);
  };

  const handleRemove = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (entries.length <= 1) setSelectedEntry(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Borç Değer Takipçisi</h1>
          <p className="mt-2 text-sm text-gray-500">Ödenmemiş borçların aylık bazda döviz ve altın karşılığını (2 hane hassasiyetle) hesaplayın.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium shadow-sm">
          <i className="fa-solid fa-chart-line"></i>
          Dinamik Kur Analizi Aktif
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Section */}
        <section className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Yeni Kayıt Ekle</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kişi / Firma İsmi</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Örn: ABC İnşaat Ltd."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Yılı</label>
                  <select 
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Ayı</label>
                  <select 
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Ödenmeyen Tutar (TRY)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">₺</span>
                  <input 
                    type="number" 
                    value={monthlyAmount || ''}
                    onChange={(e) => setMonthlyAmount(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-calculator"></i>
                    Hesapla ve Listele
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Results / Dashboard Section */}
        <section className="lg:col-span-8 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <i className="fa-solid fa-triangle-exclamation text-red-400 mr-3"></i>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {selectedEntry ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Toplam Borç (TRY)</p>
                  <p className="text-2xl font-bold text-gray-900">₺{selectedEntry.totalTry.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-400 mt-1">{selectedEntry.totalMonths} Aylık Toplam</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Toplam Dolar</p>
                  <p className="text-2xl font-bold text-gray-900">${selectedEntry.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Toplam Euro</p>
                  <p className="text-2xl font-bold text-gray-900">€{selectedEntry.totalEur.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Gram Altın</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedEntry.totalGold.toFixed(2)} gr</p>
                </div>
              </div>

              {/* Data Table with Rates */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Detaylı Rapor ve Kur Verileri</h3>
                    <p className="text-xs text-gray-400">Her ay için kullanılan ortalama kurlar ve hesaplanan değerler</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition flex items-center gap-1">
                    <i className="fa-solid fa-file-export"></i> Dışa Aktar
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th rowSpan={2} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase border-r border-gray-200">Tarih</th>
                        <th colSpan={3} className="px-4 py-2 text-center text-[10px] font-bold text-indigo-600 uppercase border-b border-gray-200">Ortalama Kur (1 Birim / TRY)</th>
                        <th colSpan={3} className="px-4 py-2 text-center text-[10px] font-bold text-emerald-600 uppercase border-b border-gray-200">Aylık Karşılık (Borç Değeri)</th>
                      </tr>
                      <tr>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Dolar</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Euro</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase border-r border-gray-200">Altın (gr)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Dolar ($)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Euro (€)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Altın (gr)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {selectedEntry.results.map((res, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-700 border-r border-gray-100">{res.monthLabel}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-right text-gray-500 italic">₺{res.usdRate.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-right text-gray-500 italic">₺{res.eurRate.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-right text-gray-500 italic border-r border-gray-100">₺{res.goldRate.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-600">${res.amountUsd.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-emerald-600">€{res.amountEur.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-amber-600">{res.amountGold.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px]">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-area text-indigo-500"></i>
                  Aylık Varlık Değer Değişimi (Borç karşılığı üzerinden)
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={selectedEntry.results}>
                    <defs>
                      <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="monthLabel" tick={{fontSize: 10}} stroke="#94a3b8" />
                    <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="amountUsd" name="Dolar ($)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsd)" strokeWidth={2} />
                    <Area type="monotone" dataKey="amountEur" name="Euro (€)" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                    <Area type="monotone" dataKey="amountGold" name="Altın (gr)" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-dashed border-gray-300">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-folder-open text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Bir Hesaplama Yapılmadı</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Sol taraftaki formu doldurarak bir borcun bugüne kadarki döviz ve altın karşılığını (virgülden sonra 2 hane netliğiyle) görebilirsiniz.</p>
            </div>
          )}

          {/* History / Previous Entries */}
          {entries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kayıtlı Firmalar</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {entries.map(entry => (
                  <li key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold uppercase">
                        {entry.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{entry.clientName}</h4>
                        <p className="text-xs text-gray-500">
                          {months[entry.startMonth - 1]} {entry.startYear} • ₺{entry.monthlyAmount.toLocaleString('tr-TR')} / ay
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => calculateTotalValue(entry)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
                      >
                        Görüntüle
                      </button>
                      <button 
                        onClick={() => handleRemove(entry.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Sil"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
        <p>© 2024 Finansal Analiz ve Raporlama Sistemi. Hesaplamalar virgülden sonraki son iki basamak (round to 2 decimals) baz alınarak yapılmaktadır. Veriler tahmini tarihsel kurlar üzerindendir.</p>
      </footer>
    </div>
  );
};

export default App;
