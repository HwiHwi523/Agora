package com.agora.server.auth.dto;

import com.agora.server.user.controller.dto.SocialType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UserAccessTokenInfo {
    private UUID id;

    private SocialType socialType;

}
