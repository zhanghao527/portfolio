package com.portfolio.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.portfolio.model.entity.Profile;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProfileMapper extends BaseMapper<Profile> {
}
