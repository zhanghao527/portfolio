package com.portfolio.controller;

import com.portfolio.common.api.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MainController {

    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("ok");
    }
}
