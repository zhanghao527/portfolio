package com.portfolio.model.dto;

import com.portfolio.common.api.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserQueryRequest extends PageRequest implements Serializable {

    private Long id;

    private String userAccount;

    private String userName;

    private String userProfile;

    private String userRole;
}
