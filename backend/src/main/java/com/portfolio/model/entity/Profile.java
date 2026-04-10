package com.portfolio.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("profile")
public class Profile implements Serializable {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String name;
    private String roleTitle;
    private String bio;
    private String avatar;
    private String githubUrl;
    private String email;
    private Date createTime;
    private Date updateTime;
    @TableLogic
    private Integer isDelete;
}
