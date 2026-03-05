package com.erp.capitalerp.config;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

@Profile("!prod")
@EnableJpaRepositories(basePackages = "com.erp.capitalerp.infrastructure.persistence", entityManagerFactoryRef = "h2EntityManager", transactionManagerRef = "h2TransactionManager")
@Configuration
public class H2Config {

    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.h2")
    public DataSourceProperties h2DataSource() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean
    public DataSource h2DataSourceBean() {
        return h2DataSource().initializeDataSourceBuilder().build();
    }

    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean h2EntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(h2DataSourceBean());
        // em.setDataSource(h2DataSource().initializeDataSourceBuilder().build());
        em.setPackagesToScan("com.erp.capitalerp.domain");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setGenerateDdl(true);
        vendorAdapter.setShowSql(true);
        em.setJpaVendorAdapter(vendorAdapter);

        java.util.Map<String, Object> properties = new java.util.HashMap<>();
        properties.put("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        // Converte camelCase (Java) para snake_case (SQL) — ex: razaoSocial →
        // razao_social
        // Necessário pois o LocalContainerEntityManagerFactoryBean manual não herda o
        // SpringPhysicalNamingStrategy automaticamente configurado pelo Spring Boot
        properties.put("hibernate.physical_naming_strategy",
                "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy");
        properties.put("hibernate.hbm2ddl.auto", "create");
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Primary
    @Bean
    public PlatformTransactionManager h2TransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(h2EntityManager().getObject());

        return transactionManager;
    }

    // @Primary
    // @Bean
    // public ApplicationRunner h2DataInitializer(DataSource h2DataSourceBean) {
    // return args -> {
    // ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
    // populator.addScript(new ClassPathResource("import.sql"));
    // populator.execute(h2DataSourceBean);
    // };
    // }
}