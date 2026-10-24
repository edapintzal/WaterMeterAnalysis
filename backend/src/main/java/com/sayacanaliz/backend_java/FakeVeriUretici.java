package com.sayacanaliz.backend_java;

import com.sayacanaliz.backend_java.Entity.*;
import com.sayacanaliz.backend_java.Repository.*;

import jakarta.transaction.Transactional;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
public class FakeVeriUretici implements CommandLineRunner {

    @Autowired
    private AboneRepository aboneRepository;

    @Autowired
    private SayacRepository sayacRepository;

    @Autowired
    private OkumaRepository okumaRepository;

    @Autowired
    private AnomaliRepository anomaliRepository;

    @Autowired
    private TarifeRepository tarifeRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Faker faker = new Faker(new Locale("tr"));
        LocalDate bugun = LocalDate.now();

        // 0. SENARYO: TARİFE TABLOSU BOŞSA YENİ DİNAMİK MİMARİYE GÖRE TARİFELERİ EKLE
        if (tarifeRepository.count() == 0) {
            System.out.println("--- 📊 SİSTEME DİNAMİK KADEMELİ TARİFELER YÜKLENİYOR ---");
            
            // 1. MESKEN TARİFESİ (3 Kademeli)
            Tarife mesken = new Tarife();
            mesken.setAboneTipi("Mesken"); // ad yerine aboneTipi yapıldı
            
            Kademe m1 = new Kademe(); m1.setSira(1); m1.setUstSinir(15.0); m1.setBirimFiyat(61.68); m1.setTarife(mesken);
            Kademe m2 = new Kademe(); m2.setSira(2); m2.setUstSinir(20.0); m2.setBirimFiyat(117.21); m2.setTarife(mesken);
            Kademe m3 = new Kademe(); m3.setSira(3); m3.setUstSinir(null); m3.setBirimFiyat(178.89); m3.setTarife(mesken); // Sınır Yok
            
            mesken.setKademeler(Arrays.asList(m1, m2, m3));
            tarifeRepository.save(mesken);

            // 2. İŞYERİ TARİFESİ (Tek Kademeli)
            Tarife isyeri = new Tarife();
            isyeri.setAboneTipi("İşyeri"); // ad yerine aboneTipi yapıldı
            Kademe i1 = new Kademe(); i1.setSira(1); i1.setUstSinir(null); i1.setBirimFiyat(120.50); i1.setTarife(isyeri);
            isyeri.setKademeler(Arrays.asList(i1));
            tarifeRepository.save(isyeri);

            // 3. SİTE VE APARTMAN TARİFESİ
            Tarife site = new Tarife();
            site.setAboneTipi("Site ve Apartman"); // ad yerine aboneTipi yapıldı
            Kademe s1 = new Kademe(); s1.setSira(1); s1.setUstSinir(null); s1.setBirimFiyat(61.68); s1.setTarife(site);
            site.setKademeler(Arrays.asList(s1));
            tarifeRepository.save(site);

            // 4. RESMİ KURUM TARİFESİ
            Tarife resmiKurum = new Tarife();
            resmiKurum.setAboneTipi("Resmi Kurum"); // ad yerine aboneTipi yapıldı
            Kademe r1 = new Kademe(); r1.setSira(1); r1.setUstSinir(null); r1.setBirimFiyat(95.00); r1.setTarife(resmiKurum);
            resmiKurum.setKademeler(Arrays.asList(r1));
            tarifeRepository.save(resmiKurum);
        }

        // 1. SENARYO: VERİTABANI DOLUYSA SADECE BUGÜNÜN VERİLERİNİ EKLE (YAŞAYAN SİSTEM)
        if (aboneRepository.count() > 0) {
            System.out.println("--- 🔄 GÜNLÜK OKUMA SİMÜLASYONU: Bugünün verileri mevcut sayaçlara ekleniyor ---");
            
            List<Sayac> mevcutSayaclar = sayacRepository.findAll();

            for (Sayac sayac : mevcutSayaclar) {
                Okuma sonOkuma = okumaRepository.findTopBySayacIdOrderByOkumaTarihiDesc(sayac.getId());
                float baslangicEndeksi = (sonOkuma != null) ? sonOkuma.getGuncelEndeks() : 100.0f;
                
                float gunlukTuketim = (float) faker.number().randomDouble(2, 0, 1) + 0.5f; 
                float guncelEndeks = baslangicEndeksi + gunlukTuketim;

                int rastgeleSaat = faker.number().numberBetween(8, 18);
                int rastgeleDakika = faker.number().numberBetween(0, 59);
                int rastgeleSaniye = faker.number().numberBetween(0, 59);
                LocalDateTime rastgeleZaman = bugun.atTime(rastgeleSaat, rastgeleDakika, rastgeleSaniye);

                Okuma yeniOkuma = new Okuma();
                yeniOkuma.setSayac(sayac);
                yeniOkuma.setOkumaTarihi(rastgeleZaman);
                yeniOkuma.setSonOdemeTarihi(yeniOkuma.getOkumaTarihi().toLocalDate().plusDays(15));
                yeniOkuma.setOncekiEndeks(Math.round(baslangicEndeksi * 100.0f) / 100.0f);
                yeniOkuma.setGuncelEndeks(Math.round(guncelEndeks * 100.0f) / 100.0f);
                yeniOkuma.setTuketimMiktari(Math.round(gunlukTuketim * 100.0f) / 100.0f);

                // DİNAMİK SAHTE FATURA HESAPLAMA ÇAĞRISI
                float hesaplananFatura = sahteFaturaHesapla(yeniOkuma.getTuketimMiktari(), sayac.getAbone().getTarife());
                yeniOkuma.setFaturaTutari(hesaplananFatura);

                okumaRepository.save(yeniOkuma);

                if (gunlukTuketim > 3.0f) {
                    Anomali anomali = new Anomali();
                    anomali.setSayacId(sayac.getId());
                    anomali.setTespitTarihi(yeniOkuma.getOkumaTarihi());
                    anomali.setAnomaliTipi("Günlük Aşırı Tüketim Şüphesi (>3 m³)");
                    anomali.setCozulduMu(false);
                    anomaliRepository.save(anomali);
                }
            }
            System.out.println("--- ✅ BUGÜNÜN GÜNCEL OKUMALARI BAŞARIYLA KAYDEDİLDİ ---");
            return;
        }

        // 2. SENARYO: VERİTABANI BOMBOŞSA İLK KURULUMU YAP (2020'den bugüne)
        System.out.println("--- 🚀 İLK KURULUM: GERÇEKÇİ TARİHÇELİ BUSKİ SAHTE VERİ ÜRETİMİ BAŞLIYOR ---");

        String[] bursaIlceleri = { "Osmangazi", "Yıldırım", "Nilüfer", "Gürsu" , "Kestel","Gemlik", "İnegöl", "İznik", "Karacabey", "Mudanya", "Mustafakemalpaşa", "Orhangazi", "Yenişehir", "Büyükorhan", "Harmancık", "Keles" ,"Orhanel"};
        List<Tarife> tumTarifeler = tarifeRepository.findAll();

        for (int i = 0; i < 50; i++) {
            Abone abone = new Abone();
            abone.setAdSoyad(faker.name().fullName());
            abone.setAboneNo(String.valueOf(faker.number().numberBetween(100000, 999999)));
            
            // Aboneye rastgele bir tarife bağlıyoruz
            Tarife rastgeleTarife = tumTarifeler.get(faker.number().numberBetween(0, tumTarifeler.size()));
            abone.setTarife(rastgeleTarife);
            
            String ilce = bursaIlceleri[faker.number().numberBetween(0, bursaIlceleri.length)];
            abone.setAdres(ilce + " İlçesi, " + faker.address().streetName() + " Mah. No: " + faker.number().numberBetween(1, 100));
            
            aboneRepository.save(abone);

            int sayacAdedi = faker.number().numberBetween(1, 3);
            for (int j = 0; j < sayacAdedi; j++) {
                Sayac sayac = new Sayac();
                sayac.setAbone(abone);
                sayac.setSeriNo("SYC-" + faker.number().numberBetween(100000, 999999));
                sayac.setSozlesmeNo(String.valueOf(faker.number().numberBetween(1000000000L, 9999999999L)));
                sayac.setAktifMi(true);
                sayac.setKurulumTarihi(LocalDateTime.of(2020, 1, 1, 0, 0));
                
                sayacRepository.save(sayac);

                LocalDate simdikiDonem = LocalDate.of(2020, 1, 1);
                float baslangicEndeksi = (float) faker.number().randomDouble(2, 10, 50);
                
                while (simdikiDonem.isBefore(bugun)) {
                    int rastgeleGun = faker.number().numberBetween(1, 28);
                    LocalDate okumaTarihi = simdikiDonem.withDayOfMonth(rastgeleGun);

                    if (okumaTarihi.isAfter(bugun)) {
                        break;
                    }

                    int rastgeleSaat = faker.number().numberBetween(8, 19);
                    int rastgeleDakika = faker.number().numberBetween(0, 59);
                    int rastgeleSaniye = faker.number().numberBetween(0, 59);
                    LocalDateTime okumaZamani = okumaTarihi.atTime(rastgeleSaat, rastgeleDakika, rastgeleSaniye);

                    Okuma okuma = new Okuma();
                    okuma.setSayac(sayac);
                    okuma.setOkumaTarihi(okumaZamani);
                    okuma.setSonOdemeTarihi(okuma.getOkumaTarihi().toLocalDate().plusDays(15));

                    float tuketim = (float) faker.number().randomDouble(2, 5, 25);
                    float guncel = baslangicEndeksi + tuketim;
                    
                    okuma.setOncekiEndeks(Math.round(baslangicEndeksi * 100.0f) / 100.0f);
                    okuma.setGuncelEndeks(Math.round(guncel * 100.0f) / 100.0f);
                    okuma.setTuketimMiktari(Math.round(tuketim * 100.0f) / 100.0f);

                    // DİNAMİK SAHTE FATURA HESAPLAMA ÇAĞRISI
                    float hesaplananFatura = sahteFaturaHesapla(okuma.getTuketimMiktari(), sayac.getAbone().getTarife());
                    okuma.setFaturaTutari(hesaplananFatura);

                    baslangicEndeksi = guncel;
                    okumaRepository.save(okuma);

                    if (tuketim > 15.0f) {
                        Anomali anomali = new Anomali();
                        anomali.setSayacId(sayac.getId());
                        anomali.setTespitTarihi(okuma.getOkumaTarihi());
                        anomali.setAnomaliTipi("Yüksek Tüketim / Kaçak Şüphesi (>15 m³)");
                        anomali.setCozulduMu(false);
                        anomaliRepository.save(anomali);
                    }

                    simdikiDonem = simdikiDonem.plusMonths(1);
                }
            }
        }
        System.out.println("--- ✅ GERÇEKÇİ VE DAĞINIK TARİHLİ SAHTE VERİLER ÜRETİLDİ ---");
    }

    // SAHTE VERİLERİN FATURA TUTARLARINI GERÇEKCİ VE DİNAMİK HESAPLAYAN YARDIMCI METOT
    private float sahteFaturaHesapla(float tuketim, Tarife tarife) {
        if (tarife == null || tarife.getId() == null) {
            return 0.0f;
        }

        // LAZY LOADING SORUNUNU AŞMAK İÇİN TARİFEYİ KADEMELERİYLE BİRLİKTE REPOSITORY'DEN ÇEKİYORUZ
        Tarife guncelTarife = tarifeRepository.findById(tarife.getId()).orElse(null);

        if (guncelTarife == null || guncelTarife.getKademeler() == null || guncelTarife.getKademeler().isEmpty()) {
            return 0.0f;
        }

        double toplamFatura = 0.0;
        double kalanTuketim = tuketim;
        double oncekiKademeSiniri = 0.0;

        List<Kademe> kademeler = guncelTarife.getKademeler();
        kademeler.sort(Comparator.comparing(Kademe::getSira));

        for (Kademe kademe : kademeler) {
            if (kalanTuketim <= 0) break; 

            if (kademe.getUstSinir() == null) {
                toplamFatura += kalanTuketim * kademe.getBirimFiyat();
                kalanTuketim = 0;
            } else {
                double kademeKapasitesi = kademe.getUstSinir() - oncekiKademeSiniri;

                if (kalanTuketim > kademeKapasitesi) {
                    toplamFatura += kademeKapasitesi * kademe.getBirimFiyat();
                    kalanTuketim -= kademeKapasitesi;
                    oncekiKademeSiniri = kademe.getUstSinir();
                } else {
                    toplamFatura += kalanTuketim * kademe.getBirimFiyat();
                    kalanTuketim = 0;
                }
            }
        }
        return (float) (Math.round(toplamFatura * 100.0) / 100.0);
    }
}