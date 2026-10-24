package com.sayacanaliz.backend_java.Repository;
import com.sayacanaliz.backend_java.Entity.Okuma;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OkumaRepository extends JpaRepository<Okuma, Integer> {
    // İçi tamamen boş kalacak! Bütün SQL yetenekleri JpaRepository'den miras geliyor.
    Okuma findTopBySayacIdOrderByOkumaTarihiDesc(Integer sayacId);
}
