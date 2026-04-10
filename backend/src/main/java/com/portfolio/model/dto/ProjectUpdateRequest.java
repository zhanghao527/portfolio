package com.portfolio.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.io.Serializable;

@Data
public class ProjectUpdateRequest implements Serializable {
    @NotNull(message = "ID不能为空")
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
