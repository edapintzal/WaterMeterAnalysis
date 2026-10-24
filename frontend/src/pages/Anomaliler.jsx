import React, { useState, useMemo } from 'react';
import 'C:/Users/EDA PINTZAL/SayacAnalizPlatformu/frontend/src/App.css';

const Anomaliler = ({ okumalar, yukleniyor }) => {
    // 1. FİLTRE VE ARAMA STATE'LERİ
    const [seciliYil, setSeciliYil] = useState('Tümü');
    const [seciliAy, setSeciliAy] = useState('Tümü');
    const [seciliGun, setSeciliGun] = useState('Tümü');
    const [aramaMetni, setAramaMetni] = useState('');

    // 2. SAYFALAMA STATE'LERİ
    const [sayfa, setSayfa] = useState(1);
    const kayitSayisi = 100;

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

    const mevcutGunler = useMemo(() => {
        if (seciliYil === 'Tümü' || seciliAy === 'Tümü') {
            return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
        }
        const gunSayisi = new Date(Number(seciliYil), Number(seciliAy), 0).getDate();
        return Array.from({ length: gunSayisi }, (_, i) => String(i + 1).padStart(2, '0'));
    }, [seciliYil, seciliAy]);

    // ÜÇLÜ FİLTRE: Tüketim > 15 VE Tarih Uygunluğu VE Arama Metni
    const riskliOkumalar = useMemo(() => {
        return okumalar.filter(okuma => {
            const tuketim = Number(okuma.tuketimMiktari || 0);
            if (tuketim <= 15) return false;

            if (!okuma.okumaTarihi) return false;

            const yil = okuma.okumaTarihi.substring(0, 4);
            const ay = okuma.okumaTarihi.substring(5, 7);
            const gun = okuma.okumaTarihi.substring(8, 10);

            let tarihUyuyor = false;
            if (seciliYil === 'Tümü') {
                tarihUyuyor = true;
            } else if (seciliAy === 'Tümü') {
                tarihUyuyor = (yil === seciliYil);
            } else if (seciliGun === 'Tümü') {
                tarihUyuyor = (yil === seciliYil && ay === seciliAy);
            } else {
                tarihUyuyor = (yil === seciliYil && ay === seciliAy && gun === seciliGun);
            }

            if (!tarihUyuyor) return false;

            if (aramaMetni.trim() !== '') {
                const aramaKucuk = aramaMetni.toLowerCase();
                const adSoyad = okuma.sayac?.abone?.adSoyad?.toLowerCase() || '';
                const seriNo = okuma.sayac?.seriNo?.toLowerCase() || '';
                if (!adSoyad.includes(aramaKucuk) && !seriNo.includes(aramaKucuk)) {
                    return false;
                }
            }

            return true;
        });
    }, [okumalar, seciliYil, seciliAy, seciliGun, aramaMetni]);

    const toplamSayfa = Math.ceil(riskliOkumalar.length / kayitSayisi);
    const baslangicIndex = (sayfa - 1) * kayitSayisi;
    const gosterilecekVeriler = riskliOkumalar.slice(baslangicIndex, baslangicIndex + kayitSayisi);

    if (yukleniyor) return <p style={{ color: 'var(--metin-rengi)' }}>Riskli veriler analiz ediliyor...</p>;

    return (
        <>
            {/* SAYFA İÇİ ÖZEL YAZDIRMA CSS KODLARI */}
            <style>
                {`
                  @media print {
                  /* YATAY (Landscape) format */
                  @page { size: A4 landscape; margin: 15mm; }
                  body, html, #root { background-color: #ffffff !important; color: #000000 !important; }
        
                   /* Ana konteynerin kenar boşluklarını silip tam genişlik veriyoruz */
                   .print-tam-sayfa {
                   padding: 0 !important;
                   box-shadow: none !important;
                   background-color: #ffffff !important;
                   width: 100% !important;
                   max-width: 100% !important;
                   }

                  /* Tablonun çizgilerinin asla kaybolmaması için collapse ve border zorlaması */
                  .anomali-tablo {
                  width: 100% !important;
                  table-layout: fixed !important;
                  font-size: 10px !important;
                  border-collapse: collapse !important;
                  border: 1px solid #000000 !important;
                 }
        
                /* HER BİR HÜCREYE KESİN ÇERÇEVE (Hem border hem iç gölge ile garantiye alıyoruz) */
                 .anomali-tablo th, .anomali-tablo td {
                   padding: 7px 5px !important;
                  word-wrap: break-word !important;
                  overflow-wrap: break-word !important;
                  white-space: normal !important;
                  border: 1px solid #000000 !important;
                  box-shadow: inset 0 0 0 1px #000000 !important;
                  font-size: 15px !important;
                  color: #000000 !important;
                 }

                 /* Başlığın her yeni sayfada düzenli tekrar etmesi */
                 thead { display: table-header-group !important; }
                 tr { page-break-inside: avoid !important; break-inside: avoid !important; }

                /* Rapor başlığının arkaplanını bembeyaz ve yazısını siyah yapıyoruz */
                .sadece-print { display: block !important; background-color: #ffffff !important; color: #000000 !important; }
                .sadece-print * { background-color: #ffffff !important; color: #000000 !important; }
        
                 /* Tablo başlığının beyaz arka plan ve siyah yazıyla çıkmasını sağlıyoruz */
                 .anomali-thead, .anomali-thead tr, .anomali-thead th {
                 background-color: #ffffff !important;
                 color: #000000 !important;
                 font-weight: bold !important;
                 border: 1px solid #000000 !important;
                }

                /* İstenmeyen tüm menüleri ve butonları gizler */
                .gizle-print { display: none !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
               }
           `}
            </style>

            <div className="print-tam-sayfa" style={{ backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

                {/* EKRANDAKİ BAŞLIK (Kağıtta Gizlenir) */}
                <div className="gizle-print" style={{ borderBottom: '2px solid var(--risk-metin)', paddingBottom: '15px', marginBottom: '20px', opacity: 0.9 }}>
                    <h2 style={{ color: 'var(--risk-metin)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        ⚠️ Anomali ve Kaçak Tespiti
                    </h2>
                    <p style={{ color: 'var(--metin-rengi)', margin: 0, opacity: 0.8 }}>
                        Aşağıdaki listede aylık ortalama tüketim sınırını (15 m³) aşan şüpheli sayaç okumaları yer almaktadır.
                    </p>
                </div>

                {/* ÜST FİLTRE VE ARAMA ÇUBUĞU BÖLÜMÜ (Kağıtta Gizlenir) */}
                <div className="gizle-print" style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--kenarlik)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label style={{ color: 'var(--metin-rengi)', marginRight: '10px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Abone, Sözleşme veya Sayaç Ara:</label>
                        <input
                            type="text"
                            placeholder="İsim, abone no, sözleşme veya seri no..."
                            value={aramaMetni}
                            onChange={(e) => { setAramaMetni(e.target.value); setSayfa(1); }}
                            style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ color: 'var(--metin-rengi)', marginRight: '10px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Yıl Seç:</label>
                        <select
                            value={seciliYil}
                            onChange={(e) => { setSeciliYil(e.target.value); setSeciliAy('Tümü'); setSeciliGun('Tümü'); setSayfa(1); }}
                            style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '150px', borderRadius: '4px', border: '1px solid var(--kenarlik)' }}
                        >
                            <option value="Tümü">Tüm Yıllar</option>
                            {mevcutYillar.map(yil => <option key={yil} value={yil}>{yil}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ color: 'var(--metin-rengi)', marginRight: '10px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ay Seç:</label>
                        <select
                            value={seciliAy}
                            onChange={(e) => { setSeciliAy(e.target.value); setSeciliGun('Tümü'); setSayfa(1); }}
                            disabled={seciliYil === 'Tümü'}
                            style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '150px', borderRadius: '4px', border: '1px solid var(--kenarlik)' }}
                        >
                            <option value="Tümü">Tüm Aylar</option>
                            {aylarListesi.map(ay => <option key={ay.deger} value={ay.deger}>{ay.ad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ color: 'var(--metin-rengi)', marginRight: '10px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Gün Seç:</label>
                        <select
                            value={seciliGun}
                            onChange={(e) => { setSeciliGun(e.target.value); setSayfa(1); }}
                            disabled={seciliAy === 'Tümü'}
                            style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '120px', borderRadius: '4px', border: '1px solid var(--kenarlik)' }}
                        >
                            <option value="Tümü">Tüm Günler</option>
                            {mevcutGunler.map(gun => <option key={gun} value={gun}>{gun}</option>)}
                        </select>
                    </div>

                    {/* YAZDIR / RAPOR AL BUTONU */}
                    <button
                        onClick={() => window.print()}
                        style={{
                            backgroundColor: 'var(--mavi-orta)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🖨️ Rapor Çıktısı Al
                    </button>
                </div>

                {/* YALNIZCA ÇIKTI ALINIRKEN KAĞITTA ÇIKACAK OLAN RESMİ RAPOR BAŞLIĞI */}
                <div className="sadece-print" style={{ marginBottom: '20px', display: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                        <img
                            src="/sudamlasi.png"
                            alt="Logo"
                            style={{ width: '80px', height: 'auto' }}
                        />
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ margin: '0 0 5px 0', color: '#000' }}>Anomali Tüketim Raporu</h2>
                            <h4 style={{ margin: '0', color: '#555', fontWeight: 'normal' }}>Su ve Kanalizasyon İdaresi</h4>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#000' }}>
                        <div>
                            <p style={{ margin: '0' }}>
                                <strong>Dönem:</strong> {seciliYil !== 'Tümü' ? seciliYil : 'Tüm Yıllar'} / {seciliAy !== 'Tümü' ? aylarListesi.find(a => a.deger === seciliAy)?.ad : 'Tüm Aylar'} {seciliGun !== 'Tümü' ? `/ ${seciliGun}. Gün` : ''}
                            </p>
                            {aramaMetni && (
                                <p style={{ margin: '0' }}><strong>Arama Kriteri:</strong> {aramaMetni}</p>
                            )}
                        </div>
                        <div style={{ textAlign: 'right', color: '#555' }}>
                            <p style={{ margin: '0' }}><strong>Rapor Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
                            <p style={{ margin: '0' }}><strong>Saat:</strong> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                            {/* TOPLAM KAYIT YAZISI ÇIKTIDAN KALDIRILDI */}
                        </div>
                    </div>
                </div>

                {/* TOPLAM KAYIT BİLGİSİ (SADECE EKRANDA GÖRÜNÜR, ÇIKTIDA GİZLENİR) */}
                <div className="gizle-print" style={{ backgroundColor: 'var(--risk-arkaplan)', padding: '9px 20px', borderRadius: '4px', color: 'var(--risk-metin)', fontWeight: 'bold', border: '1px solid var(--risk-metin)', marginBottom: '15px' }}>
                    Toplam {riskliOkumalar.length} Kayıt
                </div>

                {/* ANA TABLO */}
                <div style={{ width: '100%' }}>
                    <table className="anomali-tablo" border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', borderColor: 'var(--kenarlik)' }}>
                        <thead className="anomali-thead" style={{ backgroundColor: 'var(--risk-metin)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '12px' }}>Abone Adı Soyadı</th>
                                <th style={{ padding: '12px' }}>Sayaç Seri No</th>
                                <th style={{ padding: '12px' }}>Okuma Tarihi</th>
                                <th style={{ padding: '12px' }}>Önceki Endeks</th>
                                <th style={{ padding: '12px' }}>Son Okunan Endeks</th>
                                <th style={{ padding: '12px' }}>Tüketim Miktarı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gosterilecekVeriler.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#fff', fontWeight: 'bold', backgroundColor: '#2C5EAD' }}>
                                        🎉 Tebrikler! Seçili kriterlere göre herhangi bir anomali tespit edilmedi.
                                    </td>
                                </tr>
                            ) : (
                                gosterilecekVeriler.map((okuma) => (
                                    <tr key={okuma.id} style={{ backgroundColor: 'var(--risk-arkaplan)', borderBottom: '1px solid var(--kenarlik)' }}>
                                        <td style={{ color: 'var(--metin-rengi)', padding: '12px', fontWeight: 'bold' }}>{okuma.sayac?.abone?.adSoyad}</td>
                                        <td style={{ color: 'var(--metin-rengi)', padding: '12px' }}>{okuma.sayac?.seriNo}</td>
                                        <td style={{ color: 'var(--metin-rengi)', padding: '12px' }}>{okuma.okumaTarihi.substring(0, 10)}</td>
                                        <td style={{ color: 'var(--metin-rengi)', padding: '12px' }}>{okuma.oncekiEndeks}</td>
                                        <td style={{ color: 'var(--metin-rengi)', padding: '12px', fontWeight: 'bold' }}>{okuma.guncelEndeks}</td>
                                        <td style={{ padding: '12px', color: 'var(--risk-metin)', fontWeight: '900', fontSize: '16px' }}>
                                            {okuma.tuketimMiktari} ⚠️
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* SAYFALAMA */}
                {toplamSayfa > 1 && (
                    <div className="gizle-print" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                        <button
                            onClick={() => setSayfa(prev => Math.max(prev - 1, 1))}
                            disabled={sayfa === 1}
                            style={{ padding: '8px 15px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', borderRadius: '4px', cursor: sayfa === 1 ? 'not-allowed' : 'pointer' }}
                        >◀ Önceki</button>
                        <span style={{ fontWeight: 'bold', color: 'var(--metin-rengi)' }}>Sayfa {sayfa} / {toplamSayfa}</span>
                        <button
                            onClick={() => setSayfa(prev => Math.min(prev + 1, toplamSayfa))}
                            disabled={sayfa === toplamSayfa}
                            style={{ padding: '8px 15px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', borderRadius: '4px', cursor: sayfa === toplamSayfa ? 'not-allowed' : 'pointer' }}
                        >Sonraki ▶</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Anomaliler;