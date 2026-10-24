import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link , Navigate} from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AnaSayfa from './pages/AnaSayfa.jsx';
import Okumalar from './pages/Okumalar.jsx';
import Anomaliler from './pages/Anomaliler.jsx';
import Tarifeler from './pages/Tarifeler'; // Kendi dosya yoluna göre ayarla

// 1. React Query İstemcisini Oluşturuyoruz
const queryClient = new QueryClient();

// Asıl Uygulama İçeriğimiz
function AppContent() {

    // 2. MUCİZE BURADA: useQuery ile akıllı veri çekme ve önbellekleme
    const { data: okumalar = [], isLoading: yukleniyor } = useQuery({
        queryKey: ['okumalar_listesi'], // Bu verinin hafızadaki kimlik kartı
        queryFn: async () => {
            const response = await axios.get('http://localhost:8000/okuma/liste');
            return response.data;
        },
        // AKILLI AYARLAR:
        staleTime: 0, // Veri 5 dakika boyunca "Taze" kabul edilir (gereksiz istek atmaz)
        refetchOnWindowFocus: true, // Kullanıcı başka sekmeye gidip bu sekmeye geri dönerse, veriyi arkaplanda sessizce günceller
    });

    return (
        <Router>
            {/* YENİ HALİ */}
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#2C5EAD', minHeight: '100vh' }}>

                {/* ÜST MENÜ */}
                {/* ÜST MENÜ */}
                <nav style={{ backgroundColor: '#1a365d', padding: '15px 30px', display: 'flex', gap: '20px', color: 'white', alignItems: 'center' }}>
                    
                    {/* LOGO VE BAŞLIK GRUBU */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '40px' }}>
                        <img 
                            src="/sudamlasi.png" 
                            alt="Logo" 
                            style={{ width: '75px', height: 'auto'/* Eğer logonun arka planı kareyse yuvarlatmak için */ }} 
                        />
                        <h2 style={{ margin: '0' }}>EP Sayaç Analiz Platformu</h2>
                    </div>

                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>📊 Dashboard</Link>
                    <Link to="/okumalar" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>📋 Sayaç Okumaları</Link>
                    <Link to="/anomaliler" style={{ color: '#ffcdd2', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                        ⚠️ Anomaliler
                    </Link>
                    <Link to="/tarifeler" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>⚙️ Tarife Yönetimi</Link>

                    {/* Arka planda veri çekilirken ufak bir bilgi mesajı gösterebiliriz */}
                    {!yukleniyor && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a0aec0' }}>Sistem Güncel ✅</span>}
                </nav>

                {/* SAYFALAR */}
                <div style={{ padding: '30px' }}>
                    <Routes>
                        {/* 1. Kullanıcı sadece localhost:5173 yazarsa otomatik olarak dashboard'a yönlendir */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<AnaSayfa okumalar={okumalar} yukleniyor={yukleniyor} />} />
                        <Route path="/okumalar" element={<Okumalar okumalar={okumalar} yukleniyor={yukleniyor} />} />
                        <Route path="/anomaliler" element={<Anomaliler okumalar={okumalar} yukleniyor={yukleniyor} />} />
                        <Route path="/tarifeler" element={<Tarifeler />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

// 3. Ana App Fonksiyonu: Tüm uygulamayı QueryClientProvider ile sarıyoruz
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
        </QueryClientProvider>
    );
}

export default App;