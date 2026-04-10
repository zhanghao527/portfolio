package com.portfolio.model.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class ProjectVO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String category;
    private String screenshot;
    private String link;
    private String github;
    private Integer sortOrder;
}
