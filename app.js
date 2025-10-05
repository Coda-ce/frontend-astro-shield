import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AsteroidOrbitalViewer } from './asteroid-orbital-view.js';

// ==========================================
// CONFIGURAÇÃO DA CENA 3D
// ==========================================

class AstroShieldViewer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Controles de órbita
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 50;

        // Posição inicial da câmera
        this.camera.position.set(0, 5, 15);
        this.controls.update();

        // Objetos da cena
        this.earth = null;
        this.impactMarker = null;
        this.impactZone = null;
        this.selectedLocation = { lat: 40.7128, lon: -74.0060 }; // NYC default

        this.setupLights();
        this.setupStars();
        this.loadEarthModel();
        this.setupRaycaster();
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Luz solar principal (muito mais intensa)
        const sunLight = new THREE.DirectionalLight(0xffffff, 5);
        sunLight.position.set(10, 5, 7);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Luz ambiente mais intensa (ilumina tudo uniformemente)
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambientLight);

        // Luz de preenchimento frontal
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
        fillLight.position.set(-5, -3, -5);
        this.scene.add(fillLight);

        // Luz traseira para dar volume
        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(0, 0, -10);
        this.scene.add(backLight);

        // Hemisphere light (céu e chão)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);

        // Point light próxima à câmera
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);

        console.log('✅ Sistema de iluminação configurado (6 luzes ativas)');
    }

    setupStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    loadEarthModel() {
        const loader = new GLTFLoader();

        // Tenta diferentes caminhos para o modelo
        const possiblePaths = [
            './earth_3d.glb',
            '/earth_3d.glb',
            'earth_3d.glb'
        ];

        let pathIndex = 0;

        const tryLoadModel = () => {
            if (pathIndex >= possiblePaths.length) {
                console.warn('⚠️ Não foi possível carregar earth_3d.glb, usando esfera de fallback');
                this.createFallbackEarth();
                return;
            }

            const currentPath = possiblePaths[pathIndex];
            console.log(`Tentando carregar: ${currentPath}`);

            loader.load(
                currentPath,
                (gltf) => {
                    console.log('✅ GLB carregado! Processando...', gltf);

                    this.earth = gltf.scene;

                    // Debug: verificar estrutura do modelo
                    console.log('📦 Objetos no modelo:', this.earth.children.length);
                    console.log('📍 Posição inicial:', this.earth.position);

                    // Calcular bounding box para ajustar escala automaticamente
                    const box = new THREE.Box3().setFromObject(this.earth);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    // Escalar para ter ~10 unidades de diâmetro
                    const targetSize = 10;
                    const scale = targetSize / maxDim;

                    console.log(`📏 Tamanho original: ${maxDim.toFixed(2)}, escala aplicada: ${scale.toFixed(2)}`);

                    // Aplicar transformações
                    this.earth.scale.set(scale, scale, scale);
                    this.earth.rotation.x = Math.PI * 0.05; // Inclinação axial

                    // Centralizar modelo na origem
                    const center = box.getCenter(new THREE.Vector3());
                    this.earth.position.sub(center.multiplyScalar(scale));

                    // Garantir que materiais sejam visíveis e bem iluminados
                    this.earth.traverse((child) => {
                        if (child.isMesh) {
                            console.log('🎨 Mesh encontrado:', child.name);

                            if (child.material) {
                                child.material.needsUpdate = true;

                                // Se material for completamente preto, aplicar cor azul Terra
                                if (child.material.color) {
                                    const c = child.material.color;
                                    if (c.r === 0 && c.g === 0 && c.b === 0) {
                                        console.log('⚠️ Material preto detectado, aplicando cor azul Terra');
                                        child.material.color.setHex(0x2194ce);
                                    }
                                }

                                // Adicionar emissive para garantir visibilidade
                                if (child.material.emissive !== undefined) {
                                    child.material.emissive.setHex(0x0a3a5a);
                                    child.material.emissiveIntensity = 0.2;
                                    console.log('✨ Emissive adicionado ao material');
                                }

                                // Garantir que recebe luz
                                if (child.material.metalness !== undefined) {
                                    child.material.metalness = Math.min(child.material.metalness, 0.3);
                                }
                                if (child.material.roughness !== undefined) {
                                    child.material.roughness = Math.max(child.material.roughness, 0.5);
                                }
                            }
                        }
                    });

                    this.scene.add(this.earth);

                    // Debug: verificar se foi adicionado
                    console.log('🌍 Terra adicionada à cena. Total de objetos:', this.scene.children.length);

                    // Remove loading screen
                    document.getElementById('loading').style.display = 'none';

                    console.log('✅ Modelo da Terra carregado e renderizado com sucesso!');

                    // Inicializar visualizador de asteroides
                    this.initializeAsteroidViewer();
                },
                (xhr) => {
                    if (xhr.total > 0) {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        console.log(`Carregando modelo: ${percent.toFixed(1)}%`);
                    }
                },
                (error) => {
                    console.error(`❌ Erro ao carregar ${currentPath}:`, error);
                    pathIndex++;
                    tryLoadModel();
                }
            );
        };

        tryLoadModel();
    }

    createFallbackEarth() {
        // Cria uma esfera texturizada como fallback
        const geometry = new THREE.SphereGeometry(5, 64, 64);

        // Textura procedural simples (azul e verde para simular Terra)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Gradiente azul (oceano)
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#1a4d7a');
        gradient.addColorStop(0.5, '#2068a3');
        gradient.addColorStop(1, '#1a4d7a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Adiciona "continentes" verdes aleatórios
        ctx.fillStyle = '#2d5a2d';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 100 + 50;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 30,
            specular: 0x666666,
            emissive: 0x111111, // Pequeno brilho próprio
            emissiveIntensity: 0.2
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.x = Math.PI * 0.05;
        this.scene.add(this.earth);

        // Debug
        console.log('🌍 Terra (fallback) criada:', {
            position: this.earth.position,
            scale: this.earth.scale,
            visible: this.earth.visible
        });

        // Remove loading screen
        document.getElementById('loading').style.display = 'none';

        console.log('✅ Terra (fallback) criada com sucesso!');

        // Inicializar visualizador de asteroides
        this.initializeAsteroidViewer();
    }

    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('click', (event) => {
            // Normaliza coordenadas do mouse
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Raycast
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.earth) {
                const intersects = this.raycaster.intersectObject(this.earth, true);

                if (intersects.length > 0) {
                    const point = intersects[0].point;

                    // Converte ponto 3D para lat/lon
                    const coords = this.cartesianToLatLon(point);
                    this.selectedLocation = coords;

                    // Adiciona marcador de impacto
                    this.addImpactMarker(point);

                    console.log(`📍 Local selecionado: ${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°`);
                }
            }
        });
    }

    cartesianToLatLon(point) {
        // Normaliza pelo scale do earth model
        const x = point.x / 5;
        const y = point.y / 5;
        const z = point.z / 5;

        const lat = Math.asin(y) * (180 / Math.PI);
        const lon = Math.atan2(z, x) * (180 / Math.PI);

        return { lat, lon };
    }

    latLonToCartesian(lat, lon, radius = 5) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    addImpactMarker(position) {
        // Remove marcador anterior
        if (this.impactMarker) {
            this.scene.remove(this.impactMarker);
        }

        // Cria novo marcador (esfera vermelha pulsante)
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff1744,
            transparent: true,
            opacity: 0.9
        });

        this.impactMarker = new THREE.Mesh(geometry, material);
        this.impactMarker.position.copy(position);
        this.scene.add(this.impactMarker);

        // Animação de pulsação
        this.impactMarker.userData.pulse = 0;
    }

    addImpactZone(lat, lon, radiusKm) {
        // Remove zona anterior
        if (this.impactZone) {
            this.scene.remove(this.impactZone);
        }

        // Converte raio de km para unidades do modelo
        // Assumindo Terra com raio 5 unidades = 6371 km real
        const radiusUnits = (radiusKm / 6371) * 5;

        // Cria círculo representando zona de impacto
        const geometry = new THREE.RingGeometry(radiusUnits * 0.9, radiusUnits, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff1744,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });

        this.impactZone = new THREE.Mesh(geometry, material);

        // Posiciona e orienta o círculo na superfície
        const position = this.latLonToCartesian(lat, lon, 5.05);
        this.impactZone.position.copy(position);
        this.impactZone.lookAt(new THREE.Vector3(0, 0, 0));

        this.scene.add(this.impactZone);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotação suave da Terra
        if (this.earth) {
            this.earth.rotation.y += 0.0005;
        }

        // Animação de pulsação do marcador
        if (this.impactMarker) {
            this.impactMarker.userData.pulse += 0.05;
            const scale = 1 + Math.sin(this.impactMarker.userData.pulse) * 0.3;
            this.impactMarker.scale.set(scale, scale, scale);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // Atualizar asteroides orbitais
        if (this.asteroidViewer) {
            this.asteroidViewer.update();
        }

        // Debug inicial (apenas uma vez)
        if (!this._debugLogged) {
            this._debugLogged = true;
            console.log('🎬 Loop de animação ativo');
            console.log('📹 Camera position:', this.camera.position);
            console.log('🎯 Camera target:', this.controls.target);
            console.log('🌟 Objetos na cena:', this.scene.children.length);
        }
    }

    async initializeAsteroidViewer() {
        console.log('🛰️ Inicializando visualizador de asteroides...');

        try {
            // Criar visualizador
            this.asteroidViewer = new AsteroidOrbitalViewer(this.scene, this.earth);
            console.log('✅ AsteroidOrbitalViewer criado');

            // Carregar asteroides da NASA (usa chave do config.js automaticamente)
            const stats = await this.asteroidViewer.loadNASAAsteroids();

            console.log('📊 Estatísticas de asteroides:', stats);

            // Atualizar UI com estatísticas
            this.updateAsteroidStats(stats);
            console.log('✅ UI de asteroides atualizada');
        } catch (error) {
            console.error('❌ Erro ao inicializar asteroides:', error);
        }
    }

    updateAsteroidStats(stats) {
        // Adiciona ou atualiza painel de estatísticas de asteroides
        let statsPanel = document.getElementById('asteroid-stats');

        if (!statsPanel) {
            statsPanel = document.createElement('div');
            statsPanel.id = 'asteroid-stats';

            // Calcular posição baseada no painel de controle
            const controlPanel = document.getElementById('control-panel');
            const topPosition = controlPanel ? controlPanel.offsetHeight + 100 : 500;

            statsPanel.style.cssText = `
                position: fixed;
                top: ${topPosition}px;
                left: 20px;
                width: 360px;
                background: var(--bg-panel);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 20px;
                z-index: 50;
                backdrop-filter: blur(10px);
                font-size: 13px;
            `;
            document.body.appendChild(statsPanel);
            console.log(`✅ Painel de asteroides criado (posição: top ${topPosition}px, left 20px)`);
        }

        statsPanel.innerHTML = `
            <h3 style="color: var(--accent-primary); margin: 0 0 10px 0; font-size: 14px;">
                🛰️ Asteroides Próximos
            </h3>
            <div style="color: var(--text-secondary); line-height: 1.8;">
                <div>📊 Total exibido: <strong style="color: var(--text-primary);">${stats.displayed}</strong></div>
                <div>⚠️ Perigosos: <strong style="color: var(--accent-danger);">${stats.hazardous || 0}</strong></div>
                <div>✅ Seguros: <strong style="color: var(--accent-success);">${(stats.displayed - (stats.hazardous || 0))}</strong></div>
                ${stats.error ? `<div style="color: var(--accent-warning); margin-top: 8px; font-size: 11px;">⚠️ ${stats.error}</div>` : ''}
            </div>
            <div style="margin-top: 12px; padding: 10px; background: rgba(0, 229, 255, 0.1); border-radius: 6px; border: 1px solid rgba(0, 229, 255, 0.3);">
                <label style="display: flex; align-items: center; cursor: pointer; font-size: 12px;">
                    <input type="checkbox" id="real-distance-toggle" style="margin-right: 8px; cursor: pointer;">
                    <span>📏 Distância Real (escala científica)</span>
                </label>
                <div id="distance-mode-info" style="font-size: 10px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">
                    🎨 Modo: Visualização (cores por periculosidade)
                </div>
            </div>
            <button id="toggle-orbits-btn" style="
                margin-top: 12px;
                width: 100%;
                padding: 8px;
                background: var(--accent-primary);
                border: none;
                border-radius: 6px;
                color: #0a0e27;
                font-weight: 600;
                cursor: pointer;
                font-size: 12px;
            ">
                🌐 Alternar Órbitas
            </button>
            <a href="asteroids.html" style="
                display: block;
                margin-top: 8px;
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, var(--accent-primary), #0099cc);
                border: none;
                border-radius: 6px;
                color: #0a0e27;
                font-weight: 700;
                text-align: center;
                text-decoration: none;
                font-size: 12px;
                transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                📋 Ver Todos os Asteroides
            </a>
        `;

        // Event listener para botão de órbitas
        const toggleBtn = document.getElementById('toggle-orbits-btn');
        if (toggleBtn && this.asteroidViewer) {
            toggleBtn.addEventListener('click', () => {
                const currentState = this.asteroidViewer.config.showOrbits;
                this.asteroidViewer.toggleOrbits(!currentState);
                console.log(`Órbitas ${!currentState ? 'ativadas' : 'desativadas'}`);
            });
        }

        // Event listener para checkbox de distância real
        const distanceToggle = document.getElementById('real-distance-toggle');
        const distanceModeInfo = document.getElementById('distance-mode-info');

        if (distanceToggle && this.asteroidViewer) {
            distanceToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                this.asteroidViewer.toggleRealDistanceMode(enabled);

                // Mostrar/esconder legenda de distâncias
                const legend = document.getElementById('distance-legend');
                if (legend) {
                    legend.classList.toggle('active', enabled);
                }

                // Atualizar informação do modo
                if (distanceModeInfo) {
                    if (enabled) {
                        distanceModeInfo.innerHTML = `
                            🌙 Modo: <strong>Distância Real</strong><br>
                            🎨 Cores: Por proximidade (🔴 < 1 LD, 🟠 1-5 LD, 🟡 5-20 LD, 🟢 > 20 LD)<br>
                            📏 Referência da Lua visível (linha branca)
                        `;
                    } else {
                        distanceModeInfo.innerHTML = `
                            🎨 Modo: Visualização (cores por periculosidade)
                        `;
                    }
                }

                console.log(`📏 Modo de distância: ${enabled ? 'REAL' : 'VISUALIZAÇÃO'}`);
            });
        }
    }

    getAsteroidViewer() {
        return this.asteroidViewer;
    }
}

// ==========================================
// CÁLCULOS FÍSICOS DE IMPACTO
// ==========================================

class ImpactCalculator {
    static calculateMass(diameterM, densityKgM3) {
        const radiusM = diameterM / 2;
        const volumeM3 = (4/3) * Math.PI * Math.pow(radiusM, 3);
        return volumeM3 * densityKgM3;
    }

    static calculateKineticEnergy(massKg, velocityMS) {
        return 0.5 * massKg * Math.pow(velocityMS, 2);
    }

    static energyToMegatons(energyJoules) {
        const megatonInJoules = 4.184e15;
        return energyJoules / megatonInJoules;
    }

    static calculateCraterDiameter(energyMegatons, angleDegs, targetDensity = 2500) {
        // Fórmula de Collins et al. (2005)
        const energyJoules = energyMegatons * 4.184e15;
        const angleRad = angleDegs * (Math.PI / 180);

        const diameterM = 1.161 *
            Math.pow(energyJoules, 0.302) *
            Math.pow(targetDensity, -0.302) *
            Math.pow(Math.sin(angleRad), 0.302);

        return diameterM / 1000; // Retorna em km
    }

    static calculateSeismicMagnitude(energyJoules) {
        // Escala Richter equivalente
        return (2/3) * Math.log10(energyJoules) - 3.2;
    }

    static calculateBlastRadius(energyMegatons) {
        // Raio de devastação (overpressure 20 PSI)
        return 2.2 * Math.pow(energyMegatons, 0.33);
    }

    static calculateThermalRadius(energyMegatons) {
        // Raio de queimaduras de 3º grau
        return 3.5 * Math.pow(energyMegatons, 0.41);
    }

    static compareToHiroshima(energyMegatons) {
        const hiroshimaMegatons = 0.015; // 15 kilotons
        return energyMegatons / hiroshimaMegatons;
    }

    static getEnergyComparison(energyMegatons) {
        const hiroshimaRatio = this.compareToHiroshima(energyMegatons);

        if (hiroshimaRatio < 0.1) {
            return "Evento pequeno (meteoro)";
        } else if (hiroshimaRatio < 1) {
            return `${hiroshimaRatio.toFixed(2)}× Hiroshima`;
        } else if (hiroshimaRatio < 100) {
            return `${hiroshimaRatio.toFixed(1)}× Hiroshima`;
        } else if (hiroshimaRatio < 1000) {
            return `${(hiroshimaRatio).toFixed(0)}× Hiroshima`;
        } else {
            const tsarBombaRatio = energyMegatons / 50; // Tsar Bomba = 50 MT
            return `${tsarBombaRatio.toFixed(1)}× Tsar Bomba`;
        }
    }
}

// ==========================================
// CONTROLE DA UI
// ==========================================

class UIController {
    constructor(viewer) {
        this.viewer = viewer;
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupKeyboardShortcuts();
    }

    loadScenario(scenario) {
        // Preenche os campos com os valores do cenário
        document.getElementById('diameter').value = scenario.diameter;
        document.getElementById('diameter-value').textContent = `${scenario.diameter} m`;

        document.getElementById('velocity').value = scenario.velocity;
        document.getElementById('velocity-value').textContent = `${scenario.velocity} km/s`;

        document.getElementById('angle').value = scenario.angle;
        document.getElementById('angle-value').textContent = `${scenario.angle}°`;

        document.getElementById('density').value = scenario.density;
        const densitySelect = document.getElementById('density');
        const selectedText = densitySelect.options[densitySelect.selectedIndex].text;
        document.getElementById('density-value').textContent = selectedText.split('(')[1].replace(')', '');

        // Define localização
        if (scenario.location) {
            const [lat, lon] = scenario.location.split(',').map(parseFloat);
            this.viewer.selectedLocation = { lat, lon };

            // Adiciona marcador visual
            const position = this.viewer.latLonToCartesian(lat, lon);
            this.viewer.addImpactMarker(position);
        }

        // Executa simulação automaticamente após 1 segundo
        setTimeout(() => {
            this.runSimulation();
        }, 1000);
    }

    setupEventListeners() {
        // Atualização em tempo real dos valores
        const diameterSlider = document.getElementById('diameter');
        const velocitySlider = document.getElementById('velocity');
        const angleSlider = document.getElementById('angle');
        const densitySelect = document.getElementById('density');
        const locationSelect = document.getElementById('location');

        diameterSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('diameter-value').textContent = `${value} m`;
            e.target.setAttribute('aria-valuenow', value);
        });

        velocitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('velocity-value').textContent = `${value} km/s`;
            e.target.setAttribute('aria-valuenow', value);
        });

        angleSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('angle-value').textContent = `${value}°`;
            e.target.setAttribute('aria-valuenow', value);
        });

        densitySelect.addEventListener('change', (e) => {
            const selectedText = e.target.options[e.target.selectedIndex].text;
            document.getElementById('density-value').textContent = selectedText.split('(')[1].replace(')', '');
        });

        locationSelect.addEventListener('change', (e) => {
            const [lat, lon] = e.target.value.split(',').map(parseFloat);
            this.viewer.selectedLocation = { lat, lon };

            // Adiciona marcador visual
            const position = this.viewer.latLonToCartesian(lat, lon);
            this.viewer.addImpactMarker(position);

            // Anuncia mudança para leitores de tela
            this.announce(`Local de impacto selecionado: ${e.target.options[e.target.selectedIndex].text}`);
        });

        // Botão de simulação
        document.getElementById('simulate-btn').addEventListener('click', () => {
            this.runSimulation();
        });

        // Suporte a Enter para simular
        document.getElementById('simulate-btn').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.runSimulation();
            }
        });
    }

    setupAccessibility() {
        // Detectar navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });

        // Respeitar preferência de movimento reduzido
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            console.log('♿ Modo de movimento reduzido ativado');
            // Desabilitar animações no viewer se necessário
            if (this.viewer.earth) {
                // Opcional: reduzir velocidade de rotação
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Não processar se estiver em um input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case 's':
                case ' ': // Espaço
                    e.preventDefault();
                    this.runSimulation();
                    this.announce('Simulação iniciada');
                    break;

                case 'r':
                    e.preventDefault();
                    this.resetSimulation();
                    this.announce('Simulação resetada');
                    break;

                case '?':
                case 'h':
                    e.preventDefault();
                    this.showKeyboardHelp();
                    break;

                case 'escape':
                    this.hideKeyboardHelp();
                    break;
            }
        });

        console.log('⌨️ Atalhos de teclado configurados:');
        console.log('  S ou Espaço: Simular impacto');
        console.log('  R: Resetar simulação');
        console.log('  H ou ?: Mostrar ajuda');
    }

    announce(message) {
        // Anuncia mensagem para leitores de tela
        const announcer = document.getElementById('aria-announcements');
        if (announcer) {
            announcer.textContent = message;

            // Limpa após 3 segundos
            setTimeout(() => {
                announcer.textContent = '';
            }, 3000);
        }
    }

    resetSimulation() {
        // Reseta valores para padrão
        document.getElementById('diameter').value = 500;
        document.getElementById('diameter-value').textContent = '500 m';

        document.getElementById('velocity').value = 28;
        document.getElementById('velocity-value').textContent = '28 km/s';

        document.getElementById('angle').value = 45;
        document.getElementById('angle-value').textContent = '45°';

        document.getElementById('density').value = 2500;

        // Reseta resultados
        document.getElementById('energy-value').textContent = '0';
        document.getElementById('crater-value').textContent = '0';
        document.getElementById('seismic-value').textContent = '0';
        document.getElementById('blast-value').textContent = '0';
        document.getElementById('thermal-value').textContent = '0';
        document.getElementById('comparison-value').textContent = '-';

        // Remove marcador e zona de impacto
        if (this.viewer.impactMarker) {
            this.viewer.scene.remove(this.viewer.impactMarker);
            this.viewer.impactMarker = null;
        }
        if (this.viewer.impactZone) {
            this.viewer.scene.remove(this.viewer.impactZone);
            this.viewer.impactZone = null;
        }
    }

    showKeyboardHelp() {
        // Cria modal de ajuda se não existir
        let helpModal = document.getElementById('keyboard-help-modal');

        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'keyboard-help-modal';
            helpModal.setAttribute('role', 'dialog');
            helpModal.setAttribute('aria-labelledby', 'help-title');
            helpModal.setAttribute('aria-modal', 'true');
            helpModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-panel);
                border: 2px solid var(--accent-primary);
                border-radius: 12px;
                padding: 30px;
                z-index: 10000;
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
            `;

            helpModal.innerHTML = `
                <h2 id="help-title" style="color: var(--accent-primary); margin-bottom: 20px;">⌨️ Atalhos de Teclado</h2>
                <div style="line-height: 2;">
                    <p><strong>S</strong> ou <strong>Espaço</strong> - Simular impacto</p>
                    <p><strong>R</strong> - Resetar simulação</p>
                    <p><strong>Tab</strong> - Navegar entre controles</p>
                    <p><strong>H</strong> ou <strong>?</strong> - Mostrar esta ajuda</p>
                    <p><strong>Esc</strong> - Fechar ajuda</p>
                </div>
                <button id="close-help-btn" style="
                    margin-top: 20px;
                    width: 100%;
                    padding: 12px;
                    background: var(--accent-primary);
                    border: none;
                    border-radius: 8px;
                    color: var(--bg-primary);
                    font-weight: 700;
                    cursor: pointer;
                ">Fechar (Esc)</button>
            `;

            document.body.appendChild(helpModal);

            document.getElementById('close-help-btn').addEventListener('click', () => {
                this.hideKeyboardHelp();
            });
        }

        helpModal.style.display = 'block';
        document.getElementById('close-help-btn').focus();
        this.announce('Modal de ajuda de teclado aberta');
    }

    hideKeyboardHelp() {
        const helpModal = document.getElementById('keyboard-help-modal');
        if (helpModal) {
            helpModal.style.display = 'none';
            this.announce('Modal de ajuda fechada');
        }
    }

    runSimulation() {
        // Coleta parâmetros
        const diameterM = parseFloat(document.getElementById('diameter').value);
        const densityKgM3 = parseFloat(document.getElementById('density').value);
        const velocityKmS = parseFloat(document.getElementById('velocity').value);
        const angleDegs = parseFloat(document.getElementById('angle').value);

        const velocityMS = velocityKmS * 1000;

        // Cálculos
        const mass = ImpactCalculator.calculateMass(diameterM, densityKgM3);
        const kineticEnergy = ImpactCalculator.calculateKineticEnergy(mass, velocityMS);
        const energyMT = ImpactCalculator.energyToMegatons(kineticEnergy);
        const craterDiameter = ImpactCalculator.calculateCraterDiameter(energyMT, angleDegs);
        const seismicMag = ImpactCalculator.calculateSeismicMagnitude(kineticEnergy);
        const blastRadius = ImpactCalculator.calculateBlastRadius(energyMT);
        const thermalRadius = ImpactCalculator.calculateThermalRadius(energyMT);
        const comparison = ImpactCalculator.getEnergyComparison(energyMT);

        // Atualiza UI
        document.getElementById('energy-value').textContent = energyMT.toFixed(2);
        document.getElementById('crater-value').textContent = craterDiameter.toFixed(2);
        document.getElementById('seismic-value').textContent = seismicMag.toFixed(1);
        document.getElementById('blast-value').textContent = blastRadius.toFixed(1);
        document.getElementById('thermal-value').textContent = thermalRadius.toFixed(1);
        document.getElementById('comparison-value').textContent = comparison;

        // Visualiza zona de impacto no globo
        this.viewer.addImpactZone(
            this.viewer.selectedLocation.lat,
            this.viewer.selectedLocation.lon,
            blastRadius
        );

        // Anuncia resultado para leitores de tela
        this.announce(`Simulação concluída. Energia liberada: ${energyMT.toFixed(2)} megatons. Raio de devastação: ${blastRadius.toFixed(1)} quilômetros. Magnitude sísmica: ${seismicMag.toFixed(1)} na escala Richter.`);

        console.log('🎯 Simulação concluída!');
        console.log(`💥 Energia: ${energyMT.toFixed(2)} MT`);
        console.log(`🕳️ Cratera: ${craterDiameter.toFixed(2)} km`);
        console.log(`📏 Blast radius: ${blastRadius.toFixed(1)} km`);
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    const viewer = new AstroShieldViewer();
    const uiController = new UIController(viewer);

    // Carrega cenário pré-definido se existir
    const savedScenario = localStorage.getItem('astroshield_scenario');
    if (savedScenario) {
        try {
            const scenario = JSON.parse(savedScenario);
            uiController.loadScenario(scenario);
            localStorage.removeItem('astroshield_scenario');
            console.log('📂 Cenário carregado:', scenario);
        } catch (error) {
            console.error('❌ Erro ao carregar cenário:', error);
        }
    }

    console.log('🚀 AstroShield inicializado!');
    console.log('📡 Sistema pronto para simulação de impactos asteroidais');
});
