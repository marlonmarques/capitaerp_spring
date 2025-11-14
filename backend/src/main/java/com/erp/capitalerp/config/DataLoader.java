package com.erp.capitalerp.config;

import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.erp.capitalerp.entities.Role;
import com.erp.capitalerp.entities.User;
import com.erp.capitalerp.repositories.RoleRepository;
import com.erp.capitalerp.repositories.UserRepository;

@Configuration
@Profile("prod") // Só roda em produção
public class DataLoader {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, 
                                         RoleRepository roleRepository,
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            if (roleRepository.count() == 0) {
                System.out.println("=== INICIALIZANDO DADOS DO SISTEMA ===");
                
                // Criar roles
                Role roleOperator = new Role(null, "ROLE_OPERATOR");
                Role roleAdmin = new Role(null, "ROLE_ADMIN");
                Role roleSuperAdmin = new Role(null, "ROLE_SUPER_ADMIN");
                
                roleRepository.saveAll(Arrays.asList(roleOperator, roleAdmin, roleSuperAdmin));
                System.out.println("Roles criadas com sucesso!");

                // Criar usuários
                User user1 = new User();
                user1.setFirstName("Marlon");
                user1.setLastName("Capital");
                user1.setEmail("marlon@gmail.com");
                user1.setPassword(passwordEncoder.encode("123456"));
                user1.getRoles().add(roleOperator);

                User user2 = new User();
                user2.setFirstName("Maria");
                user2.setLastName("Green");
                user2.setEmail("maria@gmail.com");
                user2.setPassword(passwordEncoder.encode("123456"));
                user2.getRoles().addAll(Arrays.asList(roleOperator, roleAdmin));

                User superAdmin = new User();
                superAdmin.setFirstName("Super");
                superAdmin.setLastName("Admin");
                superAdmin.setEmail("admin@capitalerp.com");
                superAdmin.setPassword(passwordEncoder.encode("admin123"));
                superAdmin.getRoles().addAll(Arrays.asList(roleOperator, roleAdmin, roleSuperAdmin));

                userRepository.saveAll(Arrays.asList(user1, user2, superAdmin));
                System.out.println("Usuários criados com sucesso!");
                
                System.out.println("=== DADOS INICIAIS CONCLUÍDOS ===");
            } else {
                System.out.println("Dados já inicializados anteriormente");
            }
        };
    }
}