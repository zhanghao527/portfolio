package com.portfolio.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.common.api.Result;
import com.portfolio.common.utils.BeanCopyUtils;
import com.portfolio.model.entity.BlogChapter;
import com.portfolio.model.entity.Profile;
import com.portfolio.model.entity.Project;
import com.portfolio.model.entity.Tech;
import com.portfolio.model.vo.BlogChapterVO;
import com.portfolio.model.vo.ContentAllVO;
import com.portfolio.model.vo.ProfileVO;
import com.portfolio.model.vo.ProjectVO;
import com.portfolio.model.vo.TechVO;
import com.portfolio.service.BlogChapterService;
import com.portfolio.service.ProfileService;
import com.portfolio.service.ProjectService;
import com.portfolio.service.TechService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 聚合内容查询接口，一次性返回首页所需全部数据，带 Redis 缓存
 */
@Slf4j
@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class ContentController {

    private static final String CACHE_KEY = "portfolio:content:all";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final ProfileService profileService;
    private final ProjectService projectService;
    private final TechService techService;
    private final BlogChapterService blogChapterService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @GetMapping("/all")
    public Result<ContentAllVO> getAll() {
        // 先读缓存
        String cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached != null) {
            try {
                return Result.success(objectMapper.readValue(cached, ContentAllVO.class));
            } catch (Exception e) {
                log.warn("Failed to parse cached content, will reload", e);
            }
        }

        // 缓存未命中，查询数据库
        ContentAllVO vo = loadFromDb();

        // 写入缓存
        try {
            redisTemplate.opsForValue().set(CACHE_KEY, objectMapper.writeValueAsString(vo), CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache content", e);
        }
        return Result.success(vo);
    }

    private ContentAllVO loadFromDb() {
        ContentAllVO vo = new ContentAllVO();

        Profile profile = profileService.getById(1L);
        vo.setProfile(profile == null ? null : BeanCopyUtils.copyBean(profile, ProfileVO.class));

        QueryWrapper<Project> pw = new QueryWrapper<>();
        pw.orderByAsc("sort_order").orderByDesc("create_time");
        List<ProjectVO> projects = projectService.list(pw).stream()
                .map(p -> BeanCopyUtils.copyBean(p, ProjectVO.class))
                .collect(Collectors.toList());
        vo.setProjects(projects);

        QueryWrapper<Tech> tw = new QueryWrapper<>();
        tw.orderByAsc("sort_order").orderByDesc("create_time");
        List<TechVO> techs = techService.list(tw).stream()
                .map(t -> BeanCopyUtils.copyBean(t, TechVO.class))
                .collect(Collectors.toList());
        vo.setTechs(techs);

        QueryWrapper<BlogChapter> bw = new QueryWrapper<>();
        bw.orderByAsc("sort_order").orderByDesc("create_time");
        List<BlogChapterVO> blogChapters = blogChapterService.list(bw).stream()
                .map(b -> BeanCopyUtils.copyBean(b, BlogChapterVO.class))
                .collect(Collectors.toList());
        vo.setBlogChapters(blogChapters);

        return vo;
    }

    /** 管理端写入后调用此方法清除缓存 */
    public static String cacheKey() {
        return CACHE_KEY;
    }
}
