package com.portfolio.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserAddRequest implements Serializable {

    @NotBlank(message = "账号不能为空")
    @Size(min = 4, message = "账号长度不能少于4位")
    private String userAccount;

    private String userPassword;

    private String userName;

    private String userAvatar;

    private String userProfile;

    private String userRole;
}
