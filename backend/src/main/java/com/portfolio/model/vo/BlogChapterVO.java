package com.portfolio.model.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class BlogChapterVO implements Serializable {
    private Long id;
    private String name;
    private String icon;
    private String description;
    private String link;
    private Integer sortOrder;
}
