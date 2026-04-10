package com.portfolio.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.portfolio.model.entity.Tech;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TechMapper extends BaseMapper<Tech> {
}
