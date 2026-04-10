package com.portfolio.model.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class TechVO implements Serializable {
    private Long id;
    private String name;
    private String icon;
    private String category;
    private Integer sortOrder;
}
