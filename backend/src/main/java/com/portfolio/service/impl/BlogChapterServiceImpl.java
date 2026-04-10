package com.portfolio.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.portfolio.mapper.BlogChapterMapper;
import com.portfolio.model.entity.BlogChapter;
import com.portfolio.service.BlogChapterService;
import org.springframework.stereotype.Service;

@Service
public class BlogChapterServiceImpl extends ServiceImpl<BlogChapterMapper, BlogChapter> implements BlogChapterService {
}
