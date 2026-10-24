package com.sayacanaliz.backend_java.Controller;

import com.sayacanaliz.backend_java.Entity.Kademe;
import com.sayacanaliz.backend_java.Entity.Tarife;
import com.sayacanaliz.backend_java.Repository.TarifeRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarife")
@CrossOrigin(origins = "*") // CORS engelini çözer
public class TarifeController {

    private final TarifeRepository tarifeRepository;

    public TarifeController(TarifeRepository tarifeRepository) {
        this.tarifeRepository = tarifeRepository;
    }

    // 404 hatasını çözen metot (Adres: http://localhost:8000/tarife/liste)
    @GetMapping("/liste")
    public List<Tarife> tarifeleriGetir() {
        return tarifeRepository.findAll();
    }

    @PostMapping("/ekle")
    public Tarife tarifeEkle(@RequestBody Tarife tarife) {
        if (tarife.getKademeler() != null) {
            for (Kademe kademe : tarife.getKademeler()) {
                kademe.setTarife(tarife);
            }
        }
        return tarifeRepository.save(tarife);
    }

    @PutMapping("/guncelle/{id}")
    public Tarife guncelle(@PathVariable int id, @RequestBody Tarife guncellenmisTarife) {
        // Veritabanından mevcut tarifeyi bul
        Tarife mevcutTarife = tarifeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarife bulunamadı: " + id));

        // Bilgileri güncelle
        mevcutTarife.setAboneTipi(guncellenmisTarife.getAboneTipi());

        // Kademeleri güncelle
        // Not: Entity'nizde cascade = CascadeType.ALL ve orphanRemoval = true tanımlı
        // olmalı
        mevcutTarife.getKademeler().clear();
        mevcutTarife.getKademeler().addAll(guncellenmisTarife.getKademeler());

        // Kademelerin tarife bağlantılarını (foreign key) güncelle
        for (Kademe kademe : mevcutTarife.getKademeler()) {
            kademe.setTarife(mevcutTarife);
        }

        // Değişiklikleri veritabanına kaydet ve güncel nesneyi döndür
        return tarifeRepository.save(mevcutTarife);
    }

    @DeleteMapping("/sil/{id}")
    public void tarifeSil(@PathVariable int id) {
        tarifeRepository.deleteById(id);
    }

}