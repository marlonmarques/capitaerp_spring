package com.erp.capitalerp.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

@Profile("test")
@EnableJpaRepositories(
        basePackages = "com.erp.capitalerp.sqlite.repositories",
        entityManagerFactoryRef = "sqliteEntityManager",
        transactionManagerRef = "sqliteTransactionManager"
)
@Configuration
public class SqliteConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.sqlite")
    public DataSourceProperties sqliteDataSource() {
        return new DataSourceProperties();
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean sqliteEntityManager() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(sqliteDataSource().initializeDataSourceBuilder().build());
        em.setPackagesToScan("com.erp.capitalerp.sqlite.entities");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setGenerateDdl(false);
        vendorAdapter.setShowSql(false);
        em.setJpaVendorAdapter(vendorAdapter);

        return em;
    }

    @Bean
    public PlatformTransactionManager sqliteTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(sqliteEntityManager().getObject());

        return transactionManager;
    }
}