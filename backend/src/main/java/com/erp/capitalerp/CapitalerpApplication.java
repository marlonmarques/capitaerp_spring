package com.erp.capitalerp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Ponto de entrada do CapitalERP.
 *
 * <p>
 * {@code @EnableScheduling} ativa o scheduler do Spring para processar a fila
 * assíncrona de emissão NFS-e
 * ({@link com.erp.capitalerp.application.nfse.EmissaoJobScheduler}).
 */
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
@EnableScheduling
public class CapitalerpApplication {

	public static void main(String[] args) {
		SpringApplication.run(CapitalerpApplication.class, args);
	}

}
