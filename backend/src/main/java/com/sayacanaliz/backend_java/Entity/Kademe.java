package com.sayacanaliz.backend_java.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "kademeler")
public class Kademe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer sira; 
    
    // Eğer null ise "Sınır Yok (Aşan Kısım)" anlamına gelir
    private Double ustSinir; 
    
    private Double birimFiyat;

    // JSON'a çevrilirken sonsuz döngüye girmemesi için JsonIgnore ekliyoruz!
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "tarife_id")
    private Tarife tarife;
}