/**
 * AstroShield - Arquivo de Configuração (EXEMPLO)
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo para: config.js
 * 2. Substitua as chaves de exemplo pelas suas chaves reais
 * 3. NUNCA faça commit do arquivo config.js (está no .gitignore)
 */

export const CONFIG = {
    // NASA API Key
    // Obtenha em: https://api.nasa.gov/
    NASA_API_KEY: 'DEMO_KEY', // ← Substitua pela sua chave

    // Configurações opcionais
    settings: {
        // Quantidade máxima de asteroides a exibir
        maxAsteroids: 50,

        // Ativar modo debug (logs detalhados)
        debug: true,

        // Idioma padrão
        language: 'pt-BR'
    }
};
