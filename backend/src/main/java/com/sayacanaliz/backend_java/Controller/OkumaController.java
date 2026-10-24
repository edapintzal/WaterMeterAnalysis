package com.sayacanaliz.backend_java.Controller;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sayacanaliz.backend_java.Entity.Kademe;
import com.sayacanaliz.backend_java.Entity.Okuma;
import com.sayacanaliz.backend_java.Entity.Sayac;
import com.sayacanaliz.backend_java.Entity.Tarife;
import com.sayacanaliz.backend_java.Repository.SayacRepository;
import com.sayacanaliz.backend_java.Service.OkumaService;

@RestController
@RequestMapping("/okuma")
@CrossOrigin(origins = "*")
public class OkumaController {
     
    private final OkumaService okumaService;
    private final SayacRepository sayacRepository;

    public OkumaController(OkumaService okumaService, SayacRepository sayacRepository) {
        this.okumaService = okumaService;
        this.sayacRepository = sayacRepository;
    }

    @GetMapping("/liste")
    public List<Okuma> okumalariListele(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "200000") int limit) {

        Pageable sayfalama = PageRequest.of(skip / limit, limit, Sort.by("okumaTarihi").descending());
        return okumaService.okumalariListele(sayfalama);
    }

    @PostMapping("/ekle")
    public Okuma ekle(@RequestBody Okuma okuma) {
        
        // 1. SON ÖDEME TARİHİ HESAPLAMASI (+15 GÜN)
        if (okuma.getOkumaTarihi() != null) {
            LocalDate hesaplananSonOdeme = okuma.getOkumaTarihi().toLocalDate().plusDays(15);
            okuma.setSonOdemeTarihi(hesaplananSonOdeme);
        }

        // 2. YENİ DİNAMİK FATURA HESAPLAMASI
        if (okuma.getSayac() != null && okuma.getSayac().getId() != null) {
            Sayac sayac = sayacRepository.findById(okuma.getSayac().getId()).orElse(null);
            
            if (sayac != null && sayac.getAbone() != null && sayac.getAbone().getTarife() != null) {
                
                Tarife tarife = sayac.getAbone().getTarife();
                double tuketim = okuma.getTuketimMiktari();
                
                double toplamFatura = 0.0;
                double kalanTuketim = tuketim;
                double oncekiKademeSiniri = 0.0;

                List<Kademe> kademeler = tarife.getKademeler();
                
                // Tarifede kademe tanımlanmışsa hesapla
                if (kademeler != null && !kademeler.isEmpty()) {
                    // Kademeleri 1., 2., 3. diye sıraya diziyoruz
                    kademeler.sort(Comparator.comparing(Kademe::getSira));

                    for (Kademe kademe : kademeler) {
                        if (kalanTuketim <= 0) break; // Hesaplanacak su kalmadıysa döngüyü bitir

                        // Üst sınır null ise (Aşan Kısım), kalan tüm suyu bu fiyattan çarp
                        if (kademe.getUstSinir() == null) {
                            toplamFatura += kalanTuketim * kademe.getBirimFiyat();
                            kalanTuketim = 0;
                        } else {
                            // Bu kademenin kapasitesi (Örn: 20 - 15 = 5 m³)
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
                }

                // Küsuratları iki haneli olacak şekilde yuvarlıyoruz (Örn: 150.456 -> 150.46)
                okuma.setFaturaTutari((float) (Math.round(toplamFatura * 100.0) / 100.0));
            }
        }

        // 3. VERİTABANINA KAYDET
        return okumaService.okumaKaydet(okuma);
    }
}