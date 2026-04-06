package com.portfolio.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.BusinessException;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.common.utils.TokenUtils;
import com.portfolio.mapper.UserMapper;
import com.portfolio.model.entity.User;
import com.portfolio.model.vo.LoginUserVO;
import com.portfolio.model.vo.UserVO;
import com.portfolio.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();
    private final TokenUtils tokenUtils;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public long userRegister(String userAccount, String userPassword, String checkPassword) {
        if (StrUtil.hasBlank(userAccount, userPassword, checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户账号过短");
        }
        if (userPassword.length() < 8 || checkPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户密码过短");
        }
        if (!userPassword.equals(checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
        }
        synchronized (userAccount.intern()) {
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("user_account", userAccount);
            long count = this.baseMapper.selectCount(queryWrapper);
            if (count > 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号重复");
            }
            String encryptPassword = getEncryptPassword(userPassword);
            User user = new User();
            user.setUserAccount(userAccount);
            user.setUserPassword(encryptPassword);
            user.setUserRole(UserConstant.DEFAULT_ROLE);
            boolean saved = this.save(user);
            if (!saved) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "注册失败，数据库错误");
            }
            return user.getId();
        }
    }

    @Override
    public LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request) {
        if (StrUtil.hasBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号错误");
        }
        if (userPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码错误");
        }
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_account", userAccount);
        User user = this.baseMapper.selectOne(queryWrapper);
        if (user == null || !PASSWORD_ENCODER.matches(userPassword, user.getUserPassword())) {
            log.info("user login failed, userAccount cannot match userPassword");
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户不存在或密码错误");
        }
        LoginUserVO loginUserVO = getLoginUserVO(user);
        loginUserVO.setToken(tokenUtils.createLoginToken(user.getId()));
        return loginUserVO;
    }

    @Override
    public User getLoginUser(HttpServletRequest request) {
        Long userId = tokenUtils.getLoginUserId(request);
        if (userId == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        User currentUser = this.getById(userId);
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        return currentUser;
    }

    @Override
    public boolean userLogout(HttpServletRequest request) {
        if (!tokenUtils.removeLoginToken(request)) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR, "未登录");
        }
        return true;
    }

    @Override
    public UserVO getUserVO(User user) {
        if (user == null) {
            return null;
        }
        return BeanCopyUtils.copyBean(user, UserVO.class);
    }

    @Override
    public List<UserVO> getUserVOList(List<User> userList) {
        if (CollUtil.isEmpty(userList)) {
            return new ArrayList<>();
        }
        return userList.stream().map(this::getUserVO).collect(Collectors.toList());
    }

    @Override
    public String getEncryptPassword(String userPassword) {
        return PASSWORD_ENCODER.encode(userPassword);
    }

    private LoginUserVO getLoginUserVO(User user) {
        if (user == null) {
            return null;
        }
        return BeanCopyUtils.copyBean(user, LoginUserVO.class);
    }
}
