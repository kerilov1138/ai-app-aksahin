
import React, { useState, useEffect } from 'react';
import { DebtEntry, MonthlyRate, SummaryReport, CalculationResult } from './types';
import { fetchHistoricalRates } from './geminiService';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DebtEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SummaryReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states - Default to current data point
  const [clientName, setClientName] = useState('');
  const [startYear, setStartYear] = useState(2026);
  const [startMonth, setStartMonth] = useState(2);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(0);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  // Extend years to 2026
  const years = Array.from({ length: 22 }, (_, i) => 2026 - i);

  const calculateTotalValue = async (entry: DebtEntry) => {
    setLoading(true);
    setError(null);
    try {
      // Set current analysis end point to February 2026 (last available data point)
      const endYear = 2026;
      const endMonth = 2;

      const rates = await fetchHistoricalRates(entry.startYear, entry.startMonth, endYear, endMonth);
      
      let totalTry = 0;
      let totalUsd = 0;
      let totalEur = 0;
      let totalGold = 0;

      const results: CalculationResult[] = rates.map(rate => {
        // Precision: Round each monthly conversion to 2 decimal places
        const usdVal = Number((entry.monthlyAmount / rate.usd).toFixed(2));
        const eurVal = Number((entry.monthlyAmount / rate.eur).toFixed(2));
        const goldVal = Number((entry.monthlyAmount / rate.gold).toFixed(2));

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
        totalUsd: Number(totalUsd.toFixed(2)),
        totalEur: Number(totalEur.toFixed(2)),
        totalGold: Number(totalGold.toFixed(2)),
        results
      });
    } catch (err) {
      setError("Veriler işlenirken bir hata oluştu.");
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Borç Varlık Analizi</h1>
          <p className="mt-2 text-sm text-gray-500">2026/02 itibariyle güncel yerel veri seti üzerinden analiz.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold shadow-sm border border-green-100 uppercase tracking-widest">
          <i className="fa-solid fa-database animate-pulse"></i>
          Dahili Veri: 2026/02 Güncel
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Müşteri/Borç Bilgisi</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kişi / Firma İsmi</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white transition"
                  placeholder="Müşteri Adı"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlangıç Yılı</label>
                  <select 
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlangıç Ayı</label>
                  <select 
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Aylık Sabit Tutar (TRY)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 font-bold">₺</span>
                  <input 
                    type="number" 
                    value={monthlyAmount || ''}
                    onChange={(e) => setMonthlyAmount(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                {loading ? 'Hesaplanıyor...' : 'Rapor Oluştur'}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-8 space-y-8">
          {selectedEntry ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Toplam Borç</p>
                  <p className="text-xl font-black text-gray-900">₺{selectedEntry.totalTry.toLocaleString('tr-TR')}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Toplam Dolar</p>
                  <p className="text-xl font-black text-gray-900">${selectedEntry.totalUsd.toLocaleString('en-US')}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Toplam Euro</p>
                  <p className="text-xl font-black text-gray-900">€{selectedEntry.totalEur.toLocaleString('de-DE')}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-amber-500">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Gram Altın</p>
                  <p className="text-xl font-black text-gray-900">{selectedEntry.totalGold.toFixed(2)} gr</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest">Aylık Kur ve Değer Tablosu</h3>
                  <span className="text-[10px] text-gray-400 italic">Tüm hesaplamalar 2 hane hassasiyetle yapılmıştır.</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase border-r border-gray-50">Dönem</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-blue-500 uppercase">Kur (USD)</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-blue-600 uppercase border-r border-gray-50">Değer ($)</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-emerald-500 uppercase">Kur (EUR)</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-emerald-600 uppercase border-r border-gray-50">Değer (€)</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-amber-500 uppercase">Kur (Altın)</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-amber-600 uppercase">Değer (gr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedEntry.results.map((res, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-xs font-bold text-gray-700 border-r border-gray-50">{res.monthLabel}</td>
                          <td className="px-4 py-3 text-xs text-right text-gray-400 italic">₺{res.usdRate.toFixed(4)}</td>
                          <td className="px-4 py-3 text-xs text-right font-black text-blue-600 border-r border-gray-50">${res.amountUsd.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-right text-gray-400 italic">₺{res.eurRate.toFixed(4)}</td>
                          <td className="px-4 py-3 text-xs text-right font-black text-emerald-600 border-r border-gray-50">€{res.amountEur.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-right text-gray-400 italic">₺{res.goldRate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-right font-black text-amber-600">{res.amountGold.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedEntry.results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="monthLabel" tick={{fontSize: 9, fontWeight: 'bold'}} stroke="#cbd5e1" />
                    <YAxis tick={{fontSize: 9, fontWeight: 'bold'}} stroke="#cbd5e1" />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="rect" />
                    <Area type="stepAfter" dataKey="amountUsd" name="Dolar ($)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={3} />
                    <Area type="stepAfter" dataKey="amountEur" name="Euro (€)" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
              <i className="fa-solid fa-receipt text-5xl text-gray-200 mb-4"></i>
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Rapor Bekleniyor</h3>
              <p className="text-sm text-gray-300">İnternet bağlantısı gerektirmeyen yerel verilerle anında analiz yapabilirsiniz.</p>
            </div>
          )}

          {entries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kayıt Geçmişi</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {entries.map(entry => (
                  <li key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-black">
                        {entry.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{entry.clientName}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Başlangıç: {months[entry.startMonth-1]} {entry.startYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => calculateTotalValue(entry)} className="text-[10px] font-black bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 transition">DETAY</button>
                      <button onClick={() => handleRemove(entry.id)} className="text-gray-300 hover:text-red-500 p-2"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 pt-8 border-t border-gray-100 text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest">
        Veri Seti: 2005 - 2026/02 • İhtilaf durumunda resmi TCMB verileri esastır.
      </footer>
    </div>
  );
};

export default App;
