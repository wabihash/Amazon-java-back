package com.wabi.amazon.security;

import com.google.firebase.auth.FirebaseToken;
import com.wabi.amazon.service.FirebaseTokenService;
import com.wabi.amazon.service.UserProfileService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseTokenService tokenService;
    private final UserProfileService profileService;

    public FirebaseAuthenticationFilter(FirebaseTokenService tokenService, UserProfileService profileService) {
        this.tokenService = tokenService;
        this.profileService = profileService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, jakarta.servlet.ServletException {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String idToken = header.substring(7);
                FirebaseToken decoded = tokenService.verifyToken(idToken);
                String uid = decoded.getUid();
                String email = decoded.getEmail();

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                try {
                    var profileOpt = profileService.getProfile(uid);
                    if (profileOpt.isPresent() && "admin".equals(profileOpt.get().getRole())) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }
                } catch (Exception e) {
                    // ignore profile lookup errors; treat as regular user
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(uid, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                request.setAttribute("firebaseUid", uid);
                request.setAttribute("firebaseEmail", email);
            }
        } catch (Exception e) {
            // token invalid -> leave unauthenticated
        }
        filterChain.doFilter(request, response);
    }
}
