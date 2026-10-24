package com.sayacanaliz.backend_java.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sayacanaliz.backend_java.Entity.Sayac;
import com.sayacanaliz.backend_java.Repository.SayacRepository;

@Service
public class SayacService {
    

    private final SayacRepository sayacRepository;
    
    public SayacService(SayacRepository sayacRepository) {
        this.sayacRepository = sayacRepository;
    }
    public List<Sayac> sayaclariListele(){
        return sayacRepository.findAll();
    }

    
}
