package com.portfolio.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserLoginRequest implements Serializable {

    @NotBlank(message = "账号不能为空")
    private String userAccount;

    @NotBlank(message = "密码不能为空")
    private String userPassword;
}
