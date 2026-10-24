package com.sayacanaliz.backend_java.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "anomaliler")
public class Anomali {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sayac_id")
    private Integer sayacId;

    @Column(name = "tespit_tarihi")
    private LocalDateTime tespitTarihi;

    @Column(name = "anomali_tipi")
    private String anomaliTipi;
    
    @Column(name = "cozuldu_mu")
    private Boolean cozulduMu;
}
