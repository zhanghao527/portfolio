package com.portfolio.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.io.Serializable;

@Data
public class BlogChapterUpdateRequest implements Serializable {
    @NotNull(message = "ID不能为空")
    private Long id;
    private String name;
    private String icon;
    private String description;
    private String link;
    private Integer sortOrder;
}
