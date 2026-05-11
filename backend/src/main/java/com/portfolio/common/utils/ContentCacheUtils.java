package com.portfolio.common.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * 内容缓存失效工具，admin 写操作后调用 evict() 清除缓存
 */
@Component
@RequiredArgsConstructor
public class ContentCacheUtils {

    private static final String CACHE_KEY = "portfolio:content:all";

    private final StringRedisTemplate redisTemplate;

    public void evict() {
        redisTemplate.delete(CACHE_KEY);
    }
}
