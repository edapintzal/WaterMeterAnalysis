package com.sayacanaliz.backend_java.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sayacanaliz.backend_java.Entity.Abone;

public interface AboneRepository extends JpaRepository<Abone,Integer> {
    
}
