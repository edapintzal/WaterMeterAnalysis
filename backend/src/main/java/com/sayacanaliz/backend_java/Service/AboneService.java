package com.sayacanaliz.backend_java.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sayacanaliz.backend_java.Entity.Abone;
import com.sayacanaliz.backend_java.Repository.AboneRepository;

@Service
public class AboneService {
    private final AboneRepository aboneRepository;

    public AboneService(AboneRepository aboneRepository) {
        this.aboneRepository = aboneRepository;
    }

    public List<Abone> aboneleriListele(){
        return aboneRepository.findAll();
    }
    public Abone aboneEkle(Abone abone){
        return aboneRepository.save(abone);
    }

    


    
}
