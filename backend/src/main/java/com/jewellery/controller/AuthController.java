package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.entity.User;
import com.jewellery.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @GetMapping("/test")
    public String test() {
        return "Backend Working";
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody User user) {
        return ResponseEntity.ok(ApiResponse.success(userService.signup(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody Map<String, String> credentials) {
        String loginId = credentials.get("loginId"); // email or phone
        String password = credentials.get("password");
        
        Optional<User> user = userService.login(loginId, password);
        if (user.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(user.get()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("தவறான மின்னஞ்சல்/செல்பேசி எண் அல்லது கடவுச்சொல்"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> user = userService.forgotPassword(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("புதிய கடவுச்சொல்: " + user.get().getPassword()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("இந்த மின்அஞ்சல் முகவரி பதிவு செய்யப்படவில்லை"));
    }
}
