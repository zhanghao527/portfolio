package com.portfolio.model.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class ProfileVO implements Serializable {
    private Long id;
    private String name;
    private String roleTitle;
    private String bio;
    private String avatar;
    private String githubUrl;
    private String email;
}
