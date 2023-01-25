package com.agora.server.config;

import com.agora.server.config.filter.CorsFilterConfig;
import com.agora.server.config.filter.JwtAuthorizationFilter;
import com.agora.server.user.repository.UserRepository;
import com.agora.server.user.service.PrincipalOauth2UserService;
import com.agora.server.util.JwtAuthorizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsFilterConfig corsFilter;
    private final JwtAuthorizationUtil jwtAuthorizationUtil;
    private final UserRepository userRepository;
    private final PrincipalOauth2UserService principalOauth2UserService;


    @Bean
    protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
        http
                .addFilter(corsFilter.corsFilter())
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                .and()
                    .authorizeRequests()
                    .mvcMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .antMatchers("/room/**").permitAll()
                    .anyRequest().permitAll()
                .and()
                    .oauth2Login()
                    .defaultSuccessUrl("/total/oauth", true)
                    .userInfoEndpoint()
                    .userService(principalOauth2UserService)
                .and()
                .and()
                .httpBasic().disable()
                .addFilterBefore(new JwtAuthorizationFilter(jwtAuthorizationUtil, userRepository), UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }


}
