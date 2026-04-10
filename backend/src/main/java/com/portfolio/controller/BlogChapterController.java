package com.portfolio.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.portfolio.common.annotation.AuthCheck;
import com.portfolio.common.api.ErrorCode;
import com.portfolio.common.api.Result;
import com.portfolio.common.constant.UserConstant;
import com.portfolio.common.exception.ThrowUtils;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.dto.BlogChapterAddRequest;
import com.portfolio.model.dto.BlogChapterUpdateRequest;
import com.portfolio.model.entity.BlogChapter;
import com.portfolio.model.vo.BlogChapterVO;
import com.portfolio.service.BlogChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/blog-chapter")
@RequiredArgsConstructor
public class BlogChapterController {

    private final BlogChapterService blogChapterService;

    @GetMapping("/list")
    public Result<List<BlogChapterVO>> listBlogChapters() {
        QueryWrapper<BlogChapter> qw = new QueryWrapper<>();
        qw.orderByAsc("sort_order").orderByDesc("create_time");
        List<BlogChapter> list = blogChapterService.list(qw);
        List<BlogChapterVO> voList = list.stream()
                .map(b -> BeanCopyUtils.copyBean(b, BlogChapterVO.class))
                .collect(Collectors.toList());
        return Result.success(voList);
    }

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Long> addBlogChapter(@RequestBody @Valid BlogChapterAddRequest request) {
        BlogChapter chapter = BeanCopyUtils.copyBean(request, BlogChapter.class);
        if (chapter.getSortOrder() == null) chapter.setSortOrder(0);
        boolean saved = blogChapterService.save(chapter);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);
        return Result.success(chapter.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> updateBlogChapter(@RequestBody @Valid BlogChapterUpdateRequest request) {
        ThrowUtils.throwIf(request.getId() == null, ErrorCode.PARAMS_ERROR);
        BlogChapter chapter = BeanCopyUtils.copyBean(request, BlogChapter.class);
        boolean updated = blogChapterService.updateById(chapter);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR);
        return Result.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public Result<Boolean> deleteBlogChapter(@RequestBody long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        boolean removed = blogChapterService.removeById(id);
        return Result.success(removed);
    }
}
