package com.sayacanaliz.backend_java.Entity;

import java.time.LocalDate;
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
@Table(name = "okumalar")
public class Okuma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "sayac_id")
    private Sayac sayac;

    @Column(name = "okuma_tarihi")
    private LocalDateTime okumaTarihi;

    @Column(name = "tuketim_miktari")
    private Float tuketimMiktari;
   
    @Column(name = "onceki_endeks")
    private Float oncekiEndeks;

    @Column(name = "guncel_endeks")
    private Float guncelEndeks;

    @Column(name = "fatura_tutari")
    private Float faturaTutari;

    @Column(name = "son_odeme_tarihi")
    private LocalDate sonOdemeTarihi;
}