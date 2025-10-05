/**
 * AstroShield - Visualizador Completo de Asteroides
 * Página dedicada para exibição detalhada de todos os asteroides próximos
 */

import { CONFIG } from './config.js';

class AsteroidsListViewer {
    constructor() {
        this.asteroids = [];
        this.filteredAsteroids = [];
        this.init();
    }

    async init() {
        console.log('🛰️ Inicializando visualizador de asteroides...');

        // Carregar asteroides da API
        await this.loadAsteroids();

        // Configurar event listeners
        this.setupEventListeners();

        // Renderizar lista inicial
        this.renderAsteroids();
    }

    async loadAsteroids() {
        const today = new Date().toISOString().split('T')[0];
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${CONFIG.NASA_API_KEY}`;

        try {
            console.log('📡 Carregando asteroides da NASA NEO API...');
            const response = await fetch(url);
            const data = await response.json();

            if (!data.near_earth_objects) {
                throw new Error('Dados inválidos da NASA API');
            }

            const objects = Object.values(data.near_earth_objects).flat();
            console.log(`✅ ${objects.length} asteroides recebidos`);

            // Processar dados
            this.asteroids = objects.map(neo => this.processAsteroidData(neo));
            this.filteredAsteroids = [...this.asteroids];

            // Atualizar estatísticas
            this.updateStats();

            // Esconder loading
            document.getElementById('loading').style.display = 'none';
            document.getElementById('asteroid-list').style.display = 'grid';

        } catch (error) {
            console.error('❌ Erro ao carregar asteroides:', error);
            document.getElementById('loading').innerHTML = `
                <h3 style="color: var(--accent-danger);">❌ Erro ao carregar asteroides</h3>
                <p>${error.message}</p>
                <p style="margin-top: 20px;">
                    <a href="index.html" class="back-btn">← Voltar</a>
                </p>
            `;
        }
    }

    processAsteroidData(neo) {
        const approach = neo.close_approach_data[0] || {};
        const diameter = neo.estimated_diameter.kilometers;

        return {
            id: neo.id,
            name: neo.name,
            nasaUrl: neo.nasa_jpl_url,
            isHazardous: neo.is_potentially_hazardous_asteroid,
            absoluteMagnitude: neo.absolute_magnitude_h,

            diameter: {
                min: diameter.estimated_diameter_min,
                max: diameter.estimated_diameter_max,
                avg: (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2
            },

            distance: {
                km: parseFloat(approach.miss_distance?.kilometers || 0),
                lunar: parseFloat(approach.miss_distance?.lunar || 0),
                au: parseFloat(approach.miss_distance?.astronomical || 0)
            },

            velocity: {
                kmh: parseFloat(approach.relative_velocity?.kilometers_per_hour || 0),
                kms: parseFloat(approach.relative_velocity?.kilometers_per_second || 0)
            },

            approach: {
                date: approach.close_approach_date,
                dateFull: approach.close_approach_date_full,
                orbitingBody: approach.orbiting_body
            }
        };
    }

    updateStats() {
        const hazardous = this.asteroids.filter(a => a.isHazardous).length;
        const safe = this.asteroids.length - hazardous;
        const closest = Math.min(...this.asteroids.map(a => a.distance.lunar));

        document.getElementById('total-count').textContent = this.asteroids.length;
        document.getElementById('hazardous-count').textContent = hazardous;
        document.getElementById('safe-count').textContent = safe;
        document.getElementById('closest-distance').textContent = closest.toFixed(2) + ' LD';
    }

    setupEventListeners() {
        // Busca
        document.getElementById('search').addEventListener('input', (e) => {
            this.applyFilters();
        });

        // Ordenação
        document.getElementById('sort').addEventListener('change', (e) => {
            this.sortAsteroids(e.target.value);
        });

        // Filtros
        document.getElementById('filter').addEventListener('change', (e) => {
            this.applyFilters();
        });
    }

    applyFilters() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const filterType = document.getElementById('filter').value;

        this.filteredAsteroids = this.asteroids.filter(asteroid => {
            // Filtro de busca
            const matchesSearch = asteroid.name.toLowerCase().includes(searchTerm) ||
                                 asteroid.id.includes(searchTerm);

            if (!matchesSearch) return false;

            // Filtro de tipo
            switch (filterType) {
                case 'hazardous':
                    return asteroid.isHazardous;
                case 'safe':
                    return !asteroid.isHazardous;
                case 'close':
                    return asteroid.distance.lunar < 1;
                default:
                    return true;
            }
        });

        // Reaplicar ordenação atual
        const currentSort = document.getElementById('sort').value;
        this.sortAsteroids(currentSort);
    }

    sortAsteroids(sortBy) {
        switch (sortBy) {
            case 'distance':
                this.filteredAsteroids.sort((a, b) => a.distance.lunar - b.distance.lunar);
                break;
            case 'name':
                this.filteredAsteroids.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
                this.filteredAsteroids.sort((a, b) => b.diameter.avg - a.diameter.avg);
                break;
            case 'velocity':
                this.filteredAsteroids.sort((a, b) => b.velocity.kmh - a.velocity.kmh);
                break;
            case 'date':
                this.filteredAsteroids.sort((a, b) =>
                    new Date(a.approach.date) - new Date(b.approach.date)
                );
                break;
        }

        this.renderAsteroids();
    }

    getDistanceColor(lunarDistance) {
        if (lunarDistance < 1) return 'dist-very-close';
        if (lunarDistance < 5) return 'dist-close';
        if (lunarDistance < 20) return 'dist-moderate';
        return 'dist-far';
    }

    getDistanceLabel(lunarDistance) {
        if (lunarDistance < 1) return 'Muito Próximo';
        if (lunarDistance < 5) return 'Próximo';
        if (lunarDistance < 20) return 'Moderado';
        return 'Distante';
    }

    renderAsteroids() {
        const container = document.getElementById('asteroid-list');
        const noResults = document.getElementById('no-results');

        if (this.filteredAsteroids.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        noResults.style.display = 'none';

        container.innerHTML = this.filteredAsteroids.map(asteroid => `
            <div class="asteroid-card ${asteroid.isHazardous ? 'hazardous' : 'safe'}" data-id="${asteroid.id}">
                <div class="asteroid-header">
                    <div>
                        <div class="asteroid-name">${asteroid.name}</div>
                        <div class="asteroid-id">ID: ${asteroid.id}</div>
                    </div>
                    <div class="hazard-badge ${asteroid.isHazardous ? 'danger' : 'success'}">
                        ${asteroid.isHazardous ? '⚠️ Perigoso' : '✅ Seguro'}
                    </div>
                </div>

                <div class="asteroid-details">
                    <div class="detail-item">
                        <div class="detail-label">📏 Distância</div>
                        <div class="detail-value">
                            <span class="distance-indicator ${this.getDistanceColor(asteroid.distance.lunar)}"></span>
                            ${asteroid.distance.lunar.toFixed(2)} LD
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${(asteroid.distance.km / 1000).toFixed(0)} mil km
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-label">📐 Tamanho</div>
                        <div class="detail-value">
                            ${(asteroid.diameter.avg * 1000).toFixed(0)} m
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${asteroid.diameter.min.toFixed(2)}-${asteroid.diameter.max.toFixed(2)} km
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-label">🚀 Velocidade</div>
                        <div class="detail-value">
                            ${asteroid.velocity.kms.toFixed(2)} km/s
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${asteroid.velocity.kmh.toFixed(0)} km/h
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-label">📅 Aproximação</div>
                        <div class="detail-value" style="font-size: 12px;">
                            ${asteroid.approach.dateFull}
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-label">✨ Magnitude</div>
                        <div class="detail-value">
                            ${asteroid.absoluteMagnitude.toFixed(1)}H
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${this.getMagnitudeDescription(asteroid.absoluteMagnitude)}
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-label">🌍 Orbitando</div>
                        <div class="detail-value">
                            ${asteroid.approach.orbitingBody}
                        </div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${this.getDistanceLabel(asteroid.distance.lunar)}
                        </div>
                    </div>
                </div>

                <div class="asteroid-footer">
                    <a href="${asteroid.nasaUrl}" target="_blank" class="btn btn-primary">
                        🔗 NASA JPL
                    </a>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${asteroid.name}'); alert('Nome copiado!')">
                        📋 Copiar Nome
                    </button>
                </div>
            </div>
        `).join('');

        console.log(`✅ ${this.filteredAsteroids.length} asteroides renderizados`);
    }

    getMagnitudeDescription(magnitude) {
        if (magnitude < 18) return 'Muito brilhante';
        if (magnitude < 22) return 'Brilhante';
        if (magnitude < 25) return 'Moderado';
        return 'Fraco';
    }
}

// Inicializar quando página carregar
window.addEventListener('DOMContentLoaded', () => {
    new AsteroidsListViewer();
});
