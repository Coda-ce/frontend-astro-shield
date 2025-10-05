/**
 * NASA NEO (Near-Earth Object) API Integration
 *
 * Este módulo gerencia a integração com a API da NASA para obter dados
 * reais de asteroides próximos à Terra.
 *
 * API Documentation: https://api.nasa.gov/
 */

import { CONFIG } from './config.js';

export class NASANEOService {
    constructor(apiKey = CONFIG.NASA_API_KEY) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.nasa.gov/neo/rest/v1';
        this.cache = new Map();
        this.cacheDuration = 3600000; // 1 hora em ms
    }

    /**
     * Busca asteroides próximos em um intervalo de datas
     * @param {string} startDate - Data inicial (YYYY-MM-DD)
     * @param {string} endDate - Data final (YYYY-MM-DD)
     * @returns {Promise<Object>} Dados dos asteroides
     */
    async getFeed(startDate = null, endDate = null) {
        if (!startDate) {
            startDate = this.getTodayDate();
        }
        if (!endDate) {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            endDate = this.formatDate(date);
        }

        const cacheKey = `feed_${startDate}_${endDate}`;
        if (this.isCacheValid(cacheKey)) {
            console.log('📦 Dados carregados do cache');
            return this.cache.get(cacheKey).data;
        }

        try {
            const url = `${this.baseURL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`NASA API Error: ${response.status}`);
            }

            const data = await response.json();

            // Salva no cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            console.log(`✅ ${data.element_count} asteroides carregados da NASA NEO API`);
            return data;

        } catch (error) {
            console.error('❌ Erro ao buscar dados da NASA:', error);
            throw error;
        }
    }

    /**
     * Busca detalhes de um asteroide específico
     * @param {string} asteroidId - ID do asteroide na NASA
     * @returns {Promise<Object>} Dados detalhados do asteroide
     */
    async getAsteroidDetails(asteroidId) {
        const cacheKey = `asteroid_${asteroidId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const url = `${this.baseURL}/neo/${asteroidId}?api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`NASA API Error: ${response.status}`);
            }

            const data = await response.json();

            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error('❌ Erro ao buscar detalhes do asteroide:', error);
            throw error;
        }
    }

    /**
     * Busca asteroides potencialmente perigosos
     * @returns {Promise<Array>} Lista de asteroides perigosos
     */
    async getHazardousAsteroids() {
        try {
            const feed = await this.getFeed();
            const hazardous = [];

            for (const date in feed.near_earth_objects) {
                const asteroids = feed.near_earth_objects[date];
                asteroids.forEach(asteroid => {
                    if (asteroid.is_potentially_hazardous_asteroid) {
                        hazardous.push(this.parseAsteroidData(asteroid));
                    }
                });
            }

            console.log(`⚠️ ${hazardous.length} asteroides potencialmente perigosos encontrados`);
            return hazardous;

        } catch (error) {
            console.error('❌ Erro ao buscar asteroides perigosos:', error);
            return [];
        }
    }

    /**
     * Converte dados brutos da NASA para formato normalizado
     * @param {Object} neoData - Dados brutos da API
     * @returns {Object} Dados normalizados
     */
    parseAsteroidData(neoData) {
        const closeApproach = neoData.close_approach_data[0] || {};
        const diameter = neoData.estimated_diameter.kilometers;

        return {
            id: neoData.id,
            name: neoData.name,
            nasa_jpl_url: neoData.nasa_jpl_url,

            // Dimensões
            diameter: {
                min: diameter.estimated_diameter_min,
                max: diameter.estimated_diameter_max,
                average: (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2
            },

            // Velocidade
            velocity: {
                km_s: parseFloat(closeApproach.relative_velocity?.kilometers_per_second || 0),
                km_h: parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || 0)
            },

            // Distância de aproximação
            miss_distance: {
                km: parseFloat(closeApproach.miss_distance?.kilometers || 0),
                lunar: parseFloat(closeApproach.miss_distance?.lunar || 0), // Em distâncias Terra-Lua
                astronomical: parseFloat(closeApproach.miss_distance?.astronomical || 0)
            },

            // Data de aproximação
            close_approach_date: closeApproach.close_approach_date_full,

            // Dados orbitais
            orbital: {
                eccentricity: parseFloat(neoData.orbital_data?.eccentricity || 0),
                semi_major_axis: parseFloat(neoData.orbital_data?.semi_major_axis || 0),
                inclination: parseFloat(neoData.orbital_data?.inclination || 0),
                orbital_period: parseFloat(neoData.orbital_data?.orbital_period || 0)
            },

            // Classificação de risco
            is_hazardous: neoData.is_potentially_hazardous_asteroid,
            absolute_magnitude: neoData.absolute_magnitude_h,

            // Dados brutos (para referência)
            raw_data: neoData
        };
    }

    /**
     * Estima densidade baseada em tipo de asteroide
     * @param {Object} asteroidData - Dados do asteroide
     * @returns {number} Densidade estimada em kg/m³
     */
    estimateDensity(asteroidData) {
        // Estimativa baseada em magnitude absoluta e diâmetro
        // Asteroides mais escuros (alto albedo) tendem a ser carbonáceos (menos densos)
        // Asteroides mais brilhantes tendem a ser rochosos ou metálicos

        const h = asteroidData.absolute_magnitude;

        if (h > 20) {
            // Provavelmente carbonáceo (tipo C)
            return 1500;
        } else if (h > 17) {
            // Provavelmente rochoso (tipo S)
            return 2500;
        } else {
            // Possivelmente metálico (tipo M) ou rochoso denso
            return 3500;
        }
    }

    /**
     * Calcula parâmetros de impacto para um asteroide da NASA
     * @param {Object} asteroidData - Dados parseados do asteroide
     * @param {number} impactAngle - Ângulo de impacto em graus (padrão: 45°)
     * @returns {Object} Parâmetros prontos para simulação
     */
    prepareImpactSimulation(asteroidData, impactAngle = 45) {
        const diameter = asteroidData.diameter.average * 1000; // Converte km para m
        const velocity = asteroidData.velocity.km_s;
        const density = this.estimateDensity(asteroidData);

        return {
            name: asteroidData.name,
            diameter_m: diameter,
            velocity_km_s: velocity,
            density_kg_m3: density,
            impact_angle_deg: impactAngle,
            is_real_neo: true,
            neo_id: asteroidData.id,
            approach_date: asteroidData.close_approach_date,
            is_hazardous: asteroidData.is_hazardous
        };
    }

    // Funções auxiliares
    getTodayDate() {
        return this.formatDate(new Date());
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isCacheValid(key) {
        if (!this.cache.has(key)) return false;

        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;

        return age < this.cacheDuration;
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }
}

/**
 * Gerenciador de UI para seleção de asteroides da NASA
 */
export class NEOSelector {
    constructor(neoService, uiController) {
        this.neoService = neoService;
        this.uiController = uiController;
        this.currentAsteroids = [];
    }

    /**
     * Adiciona seletor de asteroides reais da NASA à UI
     */
    async initializeNEOSelector() {
        try {
            const feed = await this.neoService.getFeed();
            this.currentAsteroids = this.extractAllAsteroids(feed);

            // Cria dropdown de seleção
            const controlPanel = document.getElementById('control-panel');
            const neoSection = document.createElement('div');
            neoSection.className = 'panel-section';
            neoSection.innerHTML = `
                <h3>🛰️ Asteroides Reais (NASA)</h3>
                <div class="input-group">
                    <label>Selecione um NEO da próxima semana</label>
                    <select id="neo-selector">
                        <option value="">Custom (manual)</option>
                        ${this.generateAsteroidOptions()}
                    </select>
                </div>
                <div id="neo-info" style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);"></div>
            `;

            // Insere antes da seção de parâmetros
            controlPanel.insertBefore(neoSection, controlPanel.firstChild);

            // Event listener
            document.getElementById('neo-selector').addEventListener('change', (e) => {
                this.onNEOSelected(e.target.value);
            });

            console.log('✅ Seletor de NEOs inicializado');

        } catch (error) {
            console.error('❌ Erro ao inicializar seletor de NEOs:', error);
            this.showDemoModeWarning();
        }
    }

    extractAllAsteroids(feed) {
        const allAsteroids = [];

        for (const date in feed.near_earth_objects) {
            feed.near_earth_objects[date].forEach(asteroid => {
                allAsteroids.push(this.neoService.parseAsteroidData(asteroid));
            });
        }

        // Ordena por proximidade (miss distance)
        allAsteroids.sort((a, b) => a.miss_distance.km - b.miss_distance.km);

        return allAsteroids;
    }

    generateAsteroidOptions() {
        return this.currentAsteroids.map(asteroid => {
            const hazardIcon = asteroid.is_hazardous ? '⚠️' : '✅';
            const distanceLunar = asteroid.miss_distance.lunar.toFixed(2);
            const sizeKm = asteroid.diameter.average.toFixed(3);

            return `
                <option value="${asteroid.id}">
                    ${hazardIcon} ${asteroid.name} - ${sizeKm} km - ${distanceLunar} LD
                </option>
            `;
        }).join('');
    }

    onNEOSelected(asteroidId) {
        if (!asteroidId) {
            document.getElementById('neo-info').innerHTML = '';
            return;
        }

        const asteroid = this.currentAsteroids.find(a => a.id === asteroidId);
        if (!asteroid) return;

        // Exibe informações do asteroide
        const infoHTML = `
            <strong>📊 Dados do NEO:</strong><br>
            • Diâmetro: ${(asteroid.diameter.average * 1000).toFixed(0)} m<br>
            • Velocidade: ${asteroid.velocity.km_s.toFixed(1)} km/s<br>
            • Miss Distance: ${asteroid.miss_distance.lunar.toFixed(2)} LD<br>
            • Aproximação: ${new Date(asteroid.close_approach_date).toLocaleDateString('pt-BR')}<br>
            • Periculosidade: ${asteroid.is_hazardous ? '⚠️ ALTO RISCO' : '✅ Baixo risco'}
        `;
        document.getElementById('neo-info').innerHTML = infoHTML;

        // Preenche parâmetros automaticamente
        const simParams = this.neoService.prepareImpactSimulation(asteroid);

        document.getElementById('diameter').value = simParams.diameter_m;
        document.getElementById('diameter-value').textContent = `${simParams.diameter_m.toFixed(0)} m`;

        document.getElementById('velocity').value = simParams.velocity_km_s;
        document.getElementById('velocity-value').textContent = `${simParams.velocity_km_s} km/s`;

        // Seleciona densidade mais próxima
        const densitySelect = document.getElementById('density');
        const closestDensity = this.findClosestDensity(simParams.density_kg_m3);
        densitySelect.value = closestDensity;

        console.log(`🎯 NEO selecionado: ${asteroid.name}`);
        console.log(`📏 Parâmetros aplicados:`, simParams);
    }

    findClosestDensity(targetDensity) {
        const densities = [1500, 2500, 5000, 8000];
        return densities.reduce((prev, curr) =>
            Math.abs(curr - targetDensity) < Math.abs(prev - targetDensity) ? curr : prev
        );
    }

    showDemoModeWarning() {
        const controlPanel = document.getElementById('control-panel');
        const warning = document.createElement('div');
        warning.className = 'panel-section';
        warning.innerHTML = `
            <div style="background: var(--accent-warning); color: #0a0e27; padding: 12px; border-radius: 8px; font-size: 12px;">
                <strong>⚠️ Modo Demo</strong><br>
                NASA API não disponível. Use parâmetros manuais ou configure sua API key.
            </div>
        `;
        controlPanel.insertBefore(warning, controlPanel.firstChild);
    }
}

/**
 * Exemplo de uso:
 *
 * import { NASANEOService, NEOSelector } from './nasa-neo-integration.js';
 *
 * // Inicializa serviço (use sua API key da NASA)
 * const neoService = new NASANEOService('SUA_API_KEY_AQUI');
 *
 * // Busca asteroides próximos
 * const feed = await neoService.getFeed();
 *
 * // Busca apenas asteroides perigosos
 * const hazardous = await neoService.getHazardousAsteroids();
 *
 * // Prepara simulação com asteroide real
 * const asteroidData = neoService.parseAsteroidData(feed.near_earth_objects[date][0]);
 * const simParams = neoService.prepareImpactSimulation(asteroidData);
 *
 * // Adiciona seletor à UI
 * const neoSelector = new NEOSelector(neoService, uiController);
 * await neoSelector.initializeNEOSelector();
 */
