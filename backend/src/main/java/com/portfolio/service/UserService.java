package com.portfolio.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.portfolio.model.entity.User;
import com.portfolio.model.vo.LoginUserVO;
import com.portfolio.model.vo.UserVO;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface UserService extends IService<User> {

    long userRegister(String userAccount, String userPassword, String checkPassword);

    LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request);

    User getLoginUser(HttpServletRequest request);

    boolean userLogout(HttpServletRequest request);

    UserVO getUserVO(User user);

    List<UserVO> getUserVOList(List<User> userList);

    String getEncryptPassword(String userPassword);
}
