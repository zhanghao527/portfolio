declare namespace API {
  type BaseResponse<T> = {
    code?: number;
    data?: T;
    message?: string;
  };

  type LoginUserVO = {
    id?: number;
    token?: string;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  };

  type UserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserRegisterRequest = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  };

  type UserAddRequest = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserQueryRequest = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    userName?: string;
    userAccount?: string;
    userRole?: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type PageUserVO = {
    records?: UserVO[];
    total?: number;
    size?: number;
    current?: number;
    pages?: number;
  };
}

declare namespace API {
  // ── Content types ──

  type ProfileVO = {
    id?: number;
    name?: string;
    roleTitle?: string;
    bio?: string;
    avatar?: string;
    githubUrl?: string;
    email?: string;
  };

  type ProfileUpdateRequest = {
    name?: string;
    roleTitle?: string;
    bio?: string;
    avatar?: string;
    githubUrl?: string;
    email?: string;
  };

  type ProjectVO = {
    id?: number;
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
    screenshot?: string;
    link?: string;
    github?: string;
    sortOrder?: number;
  };

  type ProjectAddRequest = {
    name: string;
    description?: string;
    icon?: string;
    category: string;
    screenshot?: string;
    link?: string;
    github?: string;
    sortOrder?: number;
  };

  type ProjectUpdateRequest = {
    id: number;
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
    screenshot?: string;
    link?: string;
    github?: string;
    sortOrder?: number;
  };

  type TechVO = {
    id?: number;
    name?: string;
    icon?: string;
    category?: string;
    sortOrder?: number;
  };

  type TechAddRequest = {
    name: string;
    icon?: string;
    category: string;
    sortOrder?: number;
  };

  type TechUpdateRequest = {
    id: number;
    name?: string;
    icon?: string;
    category?: string;
    sortOrder?: number;
  };

  type BlogChapterVO = {
    id?: number;
    name?: string;
    icon?: string;
    description?: string;
    link?: string;
    sortOrder?: number;
  };

  type BlogChapterAddRequest = {
    name: string;
    icon?: string;
    description?: string;
    link: string;
    sortOrder?: number;
  };

  type BlogChapterUpdateRequest = {
    id: number;
    name?: string;
    icon?: string;
    description?: string;
    link?: string;
    sortOrder?: number;
  };
}
