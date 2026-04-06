package com.portfolio.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserUpdateRequest implements Serializable {

    @NotNull(message = "用户ID不能为空")
    private Long id;

    private String userName;

    private String userAvatar;

    private String userProfile;

    private String userRole;
}
