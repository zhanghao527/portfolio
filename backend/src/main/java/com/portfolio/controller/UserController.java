package com.portfolio.controller;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.portfolio.common.annotation.AuthCheck;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.api.Result;
import com.portfolio.common.constant.CommonConstant;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.BusinessException;
import com.portfolio.common.exception.ThrowUtils;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.dto.*;
import com.portfolio.model.entity.User;
import com.portfolio.model.vo.LoginUserVO;
import com.portfolio.model.vo.UserVO;
import com.portfolio.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 允许排序的字段白名单，防止 SQL 注入
     */
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "create_time", "update_time");

    @PostMapping("/register")
    public Result<Long> userRegister(@RequestBody @Valid UserRegisterRequest userRegisterRequest) {
        String userAccount = userRegisterRequest.getUserAccount();
        String userPassword = userRegisterRequest.getUserPassword();
        String checkPassword = userRegisterRequest.getCheckPassword();
        long result = userService.userRegister(userAccount, userPassword, checkPassword);
        return Result.success(result);
    }

    @PostMapping("/login")
    public Result<LoginUserVO> userLogin(@RequestBody @Valid UserLoginRequest userLoginRequest, HttpServletRequest request) {
        String userAccount = userLoginRequest.getUserAccount();
        String userPassword = userLoginRequest.getUserPassword();
        LoginUserVO loginUserVO = userService.userLogin(userAccount, userPassword, request);
        return Result.success(loginUserVO);
    }

    @PostMapping("/logout")
    public Result<Boolean> userLogout(HttpServletRequest request) {
        boolean result = userService.userLogout(request);
        return Result.success(result);
    }

    @GetMapping("/get/login")
    public Result<LoginUserVO> getLoginUser(HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        return Result.success(BeanCopyUtils.copyBean(user, LoginUserVO.class));
    }

    @GetMapping("/get")
    public Result<UserVO> getUserById(long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        User user = userService.getById(id);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR);
        return Result.success(userService.getUserVO(user));
    }

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Long> addUser(@RequestBody @Valid UserAddRequest userAddRequest) {
        ThrowUtils.throwIf(userAddRequest == null, ErrorCode.PARAMS_ERROR);
        User user = BeanCopyUtils.copyBean(userAddRequest, User.class);
        if (StrUtil.isNotBlank(user.getUserPassword())) {
            user.setUserPassword(userService.getEncryptPassword(user.getUserPassword()));
        } else {
            user.setUserPassword(userService.getEncryptPassword("12345678"));
        }
        if (StrUtil.isBlank(user.getUserRole())) {
            user.setUserRole(UserConstant.DEFAULT_ROLE);
        }
        boolean saved = userService.save(user);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);
        return Result.success(user.getId());
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> deleteUser(@RequestBody long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        boolean removed = userService.removeById(id);
        return Result.success(removed);
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> updateUser(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        ThrowUtils.throwIf(userUpdateRequest == null || userUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);
        User user = BeanCopyUtils.copyBean(userUpdateRequest, User.class);
        boolean updated = userService.updateById(user);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }

    @PostMapping("/update/my")
    public Result<Boolean> updateMyUser(@RequestBody UserUpdateMyRequest userUpdateMyRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(userUpdateMyRequest == null, ErrorCode.PARAMS_ERROR);
        User loginUser = userService.getLoginUser(request);
        User user = new User();
        user.setId(loginUser.getId());
        user.setUserName(userUpdateMyRequest.getUserName());
        user.setUserAvatar(userUpdateMyRequest.getUserAvatar());
        user.setUserProfile(userUpdateMyRequest.getUserProfile());
        boolean updated = userService.updateById(user);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }

    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Page<UserVO>> listUserByPage(@RequestBody @Valid UserQueryRequest userQueryRequest) {
        ThrowUtils.throwIf(userQueryRequest == null, ErrorCode.PARAMS_ERROR);
        long pageNum = userQueryRequest.getPageNum();
        long pageSize = userQueryRequest.getPageSize();
        ThrowUtils.throwIf(pageSize > 50, ErrorCode.PARAMS_ERROR, "单页数量不能超过50");

        Page<User> userPage = userService.page(new Page<>(pageNum, pageSize), getQueryWrapper(userQueryRequest));
        Page<UserVO> userVOPage = new Page<>(pageNum, pageSize, userPage.getTotal());
        userVOPage.setRecords(userService.getUserVOList(userPage.getRecords()));
        return Result.success(userVOPage);
    }

    private QueryWrapper<User> getQueryWrapper(UserQueryRequest userQueryRequest) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        if (userQueryRequest == null) {
            return queryWrapper;
        }
        Long id = userQueryRequest.getId();
        String userAccount = userQueryRequest.getUserAccount();
        String userName = userQueryRequest.getUserName();
        String userProfile = userQueryRequest.getUserProfile();
        String userRole = userQueryRequest.getUserRole();
        String sortField = userQueryRequest.getSortField();
        String sortOrder = userQueryRequest.getSortOrder();

        queryWrapper.eq(id != null, "id", id);
        queryWrapper.eq(StrUtil.isNotBlank(userAccount), "user_account", userAccount);
        queryWrapper.like(StrUtil.isNotBlank(userName), "user_name", userName);
        queryWrapper.like(StrUtil.isNotBlank(userProfile), "user_profile", userProfile);
        queryWrapper.eq(StrUtil.isNotBlank(userRole), "user_role", userRole);
        queryWrapper.orderBy(StrUtil.isNotBlank(sortField) && ALLOWED_SORT_FIELDS.contains(sortField),
                CommonConstant.SORT_ORDER_ASC.equals(sortOrder), sortField);
        return queryWrapper;
    }
}
