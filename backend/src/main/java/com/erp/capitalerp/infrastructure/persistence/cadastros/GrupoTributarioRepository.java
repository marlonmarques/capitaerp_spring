package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.domain.fiscal.RegimeTributarioEnum;
import com.erp.capitalerp.domain.fiscal.TipoImpostoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GrupoTributarioRepository extends JpaRepository<GrupoTributario, UUID> {

    List<GrupoTributario> findByAtivoTrue();

    List<GrupoTributario> findByRegimeAndAtivoTrue(RegimeTributarioEnum regime);

    List<GrupoTributario> findByTipoImpostoAndAtivoTrue(TipoImpostoEnum tipoImposto);

    List<GrupoTributario> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);
}
