
import React, { useState, useMemo } from 'react';
import { FoundationType, UnitPrices, EstimationResults } from './types';
import InputField from './components/InputField';
import SummaryCard from './components/SummaryCard';

const App: React.FC = () => {
  // Primary Inputs
  const [area, setArea] = useState<number>(1000);
  const [foundation, setFoundation] = useState<FoundationType>(FoundationType.RADYE);
  const [landPrice, setLandPrice] = useState<number>(5000000);

  // Unit Price Settings
  const [prices, setPrices] = useState<UnitPrices>({
    concrete: 3200,      // TL / m3
    iron: 35000,         // TL / ton
    formworkLabor: 450,  // TL / m2
    wallLabor: 200,      // TL / birim
    ironLabor: 3500,     // TL / ton
    membraneLabor: 150,  // TL / m2
  });

  // Calculations
  const results = useMemo((): EstimationResults => {
    // 1. Quantities
    const concreteMult = foundation === FoundationType.RADYE ? 0.45 : 0.33;
    const ironMult = foundation === FoundationType.RADYE ? 0.045 : 0.033;
    
    const concreteQty = area * concreteMult;
    const ironQty = area * ironMult;
    const formworkQty = concreteQty * 7;

    // 2. Costs (Updated based on user specific requests)
    const concreteCost = concreteQty * prices.concrete;
    const ironCost = ironQty * prices.iron;
    const formworkLaborCost = formworkQty * prices.formworkLabor;
    const ironLaborCost = formworkQty * prices.ironLabor;
    const wallLaborCost = formworkQty * prices.wallLabor;
    const membraneLaborCost = formworkQty * prices.membraneLabor;

    const roughTotal = concreteCost + ironCost + formworkLaborCost + ironLaborCost + wallLaborCost + membraneLaborCost;
    const projectTotal = roughTotal / 0.35;
    const landIncludedTotal = projectTotal + landPrice;

    return {
      concreteQty,
      ironQty,
      formworkQty,
      costs: {
        concrete: concreteCost,
        iron: ironCost,
        formworkLabor: formworkLaborCost,
        wallLabor: wallLaborCost,
        ironLabor: ironLaborCost,
        membraneLabor: membraneLaborCost
      },
      roughTotal,
      projectTotal,
      landIncludedTotal
    };
  }, [area, foundation, prices, landPrice]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  const formatNumber = (val: number, unit: string) => 
    `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val)} ${unit}`;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white py-8 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">İnşaat Maliyet Hesaplayıcı</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">Hızlı ve güvenilir kaba inşaat metraj ve bütçe analizi.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="keji.apk" 
              download 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-lg"
              title="Android Uygulamasını İndir"
            >
              <i className="fab fa-android text-xl"></i>
              <div className="text-left leading-none">
                <span className="text-[10px] block opacity-80 uppercase">İndir</span>
                <span>keji.apk</span>
              </div>
            </a>

            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <i className="fas fa-hard-hat text-yellow-400 text-2xl"></i>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Proje Durumu</p>
                <p className="text-sm font-medium">Analiz Hazır</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Area & Foundation */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <i className="fas fa-drafting-compass text-blue-600"></i>
              Proje Temel Bilgileri
            </h2>
            <div className="space-y-4">
              <InputField 
                label="Toplam İnşaat Alanı (m²)" 
                value={area} 
                onChange={setArea} 
                type="number"
                icon="fa-vector-square"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Temel Tipi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFoundation(FoundationType.RADYE)}
                    className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${foundation === FoundationType.RADYE ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Radye Temel
                  </button>
                  <button 
                    onClick={() => setFoundation(FoundationType.SUREKLI)}
                    className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${foundation === FoundationType.SUREKLI ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Sürekli Temel
                  </button>
                </div>
              </div>

              <InputField 
                label="Arsa İstene Bedeli (TL)" 
                value={landPrice} 
                onChange={setLandPrice} 
                type="number"
                icon="fa-map-marked-alt"
              />
            </div>
          </section>

          {/* Unit Price Controls */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <i className="fas fa-tags text-emerald-600"></i>
              Birim Fiyat ve İşçilik Ayarları
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Beton Birim Fiyat (TL/m³)" 
                value={prices.concrete} 
                onChange={(v) => setPrices(prev => ({...prev, concrete: v}))} 
              />
              <InputField 
                label="Demir Birim Fiyat (TL/ton)" 
                value={prices.iron} 
                onChange={(v) => setPrices(prev => ({...prev, iron: v}))} 
              />
              <InputField 
                label="Kalıp İşçilik (TL/m²)" 
                value={prices.formworkLabor} 
                onChange={(v) => setPrices(prev => ({...prev, formworkLabor: v}))} 
              />
              <InputField 
                label="Demir İşçilik (TL/birim)" 
                value={prices.ironLabor} 
                onChange={(v) => setPrices(prev => ({...prev, ironLabor: v}))} 
              />
              <InputField 
                label="Duvar İşçilik (TL/birim)" 
                value={prices.wallLabor} 
                onChange={(v) => setPrices(prev => ({...prev, wallLabor: v}))} 
              />
              <InputField 
                label="Membran Yalıtım (TL/m²)" 
                value={prices.membraneLabor} 
                onChange={(v) => setPrices(prev => ({...prev, membraneLabor: v}))} 
              />
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metraj Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard 
              label="Beton Miktarı" 
              value={formatNumber(results.concreteQty, 'm³')} 
              icon="fa-fill-drip" 
              color="blue"
            />
            <SummaryCard 
              label="Demir Miktarı" 
              value={formatNumber(results.ironQty, 'ton')} 
              icon="fa-bars-staggered" 
              color="slate"
            />
            <SummaryCard 
              label="Kalıp Miktarı" 
              value={formatNumber(results.formworkQty, 'm²')} 
              icon="fa-layer-group" 
              color="orange"
            />
          </div>

          {/* Detailed Cost Breakdown */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <i className="fas fa-calculator text-slate-600"></i>
                Kaba İnşaat Maliyet Detayları
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-slate-500 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Kalem</th>
                    <th className="px-6 py-3 font-semibold text-right">Maliyet (TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Beton Toplam Maliyeti</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.concrete)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Demir Toplam Maliyeti</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.iron)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Kalıp İşçilik Ücreti</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.formworkLabor)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Demir İşçilik Ücreti</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.ironLabor)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Duvar İşçilik Ücreti</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.wallLabor)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">Membran Yalıtım İşçilik</td>
                    <td className="px-6 py-4 text-sm text-right font-mono">{formatCurrency(results.costs.membraneLabor)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-900 text-white">
                  <tr>
                    <td className="px-6 py-5 text-base font-bold">Kaba İnşaat Toplamı</td>
                    <td className="px-6 py-5 text-xl text-right font-bold">{formatCurrency(results.roughTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Final Totals Section */}
          <section className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Toplam Proje Maliyeti</h3>
                    <p className="text-4xl font-extrabold">{formatCurrency(results.projectTotal)}</p>
                    <p className="text-xs text-indigo-200 mt-2 italic opacity-80">
                      * Kaba inşaat maliyetinin 0.35 katsayısına bölünmesiyle hesaplanmıştır.
                    </p>
                  </div>
                  <div className="h-12 w-px bg-white/20 hidden md:block"></div>
                  <div>
                    <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Arsa Dahil Toplam</h3>
                    <p className="text-4xl font-extrabold text-yellow-300">{formatCurrency(results.landIncludedTotal)}</p>
                  </div>
               </div>
               <i className="fas fa-coins absolute -right-8 -bottom-8 text-white/10 text-9xl transform -rotate-12 pointer-events-none"></i>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-start gap-4">
               <div className="bg-amber-50 p-3 rounded-full">
                  <i className="fas fa-info-circle text-amber-600"></i>
               </div>
               <div className="text-sm text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Hesaplama Notu:</p>
                  Hesaplamalar girdiğiniz toplam inşaat alanı ({area} m²) ve {foundation === FoundationType.RADYE ? 'Radye' : 'Sürekli'} temel seçimine göre piyasa ortalaması katsayılar kullanılarak yapılmıştır. Bu sonuçlar ön keşif niteliğindedir.
               </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} İnşaat Maliyet Analiz Aracı. Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default App;
