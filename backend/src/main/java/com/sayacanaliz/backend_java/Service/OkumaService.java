package com.sayacanaliz.backend_java.Service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sayacanaliz.backend_java.Entity.Okuma;
import com.sayacanaliz.backend_java.Repository.OkumaRepository;

@Service
public class OkumaService {
    private final OkumaRepository okumaRepository;
    
    public OkumaService(OkumaRepository okumaRepository) {
        this.okumaRepository = okumaRepository;
    }

    public List<Okuma> okumalariListele(Pageable sayfalama) {
    // Kuralı Repository'nin findAll metoduna veriyoruz ve sadece içeriği (getContent) List olarak dönüyoruz
    return okumaRepository.findAll(sayfalama).getContent();
}

    public Okuma okumaKaydet(Okuma okuma) {
        // Tüketim miktarı otomatik hesaplanıyor!
        if (okuma.getOncekiEndeks() != null && okuma.getGuncelEndeks() != null) {
            float hesaplananTuketim = okuma.getGuncelEndeks() - okuma.getOncekiEndeks();
            
            // Eğer sonuç eksi çıkarsa, sayaç sıfırlanmış veya hata vardır kontrolü (Opsiyonel kalite detayı)
            if (hesaplananTuketim < 0) {
                hesaplananTuketim = 0; 
            }
            
            okuma.setTuketimMiktari(hesaplananTuketim);
        }

        // Hesaplanmış son haliyle veritabanına gönder
        return okumaRepository.save(okuma);
    }



    

    
}
