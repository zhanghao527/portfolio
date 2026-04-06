package com.portfolio.common.api;

import lombok.Data;

import java.io.Serializable;

@Data
public class Result<T> implements Serializable {

    private int code;
    private T data;
    private String message;

    private Result(int code, T data, String message) {
        this.code = code;
        this.data = data;
        this.message = message;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), data, ErrorCode.SUCCESS.getMessage());
    }

    public static <T> Result<T> error(ErrorCode errorCode) {
        return new Result<>(errorCode.getCode(), null, errorCode.getMessage());
    }

    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, null, message);
    }

    public static <T> Result<T> error(ErrorCode errorCode, String message) {
        return new Result<>(errorCode.getCode(), null, message);
    }
}
