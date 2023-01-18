package com.agora.server.user.controller;

import com.agora.server.common.dto.ResponseDTO;
import com.agora.server.user.controller.dto.CommonDto;
import com.agora.server.user.controller.dto.SocialType;
import com.agora.server.user.controller.dto.google.GetGoogleOAuthRes;
import com.agora.server.user.controller.dto.google.GoogleOAuthToken;
import com.agora.server.user.domain.User;
import com.agora.server.user.repository.GoogleUserRepository;
import com.agora.server.user.service.GoogleAuthService;
import com.agora.server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService googleOAuthService;
    private final UserService userService;
    private final GoogleUserRepository googleUserRepository;

    // 프론트단에서 처리 할 예정
    @GetMapping("request/auth/login/google")
    public void googleLoginRedirect() throws IOException {
        googleOAuthService.loginRequest();
    }

    @GetMapping("request/auth/join/google")
    public void googleJoinRedirect() throws IOException {
        googleOAuthService.joinRequest();
    }

    @ResponseBody
    @GetMapping(value = "request/auth/login/google/callback")
    public GetGoogleOAuthRes googleLoginCallback(
            @RequestParam(name = "code") String code)throws IOException{
        GetGoogleOAuthRes getGoogleOAuthRes=googleOAuthService.oAuthLogin(code);
        return getGoogleOAuthRes;
    }

    @ResponseBody
    @GetMapping(value = "request/auth/join/google/callback")
    public ResponseEntity<ResponseDTO> googleJoinCallback(
            @RequestParam(name = "code") String code)throws IOException{

        // 토큰 받기
        GoogleOAuthToken googleOAuthToken = googleOAuthService.getGoogleOAuthToken(code);
        // 유저정보 받기
        CommonDto googleUser = googleOAuthService.getGoogleUserInfo(googleOAuthToken);

        User user = userService.checkDuplicateUser(googleUser.getSocial_id(), SocialType.GOOGLE);

        ResponseDTO responseDTO = new ResponseDTO();

        // 가입되어 있는 유저 -> Exception 발생
        if(user != null) {
            System.out.println("user가 notnull"+user);
        }

        // 가입되어 있지 않은 유저 -> 정상 코드와 CommonDto 반환
            responseDTO.setState(true);
            responseDTO.setBody(googleUser);
            responseDTO.setMessage("ok");
            responseDTO.setStatusCode(200);
            return new ResponseEntity<>(responseDTO, HttpStatus.ACCEPTED);
        
    }
}
