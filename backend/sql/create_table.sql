-- 创建数据库
CREATE DATABASE IF NOT EXISTS portfolio_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id`            BIGINT       NOT NULL COMMENT '主键（雪花算法生成）',
    `user_account`  VARCHAR(64)  NOT NULL COMMENT '账号',
    `user_password` VARCHAR(128) NOT NULL COMMENT '密码',
    `user_name`     VARCHAR(64)  NULL     DEFAULT NULL COMMENT '用户昵称',
    `user_avatar`   VARCHAR(512) NULL     DEFAULT NULL COMMENT '用户头像',
    `user_profile`  VARCHAR(512) NULL     DEFAULT NULL COMMENT '用户简介',
    `user_role`     VARCHAR(32)  NOT NULL DEFAULT 'user' COMMENT '用户角色：user/admin/ban',
    `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_delete`     TINYINT      NOT NULL DEFAULT 0 COMMENT '是否删除（0-未删 1-已删）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_account` (`user_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 种子数据：默认管理员（密码: 12345678，BCrypt 加密）
INSERT INTO `user` (`id`, `user_account`, `user_password`, `user_name`, `user_role`)
VALUES (1, 'admin', '$2a$10$YVS4FzXRRGbsaU6WHj/jkesZBRvJcMN3P/gKCmSMzf/6pByBmwDCy', '管理员', 'admin');

-- 种子数据：普通测试用户（密码: 12345678）
INSERT INTO `user` (`id`, `user_account`, `user_password`, `user_name`, `user_role`)
VALUES (2, 'testuser', '$2a$10$YVS4FzXRRGbsaU6WHj/jkesZBRvJcMN3P/gKCmSMzf/6pByBmwDCy', '测试用户', 'user');
