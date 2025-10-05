import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AsteroidOrbitalViewer } from './asteroid-orbital-view.js';
import { MapView } from './map-view.js';
import { PopulationEstimator } from './population-estimator.js';
import { ImpactReport } from './impact-report.js';

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

        // View management
        this.currentView = '3d'; // '3d' or '2d'
        this.mapView = new MapView('map-container');
        this.lastSimulationResults = null;

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
            <h3 style="color: var(--accent-primary); margin: 0 0 10px 0; font-size: 13px;">
                🎛️ Menu de Navegação
            </h3>

            <button id="toggle-orbits-btn"
                    role="button"
                    aria-label="Alternar visualização de órbitas dos asteroides"
                    tabindex="0"
                    style="
                margin-bottom: 6px;
                width: 100%;
                padding: 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                font-weight: 600;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            ">
                <span aria-hidden="true">🌐</span> Alternar Órbitas
            </button>

            <button id="distance-toggle-btn"
                    role="switch"
                    aria-label="Alternar modo de distância real com escala científica"
                    aria-checked="false"
                    tabindex="0"
                    style="
                margin-bottom: 6px;
                width: 100%;
                padding: 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                font-weight: 600;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <span class="toggle-indicator" aria-hidden="true" style="
                    width: 36px;
                    height: 20px;
                    background: var(--bg-primary);
                    border-radius: 10px;
                    position: relative;
                    flex-shrink: 0;
                    border: 1px solid var(--border-color);
                    display: block;
                ">
                    <span class="toggle-knob" style="
                        position: absolute;
                        width: 16px;
                        height: 16px;
                        background: var(--text-secondary);
                        border-radius: 50%;
                        top: 1px;
                        left: 2px;
                        transition: all 0.3s ease;
                        display: block;
                    "></span>
                </span>
                <span style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                    <span aria-hidden="true">📏</span> Distância Real
                </span>
            </button>

            <a href="asteroids.html"
               role="link"
               aria-label="Ver lista completa de todos os asteroides próximos da Terra"
               tabindex="0"
               style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-bottom: 6px;
                width: 100%;
                padding: 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                font-weight: 600;
                text-align: center;
                text-decoration: none;
                font-size: 11px;
                transition: all 0.3s;
            ">
                <span aria-hidden="true">📋</span> Todos os Asteroides
            </a>

            <a href="sentry-watch.html"
               role="link"
               aria-label="Acessar NASA Sentry Watch - monitoramento de asteroides de longo prazo"
               tabindex="0"
               style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-bottom: 6px;
                width: 100%;
                padding: 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                font-weight: 600;
                text-align: center;
                text-decoration: none;
                font-size: 11px;
                transition: all 0.3s;
            ">
                <span aria-hidden="true">🎯</span> Sentry Watch
            </a>

            <a href="examples.html"
               role="link"
               aria-label="Ver exemplos de cenários de impacto pré-configurados"
               tabindex="0"
               style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                width: 100%;
                padding: 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                font-weight: 600;
                text-align: center;
                text-decoration: none;
                font-size: 11px;
                transition: all 0.3s;
            ">
                <span aria-hidden="true">💡</span> Exemplos
            </a>

            <style>
                /* Hover e focus para botões e links */
                #asteroid-stats a:hover,
                #asteroid-stats button:hover {
                    border-color: var(--accent-primary) !important;
                    background: rgba(0, 229, 255, 0.1) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 229, 255, 0.2);
                }

                /* Focus visível para acessibilidade */
                #asteroid-stats a:focus,
                #asteroid-stats button:focus {
                    outline: 3px solid var(--accent-primary);
                    outline-offset: 2px;
                    border-color: var(--accent-primary) !important;
                }

                /* Toggle ativo - estado ON */
                #distance-toggle-btn.active {
                    background: rgba(0, 229, 255, 0.15) !important;
                    border-color: var(--accent-primary) !important;
                }

                #distance-toggle-btn.active .toggle-indicator {
                    background: var(--accent-primary) !important;
                    border-color: var(--accent-primary) !important;
                }

                #distance-toggle-btn.active .toggle-knob {
                    left: 16px !important;
                    background: white !important;
                    box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
                }

                /* Animação do toggle knob */
                .toggle-knob {
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                                background 0.3s ease !important;
                }

                .toggle-indicator {
                    transition: background 0.3s ease,
                                border-color 0.3s ease !important;
                }

                /* Suporte para movimento reduzido */
                @media (prefers-reduced-motion: reduce) {
                    #asteroid-stats a,
                    #asteroid-stats button,
                    .toggle-knob {
                        transition: none !important;
                    }
                }

                /* Teclado navegação */
                body.keyboard-nav #asteroid-stats a:focus,
                body.keyboard-nav #asteroid-stats button:focus {
                    outline: 4px solid var(--accent-primary);
                    outline-offset: 4px;
                }
            </style>
        `;

        // Event listener para botão de órbitas
        const toggleBtn = document.getElementById('toggle-orbits-btn');
        if (toggleBtn && this.asteroidViewer) {
            toggleBtn.addEventListener('click', () => {
                const currentState = this.asteroidViewer.config.showOrbits;
                this.asteroidViewer.toggleOrbits(!currentState);
                console.log(`Órbitas ${!currentState ? 'ativadas' : 'desativadas'}`);
            });

            // Suporte a Enter e Space
            toggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleBtn.click();
                }
            });
        }

        // Event listener para botão de distância real (novo toggle switch)
        const distanceToggleBtn = document.getElementById('distance-toggle-btn');

        if (distanceToggleBtn && this.asteroidViewer) {
            let isActive = false;

            const toggleDistance = () => {
                isActive = !isActive;

                console.log(`🔄 Toggling distance mode to: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);

                // Atualizar estado visual COM força
                if (isActive) {
                    distanceToggleBtn.classList.add('active');
                } else {
                    distanceToggleBtn.classList.remove('active');
                }

                distanceToggleBtn.setAttribute('aria-checked', isActive.toString());

                // Verificar se classe foi adicionada
                console.log('Button classes:', distanceToggleBtn.className);

                // Aplicar mudança
                this.asteroidViewer.toggleRealDistanceMode(isActive);

                // Mostrar/esconder legenda de distâncias
                const legend = document.getElementById('distance-legend');
                if (legend) {
                    if (isActive) {
                        legend.classList.add('active');
                    } else {
                        legend.classList.remove('active');
                    }
                }

                // Anunciar para leitores de tela
                if (this.announce) {
                    this.announce(`Modo de distância ${isActive ? 'real ativado' : 'visualização ativado'}`);
                }

                console.log(`📏 Modo de distância: ${isActive ? 'REAL' : 'VISUALIZAÇÃO'}`);
            };

            // Click
            distanceToggleBtn.addEventListener('click', (e) => {
                console.log('🖱️ Distance toggle clicked');
                toggleDistance();
            });

            // Suporte a Enter e Space
            distanceToggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('⌨️ Distance toggle keyboard activated');
                    toggleDistance();
                }
            });

            console.log('✅ Distance toggle button initialized');
        } else {
            console.warn('⚠️ Distance toggle button or asteroidViewer not found');
        }

        // Anunciar para leitores de tela
        this.announce = (message) => {
            const announcer = document.getElementById('aria-announcements');
            if (announcer) {
                announcer.textContent = message;
                setTimeout(() => {
                    announcer.textContent = '';
                }, 3000);
            }
        };
    }

    getAsteroidViewer() {
        return this.asteroidViewer;
    }

    /**
     * Alterna entre visualização 3D e 2D
     */
    toggleView(viewType) {
        this.currentView = viewType;

        const canvas = document.getElementById('canvas-container');
        const mapContainer = document.getElementById('map-container');

        if (viewType === '3d') {
            canvas.classList.remove('hidden');
            mapContainer.classList.remove('active');

            // Anuncia mudança
            const announcer = document.getElementById('aria-announcements');
            if (announcer) {
                announcer.textContent = 'Alternado para visualização 3D do globo';
            }
        } else if (viewType === '2d') {
            canvas.classList.add('hidden');
            mapContainer.classList.add('active');

            // Inicializar mapa se necessário e redimensionar
            this.mapView.initializeMap();
            this.mapView.resize();

            // Se houver resultado de simulação, mostrar no mapa
            if (this.lastSimulationResults) {
                this.mapView.showImpact(
                    this.selectedLocation.lat,
                    this.selectedLocation.lon,
                    this.lastSimulationResults
                );
            }

            // Anuncia mudança
            const announcer = document.getElementById('aria-announcements');
            if (announcer) {
                announcer.textContent = 'Alternado para visualização 2D do mapa';
            }
        }

        console.log(`📍 View changed to: ${viewType}`);
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

    /**
     * Calcula profundidade da cratera
     */
    static calculateCraterDepth(diameterKm) {
        // Relação profundidade/diâmetro típica: 1:5 para crateras de impacto
        return (diameterKm * 1000) / 5; // Retorna em metros
    }

    /**
     * Calcula diâmetro da bola de fogo
     */
    static calculateFireballDiameter(energyMegatons) {
        // Baseado em explosões nucleares
        return 1.9 * Math.pow(energyMegatons, 0.4); // km
    }

    /**
     * Calcula intensidade da onda de choque em decibéis
     */
    static calculateShockwaveDecibels(energyMegatons) {
        // Fórmula aproximada baseada em energia
        const pressure = 20 * Math.pow(energyMegatons, 0.33); // PSI
        const decibels = 194 + 20 * Math.log10(pressure);
        return Math.min(decibels, 280); // Limite físico
    }

    /**
     * Calcula velocidade do vento de explosão
     */
    static calculateWindSpeed(energyMegatons) {
        // Velocidade em km/s no pico
        return 0.35 * Math.pow(energyMegatons, 0.25);
    }

    /**
     * Calcula frequência de eventos similares
     */
    static calculateFrequency(energyMegatons) {
        // Baseado em estatísticas de impactos NEO
        if (energyMegatons < 1) {
            return "Anualmente";
        } else if (energyMegatons < 10) {
            return `A cada ${Math.round(energyMegatons * 10)} anos`;
        } else if (energyMegatons < 100) {
            return `A cada ${Math.round(energyMegatons * 100)} anos`;
        } else if (energyMegatons < 1000) {
            return `A cada ${Math.round(energyMegatons * 1000)} anos`;
        } else if (energyMegatons < 10000) {
            const years = Math.round(energyMegatons * 10000);
            return `A cada ${(years / 1000).toFixed(0)} mil anos`;
        } else {
            const years = Math.round(energyMegatons * 100000);
            return `A cada ${(years / 1000000).toFixed(1)} milhões de anos`;
        }
    }

    /**
     * Raio onde roupas pegam fogo
     */
    static calculateClothesIgnitionRadius(energyMegatons) {
        // Cal/cm² necessários: ~5 cal/cm²
        return 2.8 * Math.pow(energyMegatons, 0.41);
    }

    /**
     * Raio onde árvores pegam fogo
     */
    static calculateTreeIgnitionRadius(energyMegatons) {
        // Cal/cm² necessários: ~8 cal/cm²
        return 3.2 * Math.pow(energyMegatons, 0.41);
    }

    /**
     * Raio de dano pulmonar
     */
    static calculateLungDamageRadius(energyMegatons) {
        // 20 PSI overpressure
        return 1.5 * Math.pow(energyMegatons, 0.33);
    }

    /**
     * Raio de ruptura de tímpanos
     */
    static calculateEardrumRuptureRadius(energyMegatons) {
        // 5 PSI overpressure
        return 2.5 * Math.pow(energyMegatons, 0.33);
    }

    /**
     * Raio de colapso de edifícios
     */
    static calculateBuildingCollapseRadius(energyMegatons) {
        // 10 PSI overpressure
        return 2.8 * Math.pow(energyMegatons, 0.33);
    }

    /**
     * Raio de colapso de casas
     */
    static calculateHomeCollapseRadius(energyMegatons) {
        // 5 PSI overpressure
        return 3.5 * Math.pow(energyMegatons, 0.33);
    }

    /**
     * Raio de árvores derrubadas
     */
    static calculateTreeFallRadius(energyMegatons) {
        // 2 PSI overpressure
        return 4.2 * Math.pow(energyMegatons, 0.33);
    }

    /**
     * Raio de queimaduras de 2º grau
     */
    static calculate2ndDegreeBurnsRadius(energyMegatons) {
        // ~3 cal/cm²
        return 4.5 * Math.pow(energyMegatons, 0.41);
    }

    /**
     * Raio de percepção do terremoto
     */
    static calculateEarthquakePerceptionRadius(magnitude) {
        // Baseado em magnitude Richter
        return Math.pow(10, magnitude - 2); // km
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
        // View toggle buttons
        const viewToggleButtons = document.querySelectorAll('.view-toggle-btn');
        viewToggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewType = e.target.dataset.view;

                // Update active state
                viewToggleButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                e.target.classList.add('active');
                e.target.setAttribute('aria-selected', 'true');

                // Toggle view
                this.viewer.toggleView(viewType);
            });
        });

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

        // Botão de relatório detalhado
        const detailedReportBtn = document.getElementById('detailed-report-btn');
        if (detailedReportBtn) {
            detailedReportBtn.addEventListener('click', () => {
                this.renderDetailedReport();
            });
        }

        // Modal: fechar com overlay ou botão X
        const modal = document.getElementById('impact-report-modal');
        const closeModalBtn = modal?.querySelector('.report-close');
        const overlay = modal?.querySelector('.report-overlay');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                this.announce('Relatório fechado');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.classList.remove('active');
                this.announce('Relatório fechado');
            });
        }

        // Botões de ação do relatório
        const closeReportButtons = document.querySelectorAll('.report-actions button');
        closeReportButtons.forEach(btn => {
            if (btn.textContent.includes('Fechar')) {
                btn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }
        });

        // Exportar PDF (placeholder)
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                alert('Funcionalidade de exportação PDF em desenvolvimento!');
                console.log('📄 Exportar PDF solicitado');
            });
        }

        // Compartilhar (placeholder)
        const shareBtn = document.getElementById('share-report-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'AstroShield - Relatório de Impacto',
                        text: 'Veja este relatório de simulação de impacto asteroidal',
                        url: window.location.href
                    });
                } else {
                    alert('Compartilhamento não disponível neste navegador');
                }
            });
        }

        // ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
                this.announce('Relatório fechado');
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

    /**
     * Renderiza o relatório detalhado de impacto
     */
    async renderDetailedReport() {
        console.log('🔍 Iniciando renderização do relatório...');
        console.log('📊 Dados do impacto:', this.lastImpactData);

        if (!this.lastImpactData) {
            alert('Execute uma simulação primeiro para gerar o relatório!');
            return;
        }

        try {
            console.log('✅ Dados encontrados, gerando relatório...');
            // Gerar relatório
            const reportGenerator = new ImpactReport(this.lastImpactData, ImpactCalculator);
            const report = await reportGenerator.generate();
            console.log('📄 Relatório gerado:', report);

            // Renderizar sumário
            const summaryEl = document.getElementById('report-summary');
            summaryEl.innerHTML = `
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Total de Mortes Estimadas</span>
                        <span class="summary-value critical">${report.summary.totalDeaths.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total de Feridos</span>
                        <span class="summary-value high">${report.summary.totalInjured.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Área Afetada</span>
                        <span class="summary-value medium">${report.summary.totalArea.toLocaleString('pt-BR')} km²</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Magnitude do Evento</span>
                        <span class="summary-value info">${report.summary.eventScale}</span>
                    </div>
                </div>
            `;

            // Renderizar seções
            const contentEl = document.getElementById('report-content');
            contentEl.innerHTML = `
                ${this.renderReportSection('crater', '🕳️ Cratera de Impacto', report.crater)}
                ${this.renderReportSection('fireball', '🔥 Bola de Fogo', report.fireball)}
                ${this.renderReportSection('shockwave', '💥 Onda de Choque', report.shockwave)}
                ${this.renderReportSection('windblast', '💨 Rajada de Vento', report.windblast)}
                ${this.renderReportSection('earthquake', '🌍 Efeito Sísmico', report.earthquake)}
                ${this.renderReportSection('frequency', '📊 Frequência do Evento', report.frequency)}
            `;

            // Mostrar modal
            const modal = document.getElementById('impact-report-modal');
            modal.classList.add('active');

            // Adicionar event listeners para expandir seções
            document.querySelectorAll('.report-section').forEach(section => {
                const header = section.querySelector('.section-header');
                header.addEventListener('click', () => {
                    section.classList.toggle('expanded');
                });
            });

            this.announce('Relatório detalhado de impacto aberto');
            console.log('📊 Relatório detalhado gerado:', report);
        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error);
            alert('Erro ao gerar relatório. Veja o console para detalhes.');
        }
    }

    /**
     * Renderiza uma seção do relatório
     */
    renderReportSection(id, title, data) {
        return `
            <div class="report-section" id="section-${id}">
                <div class="section-header">
                    <div class="section-title">
                        <span class="severity-dot ${data.severity}"></span>
                        <h3>${title}</h3>
                    </div>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="section-content">
                    ${this.renderMetrics(data.metrics)}
                    ${data.comparison ? `
                        <div class="comparison-box">
                            <h4>📏 Comparação</h4>
                            <p>${data.comparison}</p>
                        </div>
                    ` : ''}
                    ${data.casualties ? `
                        <div class="casualties-box">
                            <h4>👥 Estimativa de Vítimas</h4>
                            <div class="casualties-grid">
                                <div class="casualty-item">
                                    <span class="casualty-label">Mortes</span>
                                    <span class="casualty-value deaths">${data.casualties.deaths.toLocaleString('pt-BR')}</span>
                                </div>
                                <div class="casualty-item">
                                    <span class="casualty-label">Feridos</span>
                                    <span class="casualty-value injured">${data.casualties.injured.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    ${data.description ? `
                        <div class="description-box">
                            <p>${data.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Renderiza métricas de uma seção
     */
    renderMetrics(metrics) {
        return metrics.map(metric => `
            <div class="metric-row">
                <span class="metric-label">${metric.label}</span>
                <span class="metric-value">${metric.value}</span>
            </div>
        `).join('');
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

        // Salvar resultados completos para uso no mapa 2D E relatório detalhado
        this.viewer.lastSimulationResults = {
            energy: energyMT,
            crater: craterDiameter,
            seismic: seismicMag,
            blast: blastRadius,
            thermal: thermalRadius
        };

        // Salvar dados completos do impacto para o relatório detalhado
        this.lastImpactData = {
            asteroid: {
                diameter: diameterM,
                density: densityKgM3,
                velocity: velocityKmS,
                angle: angleDegs,
                mass: mass
            },
            location: this.viewer.selectedLocation,
            energy: kineticEnergy,
            energyMT: energyMT,
            results: {
                craterDiameter: craterDiameter,
                seismicMagnitude: seismicMag,
                blastRadius: blastRadius,
                thermalRadius: thermalRadius
            }
        };

        // Atualiza UI
        document.getElementById('energy-value').textContent = energyMT.toFixed(2);
        document.getElementById('crater-value').textContent = craterDiameter.toFixed(2);
        document.getElementById('seismic-value').textContent = seismicMag.toFixed(1);
        document.getElementById('blast-value').textContent = blastRadius.toFixed(1);
        document.getElementById('thermal-value').textContent = thermalRadius.toFixed(1);
        document.getElementById('comparison-value').textContent = comparison;

        // Visualiza zona de impacto no globo 3D
        this.viewer.addImpactZone(
            this.viewer.selectedLocation.lat,
            this.viewer.selectedLocation.lon,
            blastRadius
        );

        // Se estiver na visão 2D, atualizar mapa
        if (this.viewer.currentView === '2d') {
            this.viewer.mapView.showImpact(
                this.viewer.selectedLocation.lat,
                this.viewer.selectedLocation.lon,
                this.viewer.lastSimulationResults
            );
        }

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
    console.log('🗺️ Mapa 2D disponível');
    console.log('🎯 Sentry disponível em: sentry-watch.html');
});
