import React, { useState, useMemo, useEffect } from 'react';
import 'C:/Users/EDA PINTZAL/SayacAnalizPlatformu/frontend/src/App.css';

const Okumalar = ({ okumalar, yukleniyor }) => {
    const [seciliYil, setSeciliYil] = useState('Tümü');
    const [seciliAy, setSeciliAy] = useState('Tümü');
    const [seciliGun, setSeciliGun] = useState('Tümü');
    const [seciliAboneTipi, setSeciliAboneTipi] = useState('Tümü');
    const [aramaMetni, setAramaMetni] = useState('');

    const [sayfa, setSayfa] = useState(1);
    const kayitSayisi = 100;

    const [modalAcik, setModalAcik] = useState(false);
    const [seciliFatura, setSeciliFatura] = useState(null);

    const [modalSekme, setModalSekme] = useState('okuma');

    const [aramaTipi, setAramaTipi] = useState('aboneNo');
    const [aramaDegeri, setAramaDegeri] = useState('');
    const [bulunanAboneAdi, setBulunanAboneAdi] = useState('');
    const [bulunanSayaçSeriNo, setBulunanSayaçSeriNo] = useState('');

    const [tarifeler, setTarifeler] = useState([]);

    // ilkEndeks state'den tamamen silindi
    const [yeniAboneKayıt, setYeniAboneKayıt] = useState({
        adSoyad: '',
        adres: '',
        aboneNo: '',
        sozlesmeNo: '',
        sayacSeriNo: '',
        aboneTipi: ''
    });

    const [yeniKayıt, setYeniKayıt] = useState({
        sayacSeriNo: '',
        oncekiEndeks: 0,
        guncelEndeks: '',
        okumaTarihi: new Date().toISOString().substring(0, 10)
    });

    useEffect(() => {
        const tarifeleriGetir = async () => {
            try {
                const response = await fetch('http://localhost:8000/tarife/liste');
                if (response.ok) {
                    const data = await response.json();
                    setTarifeler(data);

                    if (data.length > 0) {
                        setYeniAboneKayıt(prev => ({ ...prev, aboneTipi: data[0].aboneTipi }));
                    }
                }
            } catch (error) {
                console.error("Tarifeler çekilirken hata oluştu:", error);
                setTarifeler([{ id: 1, aboneTipi: 'Mesken' }, { id: 2, aboneTipi: 'İşyeri' }]);
                setYeniAboneKayıt(prev => ({ ...prev, aboneTipi: 'Mesken' }));
            }
        };
        tarifeleriGetir();
    }, []);

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

    const handleAramaBilgisiDegisti = (deger) => {
        setAramaDegeri(deger);

        if (!deger || deger.trim() === '') {
            setBulunanAboneAdi('');
            setBulunanSayaçSeriNo('');
            setYeniKayıt({ ...yeniKayıt, sayacSeriNo: '', oncekiEndeks: 0 });
            return;
        }

        const eslesenOkuma = okumalar.find(o => {
            const aboneNo = o.sayac?.abone?.aboneNo || '';
            const sozlesmeNo = o.sayac?.sozlesmeNo || '';

            if (aramaTipi === 'aboneNo') {
                return aboneNo.toLowerCase() === deger.toLowerCase();
            } else {
                return sozlesmeNo.toLowerCase() === deger.toLowerCase();
            }
        });

        if (eslesenOkuma && eslesenOkuma.sayac) {
            const seriNo = eslesenOkuma.sayac.seriNo || '';
            const aboneAdi = eslesenOkuma.sayac.abone?.adSoyad || 'Bilinmiyor';

            setBulunanAboneAdi(aboneAdi);
            setBulunanSayaçSeriNo(seriNo);

            const sayacaAitOkumalar = okumalar.filter(o => o.sayac?.seriNo?.toLowerCase() === seriNo.toLowerCase());
            let sonEndeks = 0;
            if (sayacaAitOkumalar.length > 0) {
                sayacaAitOkumalar.sort((a, b) => new Date(b.okumaTarihi) - new Date(a.okumaTarihi));
                sonEndeks = sayacaAitOkumalar[0].guncelEndeks || 0;
            }

            setYeniKayıt({
                ...yeniKayıt,
                sayacSeriNo: seriNo,
                oncekiEndeks: sonEndeks
            });
        } else {
            setBulunanAboneAdi('❌ Abone veya Sayaç Bulunamadı');
            setBulunanSayaçSeriNo('');
            setYeniKayıt({ ...yeniKayıt, sayacSeriNo: '', oncekiEndeks: 0 });
        }
    };

    const handleSekmeDegistir = (sekme) => {
        setModalSekme(sekme);
        if (sekme === 'yeniAbone') {
            const rastgeleAboneNo = Math.floor(100000 + Math.random() * 900000).toString();
            const rastgeleSozlesmeNo = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const rastgeleSeriNo = 'SYC-' + Math.floor(100000 + Math.random() * 900000).toString();

            setYeniAboneKayıt({
                adSoyad: '',
                adres: '',
                aboneNo: rastgeleAboneNo,
                sozlesmeNo: rastgeleSozlesmeNo,
                sayacSeriNo: rastgeleSeriNo,
                aboneTipi: tarifeler.length > 0 ? tarifeler[0].aboneTipi : ''
            });
        }
    };

    const handleYeniAboneKaydet = async (e) => {
        e.preventDefault();

        const gonderilecekVeri = {
            adSoyad: yeniAboneKayıt.adSoyad,
            adres: yeniAboneKayıt.adres,
            aboneNo: yeniAboneKayıt.aboneNo,
            aboneTipi: yeniAboneKayıt.aboneTipi,
            sayac: {
                sozlesmeNo: yeniAboneKayıt.sozlesmeNo,
                seriNo: yeniAboneKayıt.sayacSeriNo,
                ilkEndeks: 0 // İlk endeksi sabit 0 olarak gönderiyoruz
            }
        };

        try {
            const response = await fetch('http://localhost:8000/abone/ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gonderilecekVeri),
            });

            if (response.ok) {
                alert("Tebrikler! Yeni abone kaydedildi!");
                window.location.reload();
            } else {
                const hataVerisi = await response.json();
                alert("Hata: " + hataVerisi.message);
            }
        } catch (error) {
            alert("Sunucuya ulaşılamıyor.");
        }
    };

    const handleKaydet = async (e) => {
        e.preventDefault();

        if (!yeniKayıt.sayacSeriNo) {
            alert("Lütfen geçerli bir Abone No veya Sözleşme No girerek sayaç eşleşmesini sağlayın.");
            return;
        }

        const onceki = Number(yeniKayıt.oncekiEndeks);
        const guncel = Number(yeniKayıt.guncelEndeks);

        if (guncel < onceki) {
            alert("⚠️ Hata: Güncel endeks, önceki endeksinden küçük olamaz!");
            return;
        }

        const hesaplananTuketim = Math.round((guncel - onceki) * 100.0) / 100.0;
        const secilenSayacObjesi = okumalar.find(o => o.sayac?.seriNo === yeniKayıt.sayacSeriNo)?.sayac;

        const gonderilecekVeri = {
            okumaTarihi: yeniKayıt.okumaTarihi + "T00:00:00",
            oncekiEndeks: onceki,
            guncelEndeks: guncel,
            tuketimMiktari: hesaplananTuketim,
            sayac: {
                id: secilenSayacObjesi ? secilenSayacObjesi.id : null,
                seriNo: yeniKayıt.sayacSeriNo
            }
        };

        try {
            const response = await fetch('http://localhost:8000/okuma/ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gonderilecekVeri),
            });

            if (response.ok) {
                alert(`Tebrikler! Okuma kaydedildi. Aylık Tüketim: ${hesaplananTuketim} m³ 🚀`);
                setModalAcik(false);
                setAramaDegeri('');
                setBulunanAboneAdi('');
                setBulunanSayaçSeriNo('');
                setYeniKayıt({ sayacSeriNo: '', oncekiEndeks: 0, guncelEndeks: '', okumaTarihi: new Date().toISOString().substring(0, 10) });
                window.location.reload();
            } else {
                alert("Kayıt sırasında sunucu kaynaklı bir hata oluştu.");
            }
        } catch (error) {
            alert("Sunucuya ulaşılamıyor.");
        }
    };

    const faturaYazdir = () => {
        const printWindow = window.open('', '_blank');
        const faturaHTML = document.getElementById('fatura-alani').innerHTML;

        printWindow.document.write(`
        <html>
            <head>
                <title>Su İhbarnamesi</title>
                <style>
                    @page { size: A4 portrait; margin: 20mm; }
                    body { font-family: Arial, sans-serif; padding: 0; margin: 0; color: black; background: white; text-align: center; }
                    .fatura-container { width: 100%; max-width: 750px; margin: 0 auto; background: white; text-align: left; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; text-align: center; }
                    th, td { border: 1px solid #ccc; padding: 8px; }
                    th { background-color: #0056b3 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .bilgi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 20px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                    .tutar-kutu { display: flex; justify-content: space-between; align-items: center; background-color: #f4f8fb !important; padding: 20px; border-radius: 8px; border: 1px solid #cce0f0; margin-bottom: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                </style>
            </head>
            <body>
                <div class="fatura-container">
                    ${faturaHTML}
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
        </html>
        `);
        printWindow.document.close();
    };

    const filtrelenmisTablo = useMemo(() => {
        return okumalar.filter(okuma => {
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

            if (seciliAboneTipi !== 'Tümü') {
                const aboneTipiAd = okuma.sayac?.abone?.tarife?.aboneTipi || okuma.sayac?.abone?.aboneTipi || '';
                if (aboneTipiAd !== seciliAboneTipi) return false;
            }

            if (aramaMetni.trim() !== '') {
                const aramaKucuk = aramaMetni.toLowerCase();
                const adSoyad = okuma.sayac?.abone?.adSoyad?.toLowerCase() || '';
                const seriNo = okuma.sayac?.seriNo?.toLowerCase() || '';
                const aboneNo = okuma.sayac?.abone?.aboneNo?.toLowerCase() || '';
                const sozlesmeNo = okuma.sayac?.sozlesmeNo?.toLowerCase() || '';
                const adres = okuma.sayac?.abone?.adres?.toLowerCase() || '';
                if (!adSoyad.includes(aramaKucuk) && !seriNo.includes(aramaKucuk) && !aboneNo.includes(aramaKucuk) && !sozlesmeNo.includes(aramaKucuk) && !adres.includes(aramaKucuk)) return false;
            }
            return true;
        });
    }, [okumalar, seciliYil, seciliAy, seciliGun, seciliAboneTipi, aramaMetni]);

    const toplamSayfa = Math.ceil(filtrelenmisTablo.length / kayitSayisi);
    const baslangicIndex = (sayfa - 1) * kayitSayisi;
    const gosterilecekVeriler = filtrelenmisTablo.slice(baslangicIndex, baslangicIndex + kayitSayisi);

    if (yukleniyor) return <p style={{ color: 'var(--metin-rengi)' }}>Veriler işleniyor...</p>;

    return (
        <>
            <style>
                {`
                @media print {
                    @page { size: A4 landscape; margin: 12mm; }
                    body, html, #root { background-color: #ffffff !important; color: #000000 !important; }
                    
                    .print-tam-sayfa {
                        padding: 0 !important;
                        box-shadow: none !important;
                        background-color: #ffffff !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    .okuma-tablo {
                        width: 100% !important;
                        table-layout: fixed !important;
                        font-size: 10px !important;
                        border-collapse: collapse !important;
                        border: 1px solid #000000 !important;
                    }
                    
                    .okuma-tablo th, .okuma-tablo td {
                        padding: 7px 5px !important;
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                        white-space: normal !important;
                        border: 1px solid #000000 !important;
                        box-shadow: inset 0 0 0 1px #000000 !important;
                        font-size: 10px !important;
                        color: #000000 !important;
                    }

                    thead { display: table-header-group !important; }
                    tr { page-break-inside: avoid !important; break-inside: avoid !important; }

                    .sadece-print { display: block !important; background-color: #ffffff !important; color: #000000 !important; }
                    .sadece-print * { background-color: #ffffff !important; color: #000000 !important; }
                    
                    .okuma-thead, .okuma-thead tr, .okuma-thead th {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        font-weight: bold !important;
                        border-bottom: 2px solid #000000 !important;
                    }

                    .gizle-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
            <div className="print-tam-sayfa" style={{ backgroundColor: 'var(--kutu-arkaplan)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>

                <div className="gizle-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--kenarlik)', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                    <div style={{ flex: '2', minWidth: '220px' }}>
                        <label style={{ color: 'var(--metin-rengi)', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Abone veya Sayaç Ara:</label>
                        <input type="text" placeholder="İsim, abone no, sözleşme..." value={aramaMetni} onChange={(e) => { setAramaMetni(e.target.value); setSayfa(1); }} style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px 12px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', boxSizing: 'border-box', height: '40px' }} />
                    </div>

                    <div style={{ width: '130px' }}>
                        <label style={{ color: 'var(--metin-rengi)', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Abone Tipi:</label>
                        <select value={seciliAboneTipi} onChange={(e) => { setSeciliAboneTipi(e.target.value); setSayfa(1); }} style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', height: '40px' }}>
                            <option value="Tümü">Tüm Tipler</option>
                            {tarifeler.map(t => (
                                <option key={t.id || t.aboneTipi} value={t.aboneTipi}>{t.aboneTipi}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ width: '110px' }}>
                        <label style={{ color: 'var(--metin-rengi)', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Yıl:</label>
                        <select value={seciliYil} onChange={(e) => { setSeciliYil(e.target.value); setSeciliAy('Tümü'); setSeciliGun('Tümü'); setSayfa(1); }} style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', height: '40px' }}>
                            <option value="Tümü">Tüm Yıllar</option>
                            {mevcutYillar.map(yil => <option key={yil} value={yil}>{yil}</option>)}
                        </select>
                    </div>

                    <div style={{ width: '110px' }}>
                        <label style={{ color: 'var(--metin-rengi)', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Ay:</label>
                        <select value={seciliAy} onChange={(e) => { setSeciliAy(e.target.value); setSeciliGun('Tümü'); setSayfa(1); }} disabled={seciliYil === 'Tümü'} style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', height: '40px' }}>
                            <option value="Tümü">Tüm Aylar</option>
                            {aylarListesi.map(ay => <option key={ay.deger} value={ay.deger}>{ay.ad}</option>)}
                        </select>
                    </div>

                    <div style={{ width: '110px' }}>
                        <label style={{ color: 'var(--metin-rengi)', fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Gün:</label>
                        <select value={seciliGun} onChange={(e) => { setSeciliGun(e.target.value); setSayfa(1); }} disabled={seciliAy === 'Tümü'} style={{ backgroundColor: '#2C5EAD', color: '#fff', padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid var(--kenarlik)', height: '40px' }}>
                            <option value="Tümü">Tüm Günler</option>
                            {mevcutGunler.map(gun => <option key={gun} value={gun}>{gun}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        <button onClick={() => setModalAcik(true)} style={{ backgroundColor: 'var(--mavi-koyu)', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>+ Yeni Ekle</button>
                        <button onClick={() => window.print()} style={{ backgroundColor: 'var(--mavi-orta)', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: '40px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>🖨️ Rapor Al</button>
                    </div>
                </div>

                <div className="sadece-print" style={{ marginBottom: '20px', display: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                        <img src="/sudamlasi.png" alt="Logo" style={{ width: '80px', height: 'auto' }} />
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ margin: '0 0 5px 0', color: '#000' }}>Sayaç Okuma Raporu</h2>
                            <h4 style={{ margin: '0', color: '#555', fontWeight: 'normal' }}>Su ve Kanalizasyon İdaresi Genel Müdürlüğü</h4>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px', color: '#000', marginBottom: '15px' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                            <p style={{ margin: 0 }}><strong>Dönem:</strong> {seciliYil !== 'Tümü' ? seciliYil : 'Tüm Yıllar'} / {seciliAy !== 'Tümü' ? aylarListesi.find(a => a.deger === seciliAy)?.ad : 'Tüm Aylar'} {seciliGun !== 'Tümü' ? `/ ${seciliGun}. Gün` : ''}</p>

                            {seciliAboneTipi !== 'Tümü' && (
                                <p style={{ margin: 0 }}><strong>Abone Tipi:</strong> {seciliAboneTipi}</p>
                            )}

                            {aramaMetni && (
                                <p style={{ margin: 0 }}><strong>Arama Kriteri:</strong> {aramaMetni}</p>
                            )}
                        </div>

                        <div style={{ textAlign: 'right', color: '#555' }}>
                            <p style={{ margin: '0' }}><strong>Rapor Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
                            <p style={{ margin: '0' }}><strong>Saat:</strong> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                <h3 className="gizle-print" style={{ color: 'var(--metin-rengi)', marginBottom: '15px' }}>{filtrelenmisTablo.length} Adet Okuma Bulundu</h3>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="okuma-tablo" border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', borderColor: 'var(--kenarlik)', tableLayout: 'fixed', wordBreak: 'break-word' }}>
                        <thead className="okuma-thead" style={{ backgroundColor: 'var(--mavi-orta)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '10px 6px', width: '11%', fontSize: '12px' }}>Abone Adı Soyadı</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Abone No</th>
                                <th style={{ padding: '10px 6px', width: '13%', fontSize: '12px' }}>Adres</th>
                                <th style={{ padding: '10px 6px', width: '10%', fontSize: '12px' }}>Sözleşme No</th>
                                <th style={{ padding: '10px 6px', width: '9%', fontSize: '12px' }}>Sayaç Seri No</th>
                                <th style={{ padding: '10px 6px', width: '8%', fontSize: '12px' }}>Okuma Tarihi</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Okuma Saati</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Önceki Endeks</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Son Endeks</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Tüketim (m³)</th>
                                <th style={{ padding: '10px 6px', width: '7%', fontSize: '12px' }}>Abone Tipi</th>
                                <th className="gizle-print" style={{ padding: '10px 6px', width: '6%', textAlign: 'center', fontSize: '12px' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gosterilecekVeriler.map((okuma) => {
                                const riskliMi = Number(okuma.tuketimMiktari || 0) > 15;
                                const tarihKismi = okuma.okumaTarihi ? okuma.okumaTarihi.substring(0, 10) : '-';
                                const saatKismi = okuma.okumaTarihi && okuma.okumaTarihi.length >= 19 ? okuma.okumaTarihi.substring(11, 19) : '00:00:00';
                                return (
                                    <tr key={okuma.id} style={{ color: 'var(--metin-rengi)', backgroundColor: riskliMi ? 'var(--risk-arkaplan)' : 'transparent', borderBottom: '1px solid var(--kenarlik)', fontSize: '13px' }}>
                                        <td style={{ padding: '10px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>{okuma.sayac?.abone?.adSoyad}</td>
                                        <td style={{ padding: '10px 6px', verticalAlign: 'middle' }}>{okuma.sayac?.abone?.aboneNo}</td>
                                        <td style={{ padding: '10px 6px', fontSize: '11px', verticalAlign: 'middle' }}>{okuma.sayac?.abone?.adres}</td>
                                        <td style={{ padding: '10px 6px', wordBreak: 'break-all', verticalAlign: 'middle' }}>{okuma.sayac?.sozlesmeNo}</td>
                                        <td style={{ padding: '10px 6px', wordBreak: 'break-all', verticalAlign: 'middle' }}>{okuma.sayac?.seriNo}</td>
                                        <td style={{ padding: '10px 6px', verticalAlign: 'middle', fontSize: '12px' }}>{tarihKismi}</td>
                                        <td style={{ padding: '10px 6px', fontWeight: 'bold', color: '#0056b3', verticalAlign: 'middle', fontSize: '12px' }}>{saatKismi}</td>
                                        <td style={{ padding: '10px 6px', verticalAlign: 'middle' }}>{okuma.oncekiEndeks}</td>
                                        <td style={{ padding: '10px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>{okuma.guncelEndeks}</td>
                                        <td style={{ color: riskliMi ? 'var(--risk-metin)' : 'inherit', padding: '10px 6px', fontWeight: riskliMi ? 'bold' : 'normal', verticalAlign: 'middle' }}>
                                            {okuma.tuketimMiktari} {riskliMi && '⚠️'}
                                        </td>
                                        <td style={{ padding: '10px 6px', fontWeight: 'bold', verticalAlign: 'middle', fontSize: '12px' }}>{okuma.sayac?.abone?.tarife?.aboneTipi || okuma.sayac?.abone?.aboneTipi || '-'}</td>
                                        <td className="gizle-print" style={{ padding: '10px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <button onClick={() => setSeciliFatura(okuma)} style={{ backgroundColor: 'var(--mavi-koyu)', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>📄 Fatura</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {toplamSayfa > 1 && (
                    <div className="gizle-print" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                        <button onClick={() => setSayfa(prev => Math.max(prev - 1, 1))} disabled={sayfa === 1} style={{ padding: '8px 15px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', borderRadius: '4px', cursor: sayfa === 1 ? 'not-allowed' : 'pointer' }}>◀ Önceki</button>
                        <span style={{ fontWeight: 'bold', color: 'var(--metin-rengi)' }}>Sayfa {sayfa} / {toplamSayfa}</span>
                        <button onClick={() => setSayfa(prev => Math.min(prev + 1, toplamSayfa))} disabled={sayfa === toplamSayfa} style={{ padding: '8px 15px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', borderRadius: '4px', cursor: sayfa === toplamSayfa ? 'not-allowed' : 'pointer' }}>Sonraki ▶</button>
                    </div>
                )}

                {seciliFatura && (
                    <div className="gizle-print" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ backgroundColor: 'white', width: '750px', maxWidth: '95vw', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>

                            <div id="fatura-alani" style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0056b3', paddingBottom: '15px', marginBottom: '20px' }}>
                                    <div style={{ width: '90px', textAlign: 'left' }}>
                                        <img src="/sudamlasi.png" alt="Logo" style={{ width: '80px', height: 'auto' }} />
                                    </div>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <h3 style={{ margin: 0, color: '#003366', fontSize: '16px' }}>EDA BELEDİYESİ</h3>
                                        <h4 style={{ margin: '4px 0', color: '#004080', fontSize: '14px' }}>SU VE KANALİZASYON İDARESİ GENEL MÜDÜRLÜĞÜ</h4>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#d9534f' }}>SU FATURASI</p>
                                    </div>
                                    <div style={{ width: '90px', textAlign: 'right' }}>
                                        <img src="/sudamlasi.png" alt="Logo" style={{ width: '80px', height: 'auto' }} />
                                    </div>
                                </div>

                                <div className="bilgi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', marginBottom: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', color: '#000' }}>
                                    <p style={{ margin: 0 }}><strong>Abone Adı:</strong> {seciliFatura.sayac?.abone?.adSoyad || '-'}</p>
                                    <p style={{ margin: 0 }}><strong>Abone No:</strong> {seciliFatura.sayac?.abone?.aboneNo || '-'}</p>
                                    <p style={{ margin: 0 }}><strong>Adres:</strong> {seciliFatura.sayac?.abone?.adres || '-'}</p>
                                    <p style={{ margin: 0 }}><strong>Sözleşme No:</strong> {seciliFatura.sayac?.sozlesmeNo || '-'}</p>
                                    <p style={{ margin: 0 }}><strong>Sayaç Seri No:</strong> {seciliFatura.sayac?.seriNo || '-'}</p>
                                    <p style={{ margin: 0 }}><strong>Abone Tipi:</strong> {seciliFatura.sayac?.abone?.tarife?.aboneTipi || seciliFatura.sayac?.abone?.aboneTipi || 'Mesken'}</p>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', textAlign: 'center', color: '#000' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#0056b3', color: 'white' }}>
                                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Önceki Endeks</th>
                                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Güncel Endeks</th>
                                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Okuma Tarihi</th>
                                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Okuma Saati</th>
                                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Tüketim (m³)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: '1px solid #ccc', padding: '10px' }}>{seciliFatura.oncekiEndeks}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 'bold' }}>{seciliFatura.guncelEndeks}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '10px' }}>{seciliFatura.okumaTarihi ? seciliFatura.okumaTarihi.substring(0, 10) : '-'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 'bold', color: '#0056b3' }}>
                                                {seciliFatura.okumaTarihi && seciliFatura.okumaTarihi.length >= 19 ? seciliFatura.okumaTarihi.substring(11, 19) : '00:00:00'}
                                            </td>
                                            <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: 'bold', color: '#0056b3' }}>{seciliFatura.tuketimMiktari} m³</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="tutar-kutu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4f8fb', padding: '20px', borderRadius: '8px', border: '1px solid #cce0f0', marginBottom: '20px', color: '#000' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}><strong>Son Ödeme Tarihi:</strong></p>
                                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: seciliFatura.faturaTutari === 0 ? '#28a745' : '#d9534f' }}>
                                            {seciliFatura.faturaTutari === 0 || !seciliFatura.sonOdemeTarihi
                                                ? 'Ödeme Gerekmez'
                                                : seciliFatura.sonOdemeTarihi}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}><strong>Toplam Fatura Tutarı:</strong></p>
                                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{seciliFatura.faturaTutari || '0.00'} ₺</p>
                                    </div>
                                </div>

                                {/* Fatura tutarı 0'dan büyükse icra uyarısını göster, değilse gizle */}
                                {seciliFatura.faturaTutari > 0 && (
                                    <p style={{ fontSize: '11px', textAlign: 'center', color: '#777', margin: 0 }}>
                                        VADESİNDE ÖDENMEYEN SU BORÇLARINDAN DOLAYI ABONE VE SUYU KULLANANLAR HAKKINDA İCRA TAKİBİ BAŞLATILIR.
                                    </p>
                                )}
                            </div>

                            <div style={{ padding: '20px 30px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '15px', backgroundColor: '#fafafa', borderRadius: '0 0 8px 8px' }}>
                                <button onClick={() => setSeciliFatura(null)} style={{ padding: '10px 25px', borderRadius: '6px', border: '1px solid #888', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Kapat</button>
                                <button onClick={faturaYazdir} style={{ padding: '10px 25px', borderRadius: '6px', border: 'none', backgroundColor: '#0056b3', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🖨️ Yazdır</button>
                            </div>

                        </div>
                    </div>
                )}

                {modalAcik && (
                    <div className="gizle-print" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'var(--kutu-arkaplan)', padding: '30px', borderRadius: '8px', width: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', borderBottom: '2px solid var(--kenarlik)', marginBottom: '20px' }}>
                                <button onClick={() => handleSekmeDegistir('okuma')} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: 'none', borderBottom: modalSekme === 'okuma' ? '3px solid var(--mavi-koyu)' : 'none', color: modalSekme === 'okuma' ? 'var(--mavi-koyu)' : 'var(--metin-rengi)', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Mevcut Sayaca Okuma Gir</button>
                                <button onClick={() => handleSekmeDegistir('yeniAbone')} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: 'none', borderBottom: modalSekme === 'yeniAbone' ? '3px solid var(--mavi-koyu)' : 'none', color: modalSekme === 'yeniAbone' ? 'var(--mavi-koyu)' : 'var(--metin-rengi)', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Yeni Abone Kaydı Aç</button>
                            </div>

                            {modalSekme === 'okuma' && (
                                <form onSubmit={handleKaydet}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Arama Kriteri Seçin:</label>
                                        <select value={aramaTipi} onChange={(e) => { setAramaTipi(e.target.value); setAramaDegeri(''); setBulunanAboneAdi(''); setBulunanSayaçSeriNo(''); setYeniKayıt({ ...yeniKayıt, sayacSeriNo: '', oncekiEndeks: 0 }); }} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)' }}>
                                            <option value="aboneNo">Abone Numarası ile (6 Haneli)</option>
                                            <option value="sozlesmeNo">Sözleşme Numarası ile (10 Haneli)</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>{aramaTipi === 'aboneNo' ? 'Abone Numarası Girin:' : 'Sözleşme Numarası Girin:'}</label>
                                        <input type="text" required placeholder={aramaTipi === 'aboneNo' ? 'Örn: 148291' : 'Örn: 1004829102'} value={aramaDegeri} onChange={(e) => handleAramaBilgisiDegisti(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ backgroundColor: 'var(--risk-arkaplan)', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid var(--kenarlik)' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--metin-rengi)', marginBottom: '5px' }}><strong>Abone Adı:</strong> {bulunanAboneAdi || <span style={{ color: '#888' }}>Numara bekleniyor...</span>}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--metin-rengi)' }}><strong>Eşleşen Sayaç:</strong> {bulunanSayaçSeriNo ? <span style={{ color: 'green', fontWeight: 'bold' }}>{bulunanSayaçSeriNo}</span> : <span style={{ color: '#888' }}>-</span>}</div>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Önceki Endeks (Otomatik):</label>
                                        <input type="number" value={yeniKayıt.oncekiEndeks} disabled style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--kenarlik)', boxSizing: 'border-box', backgroundColor: '#2C5EAD', color: '#fff', opacity: 0.8 }} />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Güncel (Okunan) Endeks:</label>
                                        <input type="number" required step="0.01" placeholder="Örn: 250.50" value={yeniKayıt.guncelEndeks} onChange={(e) => setYeniKayıt({ ...yeniKayıt, guncelEndeks: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Okuma Tarihi:</label>
                                        <input type="date" required value={yeniKayıt.okumaTarihi} onChange={(e) => setYeniKayıt({ ...yeniKayıt, okumaTarihi: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setModalAcik(false)} style={{ padding: '10px 15px', borderRadius: '4px', border: '1px solid var(--kenarlik)', backgroundColor: '#d40707', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--mavi-koyu)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Okumayı Kaydet</button>
                                    </div>
                                </form>
                            )}

                            {modalSekme === 'yeniAbone' && (
                                <form onSubmit={handleYeniAboneKaydet}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Abone Adı Soyadı:</label>
                                        <input type="text" required placeholder="Örn: Ali Veli" value={yeniAboneKayıt.adSoyad} onChange={(e) => setYeniAboneKayıt({ ...yeniAboneKayıt, adSoyad: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Açık Adres:</label>
                                        <textarea required placeholder="Örn: Nilüfer İlçesi, Cumhuriyet Mah. No: 12" value={yeniAboneKayıt.adres} onChange={(e) => setYeniAboneKayıt({ ...yeniAboneKayıt, adres: e.target.value })} rows="2" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: 'var(--metin-rengi)' }}>Abone Tipi (Tarife):</label>
                                        <select value={yeniAboneKayıt.aboneTipi} onChange={(e) => setYeniAboneKayıt({ ...yeniAboneKayıt, aboneTipi: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#2C5EAD', color: '#fff', border: '1px solid var(--kenarlik)', boxSizing: 'border-box' }}>
                                            {tarifeler.map(tarife => (
                                                <option key={tarife.id || tarife.aboneTipi} value={tarife.aboneTipi}>{tarife.aboneTipi}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{ backgroundColor: '#eef2f7', padding: '10px', borderRadius: '4px', border: '1px solid #bce8f1' }}>
                                            <p style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#555' }}>Otomatik Abone No:</p>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#0056b3' }}>{yeniAboneKayıt.aboneNo}</p>
                                        </div>
                                        <div style={{ backgroundColor: '#eef2f7', padding: '10px', borderRadius: '4px', border: '1px solid #bce8f1' }}>
                                            <p style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#555' }}>Otomatik Sayaç Seri No:</p>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#0056b3' }}>{yeniAboneKayıt.sayacSeriNo}</p>
                                        </div>
                                        <div style={{ backgroundColor: '#eef2f7', padding: '10px', borderRadius: '4px', border: '1px solid #bce8f1', gridColumn: 'span 2' }}>
                                            <p style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#555' }}>Otomatik Sözleşme No:</p>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#0056b3' }}>{yeniAboneKayıt.sozlesmeNo}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setModalAcik(false)} style={{ padding: '10px 15px', borderRadius: '4px', border: '1px solid var(--kenarlik)', backgroundColor: '#d40707', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Yeni Aboneyi Kaydet</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Okumalar;