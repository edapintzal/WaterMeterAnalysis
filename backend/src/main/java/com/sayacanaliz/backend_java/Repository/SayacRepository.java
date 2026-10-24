package com.sayacanaliz.backend_java.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sayacanaliz.backend_java.Entity.Sayac;

public interface SayacRepository extends JpaRepository<Sayac,Integer>  {
    
}
