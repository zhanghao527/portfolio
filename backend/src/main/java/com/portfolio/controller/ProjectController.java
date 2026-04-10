package com.portfolio.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.portfolio.common.annotation.AuthCheck;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.api.Result;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.ThrowUtils;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.dto.ProjectAddRequest;
import com.portfolio.model.dto.ProjectUpdateRequest;
import com.portfolio.model.entity.Project;
import com.portfolio.model.vo.ProjectVO;
import com.portfolio.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/list")
    public Result<List<ProjectVO>> listProjects() {
        QueryWrapper<Project> qw = new QueryWrapper<>();
        qw.orderByAsc("sort_order").orderByDesc("create_time");
        List<Project> list = projectService.list(qw);
        List<ProjectVO> voList = list.stream()
                .map(p -> BeanCopyUtils.copyBean(p, ProjectVO.class))
                .collect(Collectors.toList());
        return Result.success(voList);
    }

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Long> addProject(@RequestBody @Valid ProjectAddRequest request) {
        Project project = BeanCopyUtils.copyBean(request, Project.class);
        if (project.getSortOrder() == null) project.setSortOrder(0);
        boolean saved = projectService.save(project);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);
        return Result.success(project.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> updateProject(@RequestBody @Valid ProjectUpdateRequest request) {
        ThrowUtils.throwIf(request.getId() == null, ErrorCode.PARAMS_ERROR);
        Project project = BeanCopyUtils.copyBean(request, Project.class);
        boolean updated = projectService.updateById(project);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> deleteProject(@RequestBody long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        boolean removed = projectService.removeById(id);
        return Result.success(removed);
    }
}
