export interface Empresa {
    id?: string;
    tenantIdentifier: string; // Slug amigável da empresa (ex: 'capital', 'tech-corp')
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    telefone?: string;
    email?: string;
    logoUrl?: string;
}
