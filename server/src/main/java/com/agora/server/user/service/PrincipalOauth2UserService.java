package com.agora.server.user.service;

import com.agora.server.user.controller.dto.SocialType;
import com.agora.server.user.domain.User;
import com.agora.server.user.dto.OAuthUserPrincipalDto;
import com.agora.server.user.oauth.PrincipalDetails;
import com.agora.server.user.oauth.dto.*;
import com.agora.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;

import java.security.AuthProvider;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrincipalOauth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new InternalAuthenticationServiceException(e.getMessage(), e.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User user) throws Exception {
        OauthUserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                userRequest,
                user.getAttributes()
        );

        User findUser;
        findUser = userRepository.checkDuplicateUser(oAuth2UserInfo.getProviderId(), oAuth2UserInfo.getProvider());

        if (findUser != null) {
            // 존재하면 login
            return PrincipalDetails.create(
                    new OAuthUserPrincipalDto(
                            findUser.getUser_id().toString(),
                            oAuth2UserInfo.getProvider(),
                            oAuth2UserInfo.getName(),
                            oAuth2UserInfo.getProfile()
                    )
            );
        } else {
            // 존재하지 않으면 회원가입
            OAuthUserPrincipalDto oAuthUserPrincipalDto = new OAuthUserPrincipalDto(
                    null,
                    oAuth2UserInfo.getProvider(),
                    oAuth2UserInfo.getName(),
                    oAuth2UserInfo.getProfile()
            );
            return PrincipalDetails.create(oAuthUserPrincipalDto);
        }
    }
}
