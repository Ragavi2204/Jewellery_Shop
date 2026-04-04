package com.jewellery.service;

import com.jewellery.entity.User;
import com.jewellery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User signup(User user) {
        if (userRepository.findByEmailOrPhoneNumber(user.getEmail(), user.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Email or Phone number already registered");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("admin");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> login(String loginId, String password) {
        Optional<User> userOpt = userRepository.findByEmailOrPhoneNumber(loginId, loginId);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    public Optional<User> forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String tempPass = "Temp123456"; // In real app, generate random and send email
            user.setPassword(passwordEncoder.encode(tempPass));
            userRepository.save(user);
            user.setPassword(tempPass); // Set temp pass to return to user for demo
            return Optional.of(user);
        }
        return Optional.empty();
    }
}
