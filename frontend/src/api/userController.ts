import request from "@/libs/request";

/** 用户注册 POST /api/user/register */
export async function userRegister(body: API.UserRegisterRequest) {
  return request<API.BaseResponse<number>>("/api/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 用户登录 POST /api/user/login */
export async function userLogin(body: API.UserLoginRequest) {
  return request<API.BaseResponse<API.LoginUserVO>>("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 用户登出 POST /api/user/logout */
export async function userLogout() {
  return request<API.BaseResponse<boolean>>("/api/user/logout", {
    method: "POST",
  });
}

/** 获取当前登录用户 GET /api/user/get/login */
export async function getLoginUser() {
  return request<API.BaseResponse<API.LoginUserVO>>("/api/user/get/login", {
    method: "GET",
  });
}

/** 分页查询用户列表 POST /api/user/list/page */
export async function listUserByPage(body: API.UserQueryRequest) {
  return request<API.BaseResponse<API.PageUserVO>>("/api/user/list/page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 新增用户 POST /api/user/add */
export async function addUser(body: API.UserAddRequest) {
  return request<API.BaseResponse<number>>("/api/user/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 删除用户 POST /api/user/delete */
export async function deleteUser(body: API.DeleteRequest) {
  return request<API.BaseResponse<boolean>>("/api/user/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 更新用户（管理员） POST /api/user/update */
export async function updateUser(body: API.UserUpdateRequest) {
  return request<API.BaseResponse<boolean>>("/api/user/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}

/** 更新个人信息 POST /api/user/update/my */
export async function updateMyUser(body: { userName?: string; userAvatar?: string; userProfile?: string }) {
  return request<API.BaseResponse<boolean>>("/api/user/update/my", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: body,
  });
}
