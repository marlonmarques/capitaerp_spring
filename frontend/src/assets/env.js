(function (window) {
    window.env = window.env || {};

    // Configurações de ambiente — sobrescreva em produção via variáveis de ambiente
    window.env.production = false;
    window.env.apiUrl = 'http://localhost:8080';
})(this);
