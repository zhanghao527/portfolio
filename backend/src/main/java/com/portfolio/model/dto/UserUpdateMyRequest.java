package com.portfolio.model.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户更新个人信息请求（仅允许修改昵称、头像、简介）
 */
@Data
public class UserUpdateMyRequest implements Serializable {

    private String userName;

    private String userAvatar;

    private String userProfile;
}
