package com.portfolio.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.io.Serializable;

@Data
public class TechAddRequest implements Serializable {
    @NotBlank(message = "技术名称不能为空")
    private String name;
    private String icon;
    @NotBlank(message = "分类不能为空")
    private String category;
    private Integer sortOrder;
}
