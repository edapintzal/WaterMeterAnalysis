package com.sayacanaliz.backend_java.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "tarifeler")
public class Tarife {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true , name = "abone_tipi")
    private String aboneTipi; // "Mesken", "İşyeri" vb.

    // YENİSİ (FetchType.EAGER ekledik):
    @OneToMany(mappedBy = "tarife", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Kademe> kademeler;

}