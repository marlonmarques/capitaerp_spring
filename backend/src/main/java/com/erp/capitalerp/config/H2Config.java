package com.erp.capitalerp.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

@Profile("test")
@EnableJpaRepositories(
        basePackages = "com.erp.capitalerp.repositories",
        entityManagerFactoryRef = "h2EntityManager",
        transactionManagerRef = "h2TransactionManager"
)
@Configuration
public class H2Config {

    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.h2")
    public DataSourceProperties h2DataSource() {
        return new DataSourceProperties();
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean h2EntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(h2DataSource().initializeDataSourceBuilder().build());
        em.setPackagesToScan("com.erp.capitalerp.entities");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setGenerateDdl(true);
        vendorAdapter.setShowSql(true);
        em.setJpaVendorAdapter(vendorAdapter);

        return em;
    }

    @Primary
    @Bean
    public PlatformTransactionManager h2TransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(h2EntityManager().getObject());

        return transactionManager;
    }
}