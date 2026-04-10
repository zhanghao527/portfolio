package com.portfolio.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.portfolio.mapper.ProfileMapper;
import com.portfolio.model.entity.Profile;
import com.portfolio.service.ProfileService;
import org.springframework.stereotype.Service;

@Service
public class ProfileServiceImpl extends ServiceImpl<ProfileMapper, Profile> implements ProfileService {
}
