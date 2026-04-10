package com.portfolio.model.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class ProfileUpdateRequest implements Serializable {
    private String name;
    private String roleTitle;
    private String bio;
    private String avatar;
    private String githubUrl;
    private String email;
}
