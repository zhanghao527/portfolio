USE portfolio_db;

-- 个人信息表
CREATE TABLE IF NOT EXISTS `profile` (
    `id`          BIGINT       NOT NULL COMMENT '主键',
    `name`        VARCHAR(64)  NOT NULL COMMENT '姓名',
    `role_title`  VARCHAR(128) NULL DEFAULT NULL COMMENT '角色头衔',
    `bio`         VARCHAR(512) NULL DEFAULT NULL COMMENT '个人简介',
    `avatar`      VARCHAR(512) NULL DEFAULT NULL COMMENT '头像URL',
    `github_url`  VARCHAR(512) NULL DEFAULT NULL COMMENT 'GitHub链接',
    `email`       VARCHAR(128) NULL DEFAULT NULL COMMENT '邮箱',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_delete`   TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人信息表';

-- 项目表
CREATE TABLE IF NOT EXISTS `project` (
    `id`          BIGINT       NOT NULL COMMENT '主键',
    `name`        VARCHAR(128) NOT NULL COMMENT '项目名称',
    `description` VARCHAR(512) NULL DEFAULT NULL COMMENT '项目描述',
    `icon`        VARCHAR(32)  NULL DEFAULT NULL COMMENT '图标emoji',
    `category`    VARCHAR(32)  NOT NULL COMMENT '分类：Web/小程序/App/硬件/嵌入式/工具',
    `screenshot`  VARCHAR(512) NULL DEFAULT NULL COMMENT '截图URL',
    `link`        VARCHAR(512) NULL DEFAULT NULL COMMENT '项目链接',
    `github`      VARCHAR(512) NULL DEFAULT NULL COMMENT 'GitHub链接',
    `sort_order`  INT          NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_delete`   TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 技术栈表
CREATE TABLE IF NOT EXISTS `tech` (
    `id`          BIGINT       NOT NULL COMMENT '主键',
    `name`        VARCHAR(64)  NOT NULL COMMENT '技术名称',
    `icon`        VARCHAR(32)  NULL DEFAULT NULL COMMENT '图标emoji',
    `category`    VARCHAR(64)  NOT NULL COMMENT '分类：前端/后端/数据库 & 存储/DevOps & 工具',
    `sort_order`  INT          NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_delete`   TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技术栈表';

-- 博客章节表
CREATE TABLE IF NOT EXISTS `blog_chapter` (
    `id`          BIGINT       NOT NULL COMMENT '主键',
    `name`        VARCHAR(128) NOT NULL COMMENT '章节名称',
    `icon`        VARCHAR(32)  NULL DEFAULT NULL COMMENT '图标emoji',
    `description` VARCHAR(512) NULL DEFAULT NULL COMMENT '章节描述',
    `link`        VARCHAR(512) NOT NULL COMMENT '语雀链接',
    `sort_order`  INT          NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_delete`   TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='博客章节表';

-- 种子数据：个人信息
INSERT INTO `profile` (`id`, `name`, `role_title`, `bio`, `avatar`, `github_url`, `email`)
VALUES (1, 'Zhang Hao', '全栈开发者 · 开源爱好者', '热爱技术，喜欢用代码解决问题。专注于 Web 全栈开发，持续学习中。', '/avatar.jpg', 'https://github.com/zhanghao527', 'zhanghao527mail@163.com');
