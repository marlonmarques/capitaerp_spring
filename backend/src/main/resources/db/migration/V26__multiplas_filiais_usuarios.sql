CREATE TABLE tb_user_filial (
    user_id BIGINT NOT NULL,
    filial_id UUID NOT NULL,
    PRIMARY KEY (user_id, filial_id),
    CONSTRAINT fk_user_filial_user FOREIGN KEY (user_id) REFERENCES tb_user (id),
    CONSTRAINT fk_user_filial_filial FOREIGN KEY (filial_id) REFERENCES filiais (id)
);

-- Inserir registros para os usuários que já possuem uma filial vinculada
INSERT INTO tb_user_filial (user_id, filial_id)
SELECT id, filial_id FROM tb_user WHERE filial_id IS NOT NULL;
