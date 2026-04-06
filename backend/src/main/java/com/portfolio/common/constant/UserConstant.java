package com.portfolio.common.constant;

public interface UserConstant {

    String DEFAULT_ROLE = "user";

    String ADMIN_ROLE = "admin";

    String BAN_ROLE = "ban";

    String AUTHORIZATION_HEADER = "Authorization";

    String TOKEN_PREFIX = "Bearer ";

    String LOGIN_TOKEN_KEY_PREFIX = "portfolio:user:login:token:";

    long LOGIN_TOKEN_TTL_DAYS = 7L;
}
