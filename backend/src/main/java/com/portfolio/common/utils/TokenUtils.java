package com.portfolio.common.utils;

import cn.hutool.core.util.StrUtil;
import com.portfolio.common.constant.UserConstant;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TokenUtils {

    private final StringRedisTemplate stringRedisTemplate;

    public String createLoginToken(Long userId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        stringRedisTemplate.opsForValue().set(buildTokenKey(token), String.valueOf(userId), Duration.ofDays(UserConstant.LOGIN_TOKEN_TTL_DAYS));
        return token;
    }

    public Long getLoginUserId(HttpServletRequest request) {
        String token = extractToken(request);
        if (StrUtil.isBlank(token)) {
            return null;
        }
        String userId = stringRedisTemplate.opsForValue().get(buildTokenKey(token));
        if (StrUtil.isBlank(userId)) {
            return null;
        }
        stringRedisTemplate.expire(buildTokenKey(token), Duration.ofDays(UserConstant.LOGIN_TOKEN_TTL_DAYS));
        return Long.valueOf(userId);
    }

    public boolean removeLoginToken(HttpServletRequest request) {
        String token = extractToken(request);
        if (StrUtil.isBlank(token)) {
            return false;
        }
        return Boolean.TRUE.equals(stringRedisTemplate.delete(buildTokenKey(token)));
    }

    private String extractToken(HttpServletRequest request) {
        String authorization = request.getHeader(UserConstant.AUTHORIZATION_HEADER);
        if (StrUtil.isBlank(authorization)) {
            return null;
        }
        if (StrUtil.startWithIgnoreCase(authorization, UserConstant.TOKEN_PREFIX)) {
            return StrUtil.trim(authorization.substring(UserConstant.TOKEN_PREFIX.length()));
        }
        return StrUtil.trim(authorization);
    }

    private String buildTokenKey(String token) {
        return UserConstant.LOGIN_TOKEN_KEY_PREFIX + token;
    }
}
