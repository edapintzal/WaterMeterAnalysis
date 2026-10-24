package com.sayacanaliz.backend_java.Entity;

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
@Table(name = "aboneler")
public class Abone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "abone_no")
    private String aboneNo;

    @Column(name = "ad_soyad")
    private String adSoyad;

    @ManyToOne
    @JoinColumn(name = "tarife_id")
    private Tarife tarife;

    private String adres;
}
