# 模版 A：Spring Boot 单体 + MVC 三层架构

## 简介

适用于中小型后台 / 管理系统的快速开发模版，采用经典 Controller → Service → Mapper 三层架构。

## 技术栈

- Java 17
- Spring Boot 3.2.5
- MyBatis-Plus 3.5.9
- Knife4j 4.4.0（接口文档）
- Hutool 5.8.26（工具库）

## 包结构

```
com.example.template
├── config/          全局配置（MVC、跨域、Swagger、MyBatis）
├── controller/      REST 控制器
├── service/         业务接口
│   └── impl/        业务实现
├── mapper/          MyBatis-Plus Mapper
├── model/
│   ├── entity/      持久化实体
│   ├── dto/         请求对象
│   ├── vo/          响应对象
│   └── enums/       枚举
└── common/
    ├── api/         统一响应体、分页、错误码
    ├── exception/   异常类、全局异常处理器
    ├── constant/    常量
    ├── utils/       工具类
    ├── annotation/  自定义注解
    └── aop/         切面（鉴权等）
```

## 快速开始

1. 修改 `application.yml` 中的数据库连接信息
2. 创建数据库并执行建表 SQL，确保 Redis 可用
3. 运行 `TemplateApplication.main()`
4. 访问 `http://localhost:8080/api/doc.html` 查看接口文档

## 内置功能

- 统一响应体 `Result<T>`
- 统一错误码 `ErrorCode`
- 全局异常处理
- 通用分页请求
- AOP 鉴权注解 `@AuthCheck`
- 基于 Redis 的 Bearer Token 登录态
- 用户模块示例（注册、登录、CRUD）

## 鉴权说明

- 模版默认使用 Bearer Token 鉴权，而不是 session / cookie
- 调用 `/api/user/login` 成功后会返回 token
- 后续请求需携带 `Authorization: Bearer <token>`
- 调用 `/api/user/logout` 会删除 Redis 中的登录 token

## 默认账号

执行 `sql/create_table.sql` 后自动插入种子数据：

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | 12345678 | 管理员 |
| testuser | 12345678 | 普通用户 |
