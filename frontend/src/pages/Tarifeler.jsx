import React, { useState, useEffect } from 'react';
import 'C:/Users/EDA PINTZAL/SayacAnalizPlatformu/frontend/src/App.css';

const Tarifeler = () => {
    // 1. TARİFELER BACKEND'DEN GELEN VERİYLE DOLACAK
    const [tarifeler, setTarifeler] = useState([]);

    // 2. MODAL VE FORM STATE'LERİ
    const [modalAcik, setModalAcik] = useState(false);
    const [duzenlenenTarifeId, setDuzenlenenTarifeId] = useState(null);
    const [tarifeForm, setTarifeForm] = useState({
        aboneTipi: '', // "ad" yerine aboneTipi geldi
        kademeler: [{ id: Date.now(), sinir: '', fiyat: '' }]
    });

    // SAYFA İLK AÇILDIĞINDA TARİFELERİ BACKEND'DEN ÇEK
    useEffect(() => {
        tarifeleriGetir();
    }, []);

    const tarifeleriGetir = async () => {
        try {
            const response = await fetch('http://localhost:8000/tarife/liste');
            if (response.ok) {
                const data = await response.json();
                setTarifeler(data);
            }
        } catch (error) {
            console.error("Tarifeler yüklenirken hata oluştu:", error);
        }
    };

    // --- MODAL AÇMA FONKSİYONLARI ---
    const yeniTarifeModalAc = () => {
        setDuzenlenenTarifeId(null);
        setTarifeForm({
            aboneTipi: '', // Sıfırlama işlemi aboneTipi'ne uyarlandı
            kademeler: [{ id: Date.now(), sinir: '', fiyat: '' }]
        });
        setModalAcik(true);
    };

    const duzenleModalAc = (tarife) => {
        setDuzenlenenTarifeId(tarife.id);
        setTarifeForm({
            aboneTipi: tarife.aboneTipi, // Backend'den gelen aboneTipi form alanına basılıyor
            kademeler: tarife.kademeler.map(k => ({ 
                id: k.id || Date.now(), 
                sinir: k.ustSinir !== null ? k.ustSinir : '', 
                fiyat: k.birimFiyat !== null ? k.birimFiyat : '' 
            }))
        });
        setModalAcik(true);
    };

    // --- KADEME YÖNETİMİ ---
    const kademeEkle = () => {
        setTarifeForm({
            ...tarifeForm,
            kademeler: [...tarifeForm.kademeler, { id: Date.now(), sinir: '', fiyat: '' }]
        });
    };

    const kademeSil = (id) => {
        if (tarifeForm.kademeler.length === 1) {
            alert("Bir tarifede en az 1 kademe bulunmalıdır!");
            return;
        }
        setTarifeForm({
            ...tarifeForm,
            kademeler: tarifeForm.kademeler.filter(k => k.id !== id)
        });
    };

    const kademeGuncelle = (id, alan, deger) => {
        setTarifeForm({
            ...tarifeForm,
            kademeler: tarifeForm.kademeler.map(k => 
                k.id === id ? { ...k, [alan]: deger } : k
            )
        });
    };

    // --- BACKEND'E KAYDETME / GÜNCELLEME İŞLEMİ ---
    const handleTarifeKaydet = async (e) => {
        e.preventDefault();
        
        const gonderilecekVeri = {
            id: duzenlenenTarifeId,
            aboneTipi: tarifeForm.aboneTipi, // Backend'e aboneTipi adıyla gönderiliyor
            kademeler: tarifeForm.kademeler.map((k, index) => ({
                id: k.id > 1000000000000 ? null : k.id,
                sira: index + 1,
                ustSinir: k.sinir !== '' ? Number(k.sinir) : null,
                birimFiyat: Number(k.fiyat)
            }))
        };

        const isUpdate = !!duzenlenenTarifeId;
        const url = isUpdate 
            ? `http://localhost:8000/tarife/guncelle/${duzenlenenTarifeId}` 
            : 'http://localhost:8000/tarife/ekle';
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gonderilecekVeri),
            });

            if (response.ok) {
                alert(isUpdate ? "Tarife başarıyla güncellendi! 🚀" : "Tarife başarıyla eklendi! 🚀");
                setModalAcik(false);
                tarifeleriGetir();
            } else {
                const errorData = await response.text();
                console.error("Sunucu Hatası:", errorData);
                alert("İşlem sırasında sunucu hatası oluştu.");
            }
        } catch (error) {
            console.error("Bağlantı Hatası:", error);
            alert("Sunucuya ulaşılamıyor.");
        }
    };

    // --- TARİFE SİLME İŞLEMİ ---
    const tarifeSil = async (id) => {
        if (!window.confirm("Bu tarifeyi ve bağlı tüm kademeleri silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/tarife/sil/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Tarife başarıyla silindi!");
                tarifeleriGetir(); // Listeyi güncelle
            } else {
                alert("Silme işlemi sırasında bir hata oluştu.");
            }
        } catch (error) {
            console.error("Silme hatası:", error);
            alert("Sunucuya ulaşılamıyor.");
        }
    };

    return (
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--kenarlik)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ color: '#3498db', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📊 Sistem Tarifeleri ve Fiyatlandırma
                </h2>
                <button
                    onClick={yeniTarifeModalAc}
                    style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    + Yeni Tarife Ekle
                </button>
            </div>

            {/* MEVCUT TARİFELERİN LİSTELENDİĞİ ALAN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                {tarifeler.map((tarife) => (
                    <div key={tarife.id} style={{ backgroundColor: '#f4f8fb', border: '1px solid #cce0f0', borderRadius: '8px', padding: '20px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cce0f0', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#3498db' }}>{tarife.aboneTipi}</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => duzenleModalAc(tarife)}
                                    style={{ backgroundColor: '#f1f1f1', color: '#555', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                >
                                    ✏️ Düzenle
                                </button>
                                <button 
                                    onClick={() => tarifeSil(tarife.id)}
                                    style={{ backgroundColor: '#ffe6e6', color: '#d9534f', border: '1px solid #d9534f', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                >
                                    🗑️ Sil
                                </button>
                            </div>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ccc' }}>
                                    <th style={{ padding: '8px 0', color: '#555' }}>Kademe</th>
                                    <th style={{ padding: '8px 0', color: '#555' }}>Üst Sınır (m³)</th>
                                    <th style={{ padding: '8px 0', color: '#555', textAlign: 'right' }}>Birim Fiyat (₺)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tarife.kademeler && tarife.kademeler.map((kademe, index) => (
                                    <tr key={kademe.id || index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#333' }}>{index + 1}. Kademe</td>
                                        <td style={{ padding: '10px 0', color: kademe.ustSinir !== null ? '#333' : '#e74c3c', fontWeight: kademe.ustSinir !== null ? 'normal' : 'bold' }}>
                                            {kademe.ustSinir !== null ? `${kademe.ustSinir} m³'e kadar` : 'Sınır Yok (Aşan Kısım)'}
                                        </td>
                                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold', color: '#3498db' }}>
                                            {kademe.birimFiyat} ₺
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {modalAcik && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '600px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <h2 style={{ marginTop: 0, color: '#3498db', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            {duzenlenenTarifeId ? 'Tarifeyi Güncelle' : 'Yeni Tarife Oluştur'}
                        </h2>

                        <form onSubmit={handleTarifeKaydet}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Abone Tipi:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Örn: Sanayi Aboneliği"
                                    value={tarifeForm.aboneTipi}
                                    onChange={(e) => setTarifeForm({ ...tarifeForm, aboneTipi: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, color: '#333' }}>Tarife Kademeleri</h4>
                                    <button 
                                        type="button" 
                                        onClick={kademeEkle}
                                        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                    >
                                        + Kademe Ekle
                                    </button>
                                </div>

                                {tarifeForm.kademeler.map((kademe, index) => (
                                    <div key={kademe.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                        <div style={{ fontWeight: 'bold', color: '#555', width: '90px' }}>
                                            {index + 1}. Kademe:
                                        </div>
                                        
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                placeholder="Üst Sınır (Boş=Aşan)"
                                                value={kademe.sinir}
                                                onChange={(e) => kademeGuncelle(kademe.id, 'sinir', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '12px' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="Birim Fiyat (₺)"
                                                value={kademe.fiyat}
                                                onChange={(e) => kademeGuncelle(kademe.id, 'fiyat', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '12px' }}
                                            />
                                        </div>

                                        <button 
                                            type="button" 
                                            onClick={() => kademeSil(kademe.id)}
                                            style={{ backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                ))}
                                <p style={{ fontSize: '11px', color: '#888', margin: '10px 0 0 0', fontStyle: 'italic' }}>
                                    * Son kademenin üst sınırını boş bırakırsanız, sistem bunu "Önceki sınırları aşan tüm tüketimler" olarak hesaplar.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setModalAcik(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3498db', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {duzenlenenTarifeId ? 'Güncellemeyi Kaydet' : 'Tarifeyi Kaydet'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Tarifeler;