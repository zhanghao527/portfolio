package com.portfolio.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.portfolio.common.annotation.AuthCheck;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.api.Result;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.ThrowUtils;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.dto.TechAddRequest;
import com.portfolio.model.dto.TechUpdateRequest;
import com.portfolio.model.entity.Tech;
import com.portfolio.model.vo.TechVO;
import com.portfolio.service.TechService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tech")
@RequiredArgsConstructor
public class TechController {

    private final TechService techService;

    @GetMapping("/list")
    public Result<List<TechVO>> listTechs() {
        QueryWrapper<Tech> qw = new QueryWrapper<>();
        qw.orderByAsc("sort_order").orderByDesc("create_time");
        List<Tech> list = techService.list(qw);
        List<TechVO> voList = list.stream()
                .map(t -> BeanCopyUtils.copyBean(t, TechVO.class))
                .collect(Collectors.toList());
        return Result.success(voList);
    }

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Long> addTech(@RequestBody @Valid TechAddRequest request) {
        Tech tech = BeanCopyUtils.copyBean(request, Tech.class);
        if (tech.getSortOrder() == null) tech.setSortOrder(0);
        boolean saved = techService.save(tech);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);
        return Result.success(tech.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> updateTech(@RequestBody @Valid TechUpdateRequest request) {
        ThrowUtils.throwIf(request.getId() == null, ErrorCode.PARAMS_ERROR);
        Tech tech = BeanCopyUtils.copyBean(request, Tech.class);
        boolean updated = techService.updateById(tech);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> deleteTech(@RequestBody long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        boolean removed = techService.removeById(id);
        return Result.success(removed);
    }
}
