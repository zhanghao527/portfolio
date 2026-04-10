package com.portfolio.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("project")
public class Project implements Serializable {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String category;
    private String screenshot;
    private String link;
    private String github;
    private Integer sortOrder;
    private Date createTime;
    private Date updateTime;
    @TableLogic
    private Integer isDelete;
}
