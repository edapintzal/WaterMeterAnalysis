package com.sayacanaliz.backend_java.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "sayaclar")
public class Sayac {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "seri_no")
    private String seriNo;

    @ManyToOne
    @JoinColumn(name="abone_id")
    private Abone abone;

    @Column(name = "aktif_mi")
    private Boolean aktifMi;

    @Column(name = "kurulum_tarihi")
    private LocalDateTime kurulumTarihi;

    @Column(name = "kapatma_tarihi")
    private LocalDateTime kapatmaTarihi;

     @Column(name = "sozlesme_no")
    private String sozlesmeNo;
    

}
