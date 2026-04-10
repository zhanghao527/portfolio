package com.portfolio.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.portfolio.mapper.ProjectMapper;
import com.portfolio.model.entity.Project;
import com.portfolio.service.ProjectService;
import org.springframework.stereotype.Service;

@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {
}
