package com.sayacanaliz.backend_java.Controller;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sayacanaliz.backend_java.Entity.Anomali;
import com.sayacanaliz.backend_java.Service.AnomaliService;

@RestController
@RequestMapping("/anomali")
@CrossOrigin(origins = "*")
public class AnomaliController {
    private final AnomaliService anomaliService;
    
    public AnomaliController(AnomaliService anomaliService) {
        this.anomaliService = anomaliService;
    }


    @GetMapping("/liste")
    public List<Anomali> anomalileriListele(){
        return anomaliService.anomalileriListele();
    }
    
}
