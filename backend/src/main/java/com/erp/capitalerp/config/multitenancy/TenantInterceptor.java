package com.erp.capitalerp.config.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Resolve o tenant de cada requisição a partir do header X-Tenant-ID ou do
 * parâmetro tenantIdentifier (form-encoded, usado no /oauth2/token).
 *
 * NÃO usar @Component aqui para evitar duplo registro automático pelo Spring
 * Boot. Este filtro é registrado EXCLUSIVAMENTE via FilterRegistrationBean no
 * ResourceServerConfig com HIGHEST_PRECEDENCE, garantindo execução ANTES dos
 * filtros do Spring Authorization Server (OAuth2).
 */
public class TenantInterceptor extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String tenantId = request.getHeader(TENANT_HEADER);

        // Se o tenant chegar via parâmetro (como no login via form-encoded)
        if (tenantId == null) {
            tenantId = request.getParameter("tenantIdentifier");
        }

        if (tenantId != null) {
            TenantContext.setCurrentTenant(tenantId);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
