package com.sayacanaliz.backend_java.Controller;

import com.sayacanaliz.backend_java.Entity.Abone;
import com.sayacanaliz.backend_java.Entity.Okuma;
import com.sayacanaliz.backend_java.Entity.Sayac;
import com.sayacanaliz.backend_java.Entity.Tarife;
import com.sayacanaliz.backend_java.Repository.AboneRepository;
import com.sayacanaliz.backend_java.Repository.OkumaRepository;
import com.sayacanaliz.backend_java.Repository.SayacRepository;
import com.sayacanaliz.backend_java.Repository.TarifeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/abone")
@CrossOrigin(origins = "*")
public class AboneController {

    private final OkumaRepository okumaRepository;
    private final AboneRepository aboneRepository;
    private final SayacRepository sayacRepository;
    private final TarifeRepository tarifeRepository;

    public AboneController(AboneRepository aboneRepository, SayacRepository sayacRepository,
            TarifeRepository tarifeRepository, OkumaRepository okumaRepository) {
        this.aboneRepository = aboneRepository;
        this.sayacRepository = sayacRepository;
        this.tarifeRepository = tarifeRepository;
        this.okumaRepository = okumaRepository;
    }

    @PostMapping("/ekle")
    public Abone aboneEkle(@RequestBody Map<String, Object> payload) {

        // 1. REACT'TEN GELEN VERİLERİ AL
        String adSoyad = (String) payload.get("adSoyad");
        String adres = (String) payload.get("adres");
        String aboneNo = (String) payload.get("aboneNo");
        String aboneTipiStr = (String) payload.get("aboneTipi");

        Map<String, Object> sayacData = (Map<String, Object>) payload.get("sayac");
        String sozlesmeNo = (String) sayacData.get("sozlesmeNo");
        String seriNo = (String) sayacData.get("seriNo");

        // 2. TARİFEYİ BUL
        Tarife secilenTarife = tarifeRepository.findByAboneTipi(aboneTipiStr)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Seçilen tarife (" + aboneTipiStr + ") bulunamadı!"));

        // 3. ABONE VE SAYAÇ NESNELERİNİ OLUŞTUR
        Abone yeniAbone = new Abone();
        yeniAbone.setAdSoyad(adSoyad);
        yeniAbone.setAdres(adres);
        yeniAbone.setAboneNo(aboneNo);
        yeniAbone.setTarife(secilenTarife);

        Sayac yeniSayac = new Sayac();
        yeniSayac.setSozlesmeNo(sozlesmeNo);
        yeniSayac.setSeriNo(seriNo);
        yeniSayac.setAbone(yeniAbone);

        // Sadece aktiflik ve kurulum tarihini veriyoruz (ilkEndeks silindi!)
        yeniSayac.setAktifMi(true);
        yeniSayac.setKurulumTarihi(LocalDateTime.now());

        // 4. VERİTABANINA KAYDET
        Abone kaydedilenAbone = aboneRepository.save(yeniAbone);
        sayacRepository.save(yeniSayac);

        // 5. YENİ SAYAÇ İÇİN "0" TÜKETİMLİ İLK OKUMAYI OTOMATİK OLUŞTUR
        Okuma ilkOkuma = new Okuma();
        ilkOkuma.setSayac(yeniSayac);
        ilkOkuma.setOkumaTarihi(LocalDateTime.now());

        // Okuma tablosundaki önceki ve güncel endeksi 0 olarak ayarlıyoruz
        ilkOkuma.setOncekiEndeks(0.0f);
        ilkOkuma.setGuncelEndeks(0.0f);
        ilkOkuma.setTuketimMiktari(0.0f);
        ilkOkuma.setFaturaTutari(0.0f);
        ilkOkuma.setSonOdemeTarihi(null);
        okumaRepository.save(ilkOkuma);

        return kaydedilenAbone;
    }
}
