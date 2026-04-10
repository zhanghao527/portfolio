package com.portfolio.controller;

import com.portfolio.common.annotation.AuthCheck;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.api.Result;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.ThrowUtils;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.dto.ProfileUpdateRequest;
import com.portfolio.model.entity.Profile;
import com.portfolio.model.vo.ProfileVO;
import com.portfolio.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/get")
    public Result<ProfileVO> getProfile() {
        Profile profile = profileService.getById(1L);
        if (profile == null) {
            return Result.success(null);
        }
        return Result.success(BeanCopyUtils.copyBean(profile, ProfileVO.class));
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> updateProfile(@RequestBody @Valid ProfileUpdateRequest request) {
        ThrowUtils.throwIf(request == null, ErrorCode.PARAMS_ERROR);
        Profile profile = BeanCopyUtils.copyBean(request, Profile.class);
        profile.setId(1L);
        boolean updated = profileService.saveOrUpdate(profile);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }
}
