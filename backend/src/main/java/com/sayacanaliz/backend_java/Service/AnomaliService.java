package com.sayacanaliz.backend_java.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sayacanaliz.backend_java.Entity.Anomali;
import com.sayacanaliz.backend_java.Repository.AnomaliRepository;

@Service
public class AnomaliService {

    private final AnomaliRepository anomaliRepository;

    public AnomaliService(AnomaliRepository anomaliRepository) {
        this.anomaliRepository = anomaliRepository;
    }

    public List<Anomali> anomalileriListele(){
        return anomaliRepository.findAll();
    }
   
}
