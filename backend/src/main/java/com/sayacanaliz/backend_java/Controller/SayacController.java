package com.sayacanaliz.backend_java.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sayacanaliz.backend_java.Entity.Sayac;
import com.sayacanaliz.backend_java.Service.SayacService;

@RestController
@RequestMapping("/sayac")
@CrossOrigin(origins = "*")
public class SayacController {
    
    @Autowired
    private SayacService sayacService;

    public SayacController(SayacService sayacService) {
        this.sayacService = sayacService;
    }

    @GetMapping("/liste")
    public List<Sayac> sayaclariListele(){
        return sayacService.sayaclariListele();
    }


  
}
