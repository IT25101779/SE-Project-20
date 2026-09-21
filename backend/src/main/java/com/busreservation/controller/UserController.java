package com.busreservation.controller;

import com.busreservation.dto.ChangePasswordRequest;
import com.busreservation.dto.UpdateProfileRequest;
import com.busreservation.dto.UserProfileDto;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.AdminService;
import com.busreservation.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** Core Function: User & Admin Management (owner: Kaweesha K.S.) - Passenger Profile & Account Management */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;
    private final AdminService adminService;

    @GetMapping("/me")
    public UserProfileDto getMyProfile() {
        User user = currentUserProvider.getCurrentUser();
        return userService.getProfile(user.getId());
    }

    @PutMapping("/me")
    public UserProfileDto updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUserProvider.getCurrentUser();
        UserProfileDto updated = userService.updateProfile(user.getId(), request);
        adminService.logAction(user.getId(), user.getName(), "USER_UPDATED_PROFILE", "User", user.getId(), "Updated profile details");
        return updated;
    }

    @PostMapping("/me/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserProvider.getCurrentUser();
        userService.changePassword(user.getId(), request);
        adminService.logAction(user.getId(), user.getName(), "USER_CHANGED_PASSWORD", "User", user.getId(), "Password updated");
    }

    @DeleteMapping("/me")
    public void deactivateAccount() {
        User user = currentUserProvider.getCurrentUser();
        userService.deactivateAccount(user.getId());
        adminService.logAction(user.getId(), user.getName(), "USER_SELF_DEACTIVATED", "User", user.getId(), "User deactivated their account");
    }
}
