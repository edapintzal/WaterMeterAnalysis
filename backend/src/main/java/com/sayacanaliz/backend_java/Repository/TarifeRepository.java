package com.sayacanaliz.backend_java.Repository;

import com.sayacanaliz.backend_java.Entity.Tarife;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarifeRepository extends JpaRepository<Tarife, Integer> {
    
    Optional<Tarife> findByAboneTipi(String aboneTipi); // React'ten gelen isimle tarifeyi bulacak

}