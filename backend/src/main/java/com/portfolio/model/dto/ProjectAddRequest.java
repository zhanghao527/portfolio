package com.portfolio.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.io.Serializable;

@Data
public class ProjectAddRequest implements Serializable {
    @NotBlank(message = "项目名称不能为空")
    private String name;
    private String description;
    private String icon;
    @NotBlank(message = "分类不能为空")
    private String category;
    private String screenshot;
    private String link;
    private String github;
    private Integer sortOrder;
}
