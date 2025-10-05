/**
 * AstroShield - Módulo de Visualização Orbital de Asteroides
 * Integra dados reais da NASA NEO API com visualização 3D
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';

export class AsteroidOrbitalViewer {
    constructor(scene, earthMesh) {
        this.scene = scene;
        this.earthMesh = earthMesh;
        this.asteroids = [];
        this.orbitLines = [];
        this.textureLoader = new THREE.TextureLoader();

        // Configurações
        this.config = {
            maxAsteroids: 50,
            asteroidScaleMultiplier: 8,
            distanceScaleMultiplier: 0.00015, // Ajusta distância para visualização
            speedMultiplier: 0.002,
            orbitLineSegments: 128,
            showOrbits: true,
            showLabels: false,
            useRealDistance: false // Modo de distância real (escala científica)
        };

        // Constantes para escala de distância
        this.LUNAR_DISTANCE_KM = 384400; // Distância Terra-Lua em km
        this.LUNAR_VISUAL_UNITS = 15;    // Representação visual da órbita da Lua
        this.EARTH_RADIUS_UNITS = 5;     // Raio da Terra no modelo 3D

        // Referência visual da órbita da Lua
        this.moonOrbitReference = null;

        this.loadTextures();
        this.createMoonOrbitReference();
    }

    createMoonOrbitReference() {
        // Cria círculo tracejado representando a órbita da Lua
        const points = [];
        const segments = 128;

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                this.LUNAR_VISUAL_UNITS * Math.cos(theta),
                0,
                this.LUNAR_VISUAL_UNITS * Math.sin(theta)
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            dashSize: 0.5,
            gapSize: 0.3,
            transparent: true,
            opacity: 0.3
        });

        this.moonOrbitReference = new THREE.Line(geometry, material);
        this.moonOrbitReference.computeLineDistances(); // Necessário para linha tracejada
        this.moonOrbitReference.visible = false; // Inicialmente invisível

        this.scene.add(this.moonOrbitReference);
        console.log('🌙 Referência da órbita lunar criada (15 unidades = 384.400 km)');
    }

    loadTextures() {
        // Textura procedural para asteroides (cinza rochoso)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base cinza
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(0, 0, 256, 256);

        // Adicionar "crateras" aleatórias
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 10 + 5;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#3a3a3a');
            gradient.addColorStop(1, '#4a4a4a');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        this.asteroidTexture = new THREE.CanvasTexture(canvas);
    }

    async loadNASAAsteroids(apiKey = CONFIG.NASA_API_KEY) {
        const today = new Date().toISOString().split('T')[0];
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${apiKey}`;

        try {
            console.log('🛰️ Carregando asteroides da NASA NEO API...');
            const response = await fetch(url);
            const data = await response.json();

            if (!data.near_earth_objects) {
                throw new Error('Dados inválidos da NASA API');
            }

            const objects = Object.values(data.near_earth_objects).flat();
            console.log(`📡 ${objects.length} asteroides recebidos da NASA`);

            // Limpa asteroides anteriores
            this.clearAsteroids();

            // Processa e cria asteroides
            const asteroidsToCreate = objects.slice(0, this.config.maxAsteroids);

            asteroidsToCreate.forEach((neoData, index) => {
                const asteroidInfo = this.parseNEOData(neoData);
                this.createAsteroid(asteroidInfo);
            });

            console.log(`✅ ${this.asteroids.length} asteroides adicionados à visualização`);

            return {
                total: objects.length,
                displayed: this.asteroids.length,
                hazardous: this.asteroids.filter(a => a.userData.isHazardous).length
            };

        } catch (error) {
            console.error('❌ Erro ao carregar asteroides:', error);

            // Fallback: criar asteroides de exemplo
            console.log('⚠️ Usando asteroides de exemplo (modo offline)');
            this.createExampleAsteroids();

            return {
                total: 0,
                displayed: this.asteroids.length,
                hazardous: 0,
                error: error.message
            };
        }
    }

    calculateAdaptiveDistance(realDistanceKm) {
        /**
         * Calcula distância visual baseada em escala logarítmica adaptativa
         * @param {number} realDistanceKm - Distância real em quilômetros
         * @returns {number} Distância visual em unidades do modelo 3D
         */

        if (!this.config.useRealDistance) {
            // Modo visualização (atual) - todos os asteroides comprimidos e visíveis
            return this.EARTH_RADIUS_UNITS + 1 + (realDistanceKm * this.config.distanceScaleMultiplier);
        }

        // Modo distância real - escala logarítmica adaptativa
        const lunarRatio = realDistanceKm / this.LUNAR_DISTANCE_KM;

        if (lunarRatio < 0.5) {
            // Muito próximo (< 50% da distância da Lua) - escala LINEAR
            // Exemplos: 0.4 LD → 6 unidades, 0.2 LD → 3 unidades
            return this.LUNAR_VISUAL_UNITS * lunarRatio;

        } else if (lunarRatio < 10) {
            // Próximo a médio (0.5 a 10 Luas) - escala SEMI-LINEAR
            // Distribui de 7.5 a 83 unidades
            return this.LUNAR_VISUAL_UNITS * 0.5 + ((lunarRatio - 0.5) * 8);

        } else {
            // Distante (> 10 Luas) - escala LOGARÍTMICA comprimida
            // Comprime grandes distâncias em 90-130 unidades
            return 90 + (Math.log10(lunarRatio) * 20);
        }
    }

    getDistanceColor(realDistanceKm) {
        /**
         * Retorna cor baseada na proximidade do asteroide
         * @param {number} realDistanceKm - Distância real em km
         * @returns {number} Cor hexadecimal
         */
        const lunarRatio = realDistanceKm / this.LUNAR_DISTANCE_KM;

        if (lunarRatio < 1) return 0xff1744;      // 🔴 Vermelho - Muito próximo
        if (lunarRatio < 5) return 0xff9933;      // 🟠 Laranja - Próximo
        if (lunarRatio < 20) return 0xffd600;     // 🟡 Amarelo - Médio
        return 0x00e676;                          // 🟢 Verde - Distante
    }

    parseNEOData(neoData) {
        const approach = neoData.close_approach_data[0] || {};
        const diameter = neoData.estimated_diameter.kilometers;

        // Calcular tamanho visual
        const avgDiameter = (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2;
        const size = Math.max(0.02, avgDiameter * this.config.asteroidScaleMultiplier);

        // Dados reais de distância da NASA
        const distanceKm = parseFloat(approach.miss_distance?.kilometers || this.LUNAR_DISTANCE_KM);
        const distanceLunar = parseFloat(approach.miss_distance?.lunar || 1.0);
        const distanceAU = parseFloat(approach.miss_distance?.astronomical || 0.0026);

        // Calcular distância visual (adaptativa)
        const visualDistance = this.calculateAdaptiveDistance(distanceKm);

        // Calcular velocidade de órbita visual
        const velocityKmH = parseFloat(approach.relative_velocity?.kilometers_per_hour || 50000);
        const velocityKmS = parseFloat(approach.relative_velocity?.kilometers_per_second || 14);
        const orbitSpeed = this.config.speedMultiplier * (velocityKmH / 50000);

        // Cor baseada em periculosidade OU distância (se modo real ativado)
        const isHazardous = neoData.is_potentially_hazardous_asteroid;
        const color = this.config.useRealDistance
            ? this.getDistanceColor(distanceKm)
            : (isHazardous ? 0xff1744 : 0xff9933);

        // Parâmetros orbitais aleatórios (simplificado para visualização)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5 + Math.PI * 0.25; // Concentra próximo ao plano equatorial

        return {
            name: neoData.name,
            id: neoData.id,
            size: size,
            distance: visualDistance,
            theta: theta,
            phi: phi,
            speed: orbitSpeed,
            color: color,
            isHazardous: isHazardous,
            realData: {
                diameterKm: avgDiameter,
                diameterMin: diameter.estimated_diameter_min,
                diameterMax: diameter.estimated_diameter_max,
                distanceKm: distanceKm,
                distanceLunar: distanceLunar,
                distanceAU: distanceAU,
                velocityKmH: velocityKmH,
                velocityKmS: velocityKmS,
                approachDate: approach.close_approach_date_full,
                approachDateShort: approach.close_approach_date
            }
        };
    }

    createAsteroid(asteroidInfo) {
        // Geometria irregular (icosahedro)
        const geometry = new THREE.IcosahedronGeometry(asteroidInfo.size, 1);

        // Material com textura
        const material = new THREE.MeshStandardMaterial({
            map: this.asteroidTexture,
            color: asteroidInfo.color,
            flatShading: true,
            roughness: 0.8,
            metalness: 0.2
        });

        const asteroid = new THREE.Mesh(geometry, material);

        // Posição inicial baseada em órbita esférica
        const { distance, theta, phi } = asteroidInfo;
        asteroid.position.set(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );

        // Armazena dados para animação e info
        asteroid.userData = {
            distance: distance,
            theta: theta,
            phi: phi,
            speed: asteroidInfo.speed,
            isHazardous: asteroidInfo.isHazardous,
            name: asteroidInfo.name,
            id: asteroidInfo.id,
            realData: asteroidInfo.realData,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02
            }
        };

        this.scene.add(asteroid);
        this.asteroids.push(asteroid);

        // Criar linha de órbita se configurado
        if (this.config.showOrbits) {
            this.createOrbitLine(asteroidInfo);
        }

        return asteroid;
    }

    createOrbitLine(asteroidInfo) {
        const points = [];
        const { distance, phi } = asteroidInfo;

        // Gera pontos ao longo da órbita circular
        for (let i = 0; i <= this.config.orbitLineSegments; i++) {
            const theta = (i / this.config.orbitLineSegments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                distance * Math.sin(phi) * Math.cos(theta),
                distance * Math.sin(phi) * Math.sin(theta),
                distance * Math.cos(phi)
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: asteroidInfo.isHazardous ? 0xff1744 : 0xff9933,
            transparent: true,
            opacity: 0.2
        });

        const orbitLine = new THREE.Line(geometry, material);
        this.scene.add(orbitLine);
        this.orbitLines.push(orbitLine);

        return orbitLine;
    }

    createExampleAsteroids() {
        // Cria asteroides de exemplo quando NASA API não está disponível
        const examples = [
            { name: 'Apophis (simulado)', size: 0.15, distance: 8, hazardous: true },
            { name: 'Bennu (simulado)', size: 0.2, distance: 12, hazardous: true },
            { name: 'Ryugu (simulado)', size: 0.18, distance: 10, hazardous: false },
            { name: 'Didymos (simulado)', size: 0.16, distance: 15, hazardous: false },
            { name: 'Itokawa (simulado)', size: 0.12, distance: 7, hazardous: false }
        ];

        examples.forEach((example, index) => {
            const asteroidInfo = {
                name: example.name,
                id: `example_${index}`,
                size: example.size,
                distance: example.distance,
                theta: (index / examples.length) * Math.PI * 2,
                phi: Math.PI * 0.5,
                speed: 0.001,
                color: example.hazardous ? 0xff1744 : 0xff9933,
                isHazardous: example.hazardous,
                realData: {
                    diameterKm: example.size * 2,
                    distanceKm: example.distance * 100000,
                    velocityKmH: 50000,
                    approachDate: 'Exemplo - sem data'
                }
            };

            this.createAsteroid(asteroidInfo);
        });
    }

    update(deltaTime = 0.016) {
        // Atualiza posição de todos os asteroides
        this.asteroids.forEach(asteroid => {
            // Movimento orbital
            asteroid.userData.theta += asteroid.userData.speed;

            const { distance, theta, phi } = asteroid.userData;
            asteroid.position.set(
                distance * Math.sin(phi) * Math.cos(theta),
                distance * Math.sin(phi) * Math.sin(theta),
                distance * Math.cos(phi)
            );

            // Rotação própria do asteroide
            asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
            asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
        });
    }

    clearAsteroids() {
        // Remove todos os asteroides da cena
        this.asteroids.forEach(asteroid => {
            this.scene.remove(asteroid);
            asteroid.geometry.dispose();
            asteroid.material.dispose();
        });
        this.asteroids = [];

        // Remove linhas de órbita
        this.orbitLines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        });
        this.orbitLines = [];

        console.log('🗑️ Asteroides removidos da cena');
    }

    toggleOrbits(show) {
        this.config.showOrbits = show;

        if (show && this.orbitLines.length === 0) {
            // Recriar órbitas
            this.asteroids.forEach(asteroid => {
                this.createOrbitLine({
                    distance: asteroid.userData.distance,
                    phi: asteroid.userData.phi,
                    isHazardous: asteroid.userData.isHazardous
                });
            });
        } else if (!show) {
            // Esconder órbitas
            this.orbitLines.forEach(line => {
                line.visible = false;
            });
        } else {
            // Mostrar órbitas
            this.orbitLines.forEach(line => {
                line.visible = true;
            });
        }
    }

    toggleRealDistanceMode(enabled) {
        /**
         * Alterna entre modo de visualização e modo de distância real
         * @param {boolean} enabled - true para distância real, false para visualização
         */
        this.config.useRealDistance = enabled;

        // Mostrar/esconder referência da órbita da Lua
        if (this.moonOrbitReference) {
            this.moonOrbitReference.visible = enabled;
        }

        // Recalcular posições de todos os asteroides
        this.asteroids.forEach(asteroid => {
            const realDistanceKm = asteroid.userData.realData.distanceKm;
            const newVisualDistance = this.calculateAdaptiveDistance(realDistanceKm);

            // Atualizar distância armazenada
            asteroid.userData.distance = newVisualDistance;

            // Atualizar cor baseada no modo
            const newColor = enabled
                ? this.getDistanceColor(realDistanceKm)
                : (asteroid.userData.isHazardous ? 0xff1744 : 0xff9933);

            asteroid.material.color.setHex(newColor);

            // Atualizar posição imediatamente
            const { theta, phi } = asteroid.userData;
            asteroid.position.set(
                newVisualDistance * Math.sin(phi) * Math.cos(theta),
                newVisualDistance * Math.sin(phi) * Math.sin(theta),
                newVisualDistance * Math.cos(phi)
            );
        });

        // Recriar linhas de órbita com novas distâncias
        if (this.config.showOrbits) {
            // Remove órbitas antigas
            this.orbitLines.forEach(line => {
                this.scene.remove(line);
                line.geometry.dispose();
                line.material.dispose();
            });
            this.orbitLines = [];

            // Cria novas órbitas
            this.asteroids.forEach(asteroid => {
                this.createOrbitLine({
                    distance: asteroid.userData.distance,
                    phi: asteroid.userData.phi,
                    isHazardous: asteroid.userData.isHazardous,
                    color: asteroid.material.color.getHex()
                });
            });
        }

        const mode = enabled ? 'DISTÂNCIA REAL (escala científica)' : 'VISUALIZAÇÃO (comprimida)';
        console.log(`🔄 Modo alterado para: ${mode}`);
        console.log(`   🌙 Órbita da Lua: ${enabled ? 'visível' : 'oculta'}`);
        console.log(`   🎨 Cores: ${enabled ? 'por distância' : 'por periculosidade'}`);
    }

    getAsteroidInfo(asteroid) {
        // Retorna informações formatadas de um asteroide
        const data = asteroid.userData;
        const lunarDist = data.realData.distanceLunar;

        return {
            name: data.name,
            id: data.id,
            isHazardous: data.isHazardous,
            diameter: `${(data.realData.diameterKm * 1000).toFixed(0)} m (${data.realData.diameterMin.toFixed(2)}-${data.realData.diameterMax.toFixed(2)} km)`,
            distanceKm: `${(data.realData.distanceKm / 1000).toFixed(0)} mil km`,
            distanceLunar: `${lunarDist.toFixed(2)} LD (${lunarDist < 1 ? 'MUITO PRÓXIMO' : lunarDist < 5 ? 'Próximo' : lunarDist < 20 ? 'Moderado' : 'Distante'})`,
            distanceAU: `${data.realData.distanceAU.toFixed(4)} UA`,
            velocityKmH: `${data.realData.velocityKmH.toFixed(0)} km/h`,
            velocityKmS: `${data.realData.velocityKmS.toFixed(2)} km/s`,
            approachDate: data.realData.approachDate,
            approachDateShort: data.realData.approachDateShort
        };
    }

    getStats() {
        return {
            total: this.asteroids.length,
            hazardous: this.asteroids.filter(a => a.userData.isHazardous).length,
            safe: this.asteroids.filter(a => !a.userData.isHazardous).length,
            orbitsVisible: this.config.showOrbits
        };
    }
}

/**
 * Exemplo de uso:
 *
 * import { AsteroidOrbitalViewer } from './asteroid-orbital-view.js';
 *
 * // No AstroShieldViewer, após criar a Terra:
 * this.asteroidViewer = new AsteroidOrbitalViewer(this.scene, this.earth);
 *
 * // Carregar asteroides reais
 * await this.asteroidViewer.loadNASAAsteroids('SUA_API_KEY');
 *
 * // No loop de animação:
 * this.asteroidViewer.update();
 */
