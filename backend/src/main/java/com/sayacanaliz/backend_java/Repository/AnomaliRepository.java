package com.sayacanaliz.backend_java.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sayacanaliz.backend_java.Entity.Anomali;

public interface AnomaliRepository extends JpaRepository<Anomali,Integer>{
    
}
