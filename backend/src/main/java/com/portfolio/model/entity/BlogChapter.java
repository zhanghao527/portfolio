package com.portfolio.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("blog_chapter")
public class BlogChapter implements Serializable {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String name;
    private String icon;
    private String description;
    private String link;
    private Integer sortOrder;
    private Date createTime;
    private Date updateTime;
    @TableLogic
    private Integer isDelete;
}
