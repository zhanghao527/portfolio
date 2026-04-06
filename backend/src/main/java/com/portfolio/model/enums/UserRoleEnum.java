package com.portfolio.model.enums;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum UserRoleEnum {

    USER("用户", "user"),
    ADMIN("管理员", "admin"),
    BAN("封禁", "ban");

    private final String text;
    private final String value;

    UserRoleEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    public static UserRoleEnum getEnumByValue(String value) {
        if (value == null) {
            return null;
        }
        return Arrays.stream(values())
                .filter(e -> e.value.equals(value))
                .findFirst()
                .orElse(null);
    }
}
