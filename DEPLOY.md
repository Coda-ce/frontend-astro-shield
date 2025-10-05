# 🚀 Guia de Deploy - AstroShield

## Deploy na Vercel (Recomendado)

### Método 1: Via Interface Web da Vercel

1. **Criar conta na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub

2. **Importar projeto**
   - Clique em "Add New Project"
   - Selecione o repositório `threejs-model-viewer`
   - Clique em "Import"

3. **Configurar projeto**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raiz)
   - **Build Command**: (deixe vazio)
   - **Output Directory**: `./` (raiz)

4. **Configurar variáveis de ambiente**
   - Vá em "Environment Variables"
   - Adicione: `NASA_API_KEY` = `sua_chave_da_nasa`
   - **IMPORTANTE**: Você precisa criar um arquivo `config.js` público com a chave da NASA

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 1-2 minutos
   - Sua aplicação estará em: `https://astroshield.vercel.app`

### Método 2: Via CLI da Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy para produção
vercel --prod
```

## ⚠️ IMPORTANTE: Configurar NASA API Key

Antes do deploy, você **DEVE** criar o arquivo `config.js`:

```javascript
// config.js
export const CONFIG = {
    NASA_API_KEY: 'SUA_CHAVE_AQUI'
};
```

### Como obter a chave NASA:
1. Acesse: https://api.nasa.gov/
2. Preencha o formulário
3. Receba a chave por email
4. Substitua em `config.js`

## Outros serviços de hospedagem

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Configuração Netlify (`netlify.toml`)**:
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### GitHub Pages

1. Vá em Settings > Pages
2. Source: Deploy from branch
3. Branch: `main` / `root`
4. Aguarde deploy

**URL**: `https://seu-usuario.github.io/threejs-model-viewer`

### Cloudflare Pages

1. Acesse [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect to Git > Selecione repositório
3. Build settings:
   - Build command: (vazio)
   - Build output directory: `/`
4. Deploy

## Verificar após deploy

✅ Checklist:
- [ ] Página inicial carrega
- [ ] Modelo 3D da Terra aparece
- [ ] Controles de simulação funcionam
- [ ] API da NASA retorna asteroides
- [ ] Mapa 2D funciona (Leaflet)
- [ ] Relatório detalhado abre
- [ ] Console sem erros

## Troubleshooting

### Erro: "Failed to load module"
**Solução**: Verificar que todos os imports usam extensão `.js`

### Erro: "NASA API returns 403"
**Solução**: Verificar chave da API em `config.js`

### Modelo 3D não carrega
**Solução**: Verificar que `earth_3d.glb` está no diretório raiz

### CORS Error com Leaflet
**Solução**: Leaflet CSS deve estar no HTML com CDN

## Performance

Para melhor performance:
- Modelos 3D (.glb) são servidos com cache de 1 ano
- JavaScript/CSS tem cache agressivo
- Gzip/Brotli automático na Vercel
- CDN global da Vercel

## Domínio customizado

Na Vercel:
1. Vá em Project Settings > Domains
2. Adicione seu domínio: `astroshield.com`
3. Configure DNS conforme instruções
4. Certificado SSL automático

## Monitoramento

A Vercel fornece:
- Analytics de visitantes
- Web Vitals
- Logs de requisições
- Alertas de erro

## Custos

- **Vercel**: Gratuito (Hobby Plan)
  - Bandwidth: 100GB/mês
  - Build: 100 horas/mês
  - Ilimitado sites

- **Netlify**: Gratuito
  - Bandwidth: 100GB/mês
  - Build: 300 min/mês

- **GitHub Pages**: Gratuito
  - Bandwidth: 100GB/mês
  - Storage: 1GB

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Three.js: https://threejs.org/docs
- NASA API Docs: https://api.nasa.gov/

---

**Desenvolvido para NASA Space Apps Challenge 2025** 🚀
