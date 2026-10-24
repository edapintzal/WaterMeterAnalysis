package com.sayacanaliz.backend_java.Service; // Klasör adın küçük harfse .service yapmayı unutma

import com.sayacanaliz.backend_java.Entity.Tarife;
import com.sayacanaliz.backend_java.Repository.TarifeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TarifeService {

    @Autowired
    private TarifeRepository tarifeRepository;

    // Tüm tarifeleri getir
    public List<Tarife> tumTarifeleriGetir() {
        return tarifeRepository.findAll();
    }

    // React'ten gelen güncel tarifeleri topluca kaydet
    public void tarifeleriGuncelle(List<Tarife> guncelTarifeler) {
        tarifeRepository.saveAll(guncelTarifeler);
    }
}
