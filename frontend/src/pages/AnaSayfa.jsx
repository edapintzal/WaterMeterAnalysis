import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'C:/Users/EDA PINTZAL/SayacAnalizPlatformu/frontend/src/App.css'; // CSS DOSYASININ YOLUNUN DOĞRU OLDUĞUNDAN EMİN OL


const AnaSayfa = ({ okumalar, yukleniyor }) => {
    const [seciliYil, setSeciliYil] = useState('Tümü');
    const [seciliAy, setSeciliAy] = useState('Tümü');

    const mevcutYillar = useMemo(() => {
        const yillar = [];
        const guncelYil = new Date().getFullYear();
        for (let i = guncelYil; i >= 2020; i--) yillar.push(i.toString());
        return yillar;
    }, []);

    const aylarListesi = [
        { deger: '01', ad: 'Ocak' }, { deger: '02', ad: 'Şubat' }, { deger: '03', ad: 'Mart' },
        { deger: '04', ad: 'Nisan' }, { deger: '05', ad: 'Mayıs' }, { deger: '06', ad: 'Haziran' },
        { deger: '07', ad: 'Temmuz' }, { deger: '08', ad: 'Ağustos' }, { deger: '09', ad: 'Eylül' },
        { deger: '10', ad: 'Ekim' }, { deger: '11', ad: 'Kasım' }, { deger: '12', ad: 'Aralık' }
    ];

    // ÖZET KARTLARI (KPI) İÇİN HESAPLAMALAR
    const kpiVerileri = useMemo(() => {
        let toplamOkuma = 0;
        let toplamTuketim = 0;
        let anomaliSayisi = 0;

        okumalar.forEach(okuma => {
            if (!okuma.okumaTarihi) return;

            const yil = okuma.okumaTarihi.substring(0, 4);
            const ay = okuma.okumaTarihi.substring(5, 7);

            let tarihUyuyor = false;
            if (seciliYil === 'Tümü') tarihUyuyor = true;
            else if (seciliYil !== 'Tümü' && seciliAy === 'Tümü') tarihUyuyor = (yil === seciliYil);
            else tarihUyuyor = (yil === seciliYil && ay === seciliAy);

            if (tarihUyuyor) {
                const tuketim = Number(okuma.tuketimMiktari || 0);
                toplamOkuma += 1;
                toplamTuketim += tuketim;
                if (tuketim > 15) anomaliSayisi += 1;
            }
        });

        return {
            toplamOkuma,
            toplamTuketim: toplamTuketim.toFixed(2),
            anomaliSayisi
        };
    }, [okumalar, seciliYil, seciliAy]);

    // GRAFİK HESAPLAMALARI
    const grafikVerisi = useMemo(() => {
        const gruplar = {};
        const bugunString = new Date().toISOString().slice(0, 10);
        const guncelYil = new Date().getFullYear();

        if (seciliYil === 'Tümü') {
            for (let i = 2020; i <= guncelYil; i++) gruplar[i.toString()] = 0;
        } else if (seciliYil !== 'Tümü' && seciliAy === 'Tümü') {
            for (let i = 1; i <= 12; i++) gruplar[String(i).padStart(2, '0')] = 0;
        } else if (seciliYil !== 'Tümü' && seciliAy !== 'Tümü') {
            const gunSayisi = new Date(Number(seciliYil), Number(seciliAy), 0).getDate();
            for (let i = 1; i <= gunSayisi; i++) gruplar[String(i).padStart(2, '0')] = 0;
        }

        for (let i = 0; i < okumalar.length; i++) {
            const okuma = okumalar[i];
            if (!okuma.okumaTarihi) continue;

            const tarihString = okuma.okumaTarihi.substring(0, 10);
            if (tarihString > bugunString) continue;

            const yil = tarihString.substring(0, 4);
            const ay = tarihString.substring(5, 7);
            const gun = tarihString.substring(8, 10);
            const tuketim = Number(okuma.tuketimMiktari || 0);

            if (seciliYil === 'Tümü') {
                if (gruplar[yil] !== undefined) gruplar[yil] += tuketim;
            } else if (seciliYil === yil) {
                if (seciliAy === 'Tümü') {
                    if (gruplar[ay] !== undefined) gruplar[ay] += tuketim;
                } else if (seciliAy === ay) {
                    if (gruplar[gun] !== undefined) gruplar[gun] += tuketim;
                }
            }
        }

        return Object.keys(gruplar).sort().map(key => {
            let etiket = key;
            if (seciliYil !== 'Tümü' && seciliAy === 'Tümü') {
                const ayBul = aylarListesi.find(a => a.deger === key);
                etiket = ayBul ? ayBul.ad : key;
            }
            return { tarih: etiket, toplamTuketim: Number(gruplar[key].toFixed(2)) };
        });
    }, [okumalar, seciliYil, seciliAy]);

    if (yukleniyor) return <p style={{ color: 'var(--metin-rengi)' }}>Dashboard yükleniyor...</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ÜST FİLTRELEME BÖLÜMÜ (Kağıtta çıkmaması için gizle-print eklendi) */}
            <div className="gizle-print" style={{ backgroundColor: 'var(--kutu-arkaplan)', padding: '15px 20px', borderRadius: '8px', borderTop: '4px solid var(--mavi-koyu)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--metin-rengi)' }}>Genel Durum Özeti</h3>
                <div style={{ display: 'flex', gap: '15px' }}>

                    {/* YIL SEÇİM KUTUSU */}
                    <select
                        value={seciliYil}
                        onChange={(e) => { setSeciliYil(e.target.value); setSeciliAy('Tümü'); }}
                        style={{
                            backgroundColor: '#2C5EAD',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            height: '40px',
                            marginTop: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <option value="Tümü">Tüm Yıllar</option>
                        {mevcutYillar.map(yil => <option key={yil} value={yil}>{yil}</option>)}
                    </select>

                    {/* AY SEÇİM KUTUSU */}
                    <select
                        value={seciliAy}
                        onChange={(e) => setSeciliAy(e.target.value)}
                        disabled={seciliYil === 'Tümü'}
                        style={{
                            backgroundColor: '#2C5EAD',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            height: '40px',
                            marginTop: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <option value="Tümü">Tüm Aylar</option>
                        {aylarListesi.map(ay => <option key={ay.deger} value={ay.deger}>{ay.ad}</option>)}
                    </select>
                    
                    {/* YAZDIR / RAPOR AL BUTONU */}
                    <button
                        onClick={() => window.print()}
                        style={{
                            backgroundColor: '#2C5EAD',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            height: '40px',
                            marginTop: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🖨️ Rapor Çıktısı Al
                    </button>
                </div>
            </div>

            {/* YALNIZCA ÇIKTI ALINIRKEN KAĞITTA ÇIKACAK OLAN RESMİ RAPOR BAŞLIĞI */}
            <div className="sadece-print" style={{ marginBottom: '20px' }}>
                
                {/* ANTETLİ KAĞIT BAŞLIĞI (Logo ve Kurum Adı Yan Yana) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                    <img 
                        src="/sudamlasi.png" 
                        alt="Logo" 
                        style={{ width: '80px', height: 'auto' }} 
                    />
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ margin: '0 0 5px 0', color: '#000' }}>Sayaç Analizi Özet Raporu</h2>
                        <h4 style={{ margin: '0', color: '#555', fontWeight: 'normal' }}>Su ve Kanalizasyon İdaresi Genel Müdürlüğü</h4>
                    </div>
                </div>

                {/* RAPOR FİLTRE DETAYLARI */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#000' }}>
                    <div>
                        <p style={{ margin: '0 0 5px 0' }}>
                            <strong>Dönem:</strong> {seciliYil !== 'Tümü' ? seciliYil : 'Tüm Yıllar'} / {seciliAy !== 'Tümü' ? aylarListesi.find(a => a.deger === seciliAy)?.ad : 'Tüm Aylar'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', color: '#555' }}>
                        <p style={{ margin: '0' }}><strong>Rapor Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
                        <p style={{ margin: '0' }}><strong>Saat:</strong> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            {/* KPI ÖZET KARTLARI */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                {/* 1. Kart: Toplam Okuma */}
                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid var(--mavi-orta)', border: '1px solid var(--kenarlik)' }}>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--metin-rengi)', fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>💧 KAYITLI OKUMA</p>
                    <h2 style={{ margin: 0, color: 'var(--metin-rengi)', fontSize: '28px' }}>{kpiVerileri.toplamOkuma} <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.6 }}>Adet</span></h2>
                </div>

                {/* 2. Kart: Toplam Tüketim */}
                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid #10b981', border: '1px solid var(--kenarlik)' }}>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--metin-rengi)', fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>🌊 TOPLAM TÜKETİM</p>
                    <h2 style={{ margin: 0, color: 'var(--metin-rengi)', fontSize: '28px' }}>{kpiVerileri.toplamTuketim} <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.6 }}>m³</span></h2>
                </div>

                {/* 3. Kart: Anomali Sayısı */}
                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '5px solid var(--risk-metin)', border: '1px solid var(--kenarlik)' }}>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--metin-rengi)', fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>⚠️ RİSKLİ SAYAÇ (&gt;15m³)</p>
                    <h2 style={{ margin: 0, color: 'var(--risk-metin)', fontSize: '28px' }}>{kpiVerileri.anomaliSayisi} <span style={{ fontSize: '14px', color: 'var(--metin-rengi)', fontWeight: 'normal', opacity: 0.6 }}>Adet</span></h2>
                </div>

            </div>
            
            {/* GRAFİK BÖLÜMÜ */}
            <div style={{ backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid var(--kenarlik)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--metin-rengi)' }}>
                    {seciliYil === 'Tümü' ? 'Yıllara Göre Tüketim Grafiği' :
                        seciliAy === 'Tümü' ? `${seciliYil} Yılı Aylık Tüketim Grafiği` :
                            `${seciliYil} ${aylarListesi.find(a => a.deger === seciliAy)?.ad} Ayı Günlük Tüketim Grafiği`}
                </h3>

                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={grafikVerisi} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--kenarlik)" />
                            <XAxis dataKey="tarih" stroke="var(--metin-rengi)" />
                            <YAxis stroke="var(--metin-rengi)" />
                            <Tooltip
                                formatter={(value) => [`${value} m³`, 'Toplam Tüketim']}
                                contentStyle={{ backgroundColor: 'var(--kutu-arkaplan)', color: 'var(--metin-rengi)', borderColor: 'var(--kenarlik)', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ color: 'var(--metin-rengi)' }} />
                            <Line type="monotone" dataKey="toplamTuketim" name="Tüketim Miktarı" stroke="var(--mavi-orta)" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default AnaSayfa;