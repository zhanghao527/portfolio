package com.portfolio.model.vo;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 聚合所有首页展示数据，减少前端请求次数
 */
@Data
public class ContentAllVO implements Serializable {
    private ProfileVO profile;
    private List<ProjectVO> projects;
    private List<TechVO> techs;
    private List<BlogChapterVO> blogChapters;
}
