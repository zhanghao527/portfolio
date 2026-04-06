package com.portfolio.common.exception;

import com.portfolio.common.api.ErrorCode;

public class ThrowUtils {

    public static void throwIf(boolean condition, ErrorCode errorCode) {
        throwIf(condition, new BusinessException(errorCode));
    }

    public static void throwIf(boolean condition, ErrorCode errorCode, String message) {
        throwIf(condition, new BusinessException(errorCode, message));
    }

    public static void throwIf(boolean condition, RuntimeException exception) {
        if (condition) {
            throw exception;
        }
    }
}
