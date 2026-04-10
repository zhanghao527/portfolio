package com.portfolio.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.io.Serializable;

@Data
public class BlogChapterAddRequest implements Serializable {
    @NotBlank(message = "章节名称不能为空")
    private String name;
    private String icon;
    private String description;
    @NotBlank(message = "链接不能为空")
    private String link;
    private Integer sortOrder;
}
