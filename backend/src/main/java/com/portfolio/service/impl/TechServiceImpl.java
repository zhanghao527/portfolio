package com.portfolio.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.portfolio.mapper.TechMapper;
import com.portfolio.model.entity.Tech;
import com.portfolio.service.TechService;
import org.springframework.stereotype.Service;

@Service
public class TechServiceImpl extends ServiceImpl<TechMapper, Tech> implements TechService {
}
