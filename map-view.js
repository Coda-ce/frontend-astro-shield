/**
 * AstroShield - Leaflet Map View
 *
 * Visualização 2D de impacto de asteroides usando Leaflet.js
 * Mostra zonas de destruição concêntricas e cidades afetadas
 */

export class MapView {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.impactMarker = null;
        this.impactCircles = [];
        this.cityMarkers = [];
        this.initialized = false;

        // Dados de cidades principais para mostrar população afetada
        this.majorCities = [
            { name: 'Nova York', lat: 40.7128, lng: -74.0060, population: 8336817 },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 3979576 },
            { name: 'Chicago', lat: 41.8781, lng: -87.6298, population: 2693976 },
            { name: 'Miami', lat: 25.7617, lng: -80.1918, population: 467963 },
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 12325232 },
            { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6748000 },
            { name: 'Brasília', lat: -15.8267, lng: -47.9218, population: 3055149 },
            { name: 'Londres', lat: 51.5074, lng: -0.1278, population: 9002488 },
            { name: 'Paris', lat: 48.8566, lng: 2.3522, population: 2161000 },
            { name: 'Berlim', lat: 52.5200, lng: 13.4050, population: 3769495 },
            { name: 'Tóquio', lat: 35.6762, lng: 139.6503, population: 13960000 },
            { name: 'Pequim', lat: 39.9042, lng: 116.4074, population: 21540000 },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 12442373 },
            { name: 'Sydney', lat: -33.8688, lng: 151.2093, population: 5312163 },
            { name: 'Cidade do México', lat: 19.4326, lng: -99.1332, population: 9209944 },
            { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, population: 3075646 },
            { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: 20900604 },
            { name: 'Istambul', lat: 41.0082, lng: 28.9784, population: 15462452 },
            { name: 'Moscou', lat: 55.7558, lng: 37.6173, population: 12506468 },
            { name: 'Lagos', lat: 6.5244, lng: 3.3792, population: 14862111 }
        ];
    }

    /**
     * Inicializa o mapa Leaflet
     */
    initializeMap() {
        if (this.initialized) return;

        // Criar mapa centrado no mundo
        this.map = L.map(this.containerId, {
            center: [20, 0],
            zoom: 3,
            minZoom: 2,
            maxZoom: 18,
            worldCopyJump: true
        });

        // Adicionar camada de mapa (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        this.initialized = true;
        console.log('Leaflet map initialized');
    }

    /**
     * Mostra o impacto no mapa com zonas de destruição
     * @param {number} lat - Latitude do impacto
     * @param {number} lng - Longitude do impacto
     * @param {Object} results - Resultados da simulação (crater, blast, thermal, etc)
     */
    showImpact(lat, lng, results) {
        if (!this.initialized) {
            this.initializeMap();
        }

        // Limpar marcadores e círculos anteriores
        this.clearImpact();

        // Centrar mapa no local de impacto
        this.map.setView([lat, lng], 8);

        // Adicionar marcador de impacto
        this.impactMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'impact-marker',
                html: '💥',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);

        this.impactMarker.bindPopup(`
            <div style="text-align: center; min-width: 150px;">
                <strong style="color: #ff1744;">🎯 Ponto de Impacto</strong><br>
                <small>Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°</small>
            </div>
        `).openPopup();

        // Adicionar zonas de destruição (círculos concêntricos)
        this.addDestructionZones(lat, lng, results);

        // Adicionar marcadores de cidades afetadas
        this.addAffectedCities(lat, lng, results);
    }

    /**
     * Adiciona círculos concêntricos representando zonas de destruição
     */
    addDestructionZones(lat, lng, results) {
        const zones = [
            {
                radius: results.crater * 1000, // converter km para metros
                color: '#8B0000',
                fillColor: '#FF0000',
                fillOpacity: 0.4,
                label: 'Cratera de Impacto',
                description: `Diâmetro: ${results.crater.toFixed(2)} km - Destruição total`
            },
            {
                radius: results.blast * 1000,
                color: '#FF4500',
                fillColor: '#FF6347',
                fillOpacity: 0.3,
                label: 'Zona de Onda de Choque',
                description: `Raio: ${results.blast.toFixed(2)} km - Sobrepressão de 20 PSI, colapso de edifícios`
            },
            {
                radius: results.thermal * 1000,
                color: '#FFA500',
                fillColor: '#FFD700',
                fillOpacity: 0.2,
                label: 'Zona Térmica',
                description: `Raio: ${results.thermal.toFixed(2)} km - Queimaduras de 3º grau`
            },
            {
                radius: this.calculateSeismicRadius(results.seismic) * 1000,
                color: '#FFD700',
                fillColor: '#FFFF00',
                fillOpacity: 0.1,
                label: 'Zona Sísmica',
                description: `Raio: ${this.calculateSeismicRadius(results.seismic).toFixed(2)} km - Terremoto ${results.seismic.toFixed(1)} Richter`
            }
        ];

        // Criar círculos do maior para o menor
        zones.reverse().forEach(zone => {
            const circle = L.circle([lat, lng], {
                radius: zone.radius,
                color: zone.color,
                fillColor: zone.fillColor,
                fillOpacity: zone.fillOpacity,
                weight: 2
            }).addTo(this.map);

            circle.bindPopup(`
                <div style="min-width: 200px;">
                    <strong style="color: ${zone.color};">${zone.label}</strong><br>
                    <small>${zone.description}</small>
                </div>
            `);

            this.impactCircles.push(circle);
        });

        // Ajustar zoom para mostrar a maior zona
        const maxRadius = Math.max(...zones.map(z => z.radius));
        const bounds = L.latLng(lat, lng).toBounds(maxRadius * 2.5);
        this.map.fitBounds(bounds);
    }

    /**
     * Calcula raio aproximado de efeitos sísmicos baseado na magnitude
     */
    calculateSeismicRadius(magnitude) {
        // Fórmula empírica: raio em km baseado na magnitude Richter
        // Magnitude 5: ~50km, Magnitude 7: ~500km, Magnitude 9: ~5000km
        return Math.pow(10, magnitude - 3);
    }

    /**
     * Adiciona marcadores de cidades afetadas
     */
    addAffectedCities(impactLat, impactLng, results) {
        const maxRadius = results.thermal; // km

        this.majorCities.forEach(city => {
            const distance = this.calculateDistance(
                impactLat, impactLng,
                city.lat, city.lng
            );

            // Mostrar apenas cidades dentro da zona térmica
            if (distance <= maxRadius) {
                const severity = this.getSeverityLevel(distance, results);
                const marker = L.marker([city.lat, city.lng], {
                    icon: L.divIcon({
                        className: 'city-marker',
                        html: `<div style="background: ${severity.color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap;">${city.name}</div>`,
                        iconSize: [80, 20],
                        iconAnchor: [40, 10]
                    })
                }).addTo(this.map);

                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <strong>${city.name}</strong><br>
                        <strong style="color: ${severity.color};">Nível: ${severity.label}</strong><br>
                        <small>População: ${city.population.toLocaleString('pt-BR')}</small><br>
                        <small>Distância do impacto: ${distance.toFixed(2)} km</small><br>
                        <small>${severity.description}</small>
                    </div>
                `);

                this.cityMarkers.push(marker);
            }
        });
    }

    /**
     * Calcula distância entre dois pontos geográficos (Haversine)
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Determina nível de severidade baseado na distância
     */
    getSeverityLevel(distance, results) {
        if (distance <= results.crater) {
            return {
                label: 'DESTRUIÇÃO TOTAL',
                color: '#8B0000',
                description: 'Vaporização completa, cratera de impacto'
            };
        } else if (distance <= results.blast) {
            return {
                label: 'CATASTRÓFICO',
                color: '#FF0000',
                description: 'Colapso total de estruturas, mortalidade 100%'
            };
        } else if (distance <= results.blast * 1.5) {
            return {
                label: 'SEVERO',
                color: '#FF4500',
                description: 'Danos estruturais graves, incêndios massivos'
            };
        } else if (distance <= results.thermal) {
            return {
                label: 'MODERADO',
                color: '#FF8C00',
                description: 'Queimaduras graves, danos a edifícios'
            };
        } else {
            return {
                label: 'LEVE',
                color: '#FFD700',
                description: 'Janelas quebradas, ferimentos leves'
            };
        }
    }

    /**
     * Limpa todos os marcadores e círculos do mapa
     */
    clearImpact() {
        if (this.impactMarker) {
            this.map.removeLayer(this.impactMarker);
            this.impactMarker = null;
        }

        this.impactCircles.forEach(circle => {
            this.map.removeLayer(circle);
        });
        this.impactCircles = [];

        this.cityMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.cityMarkers = [];
    }

    /**
     * Redimensiona o mapa (necessário ao alternar entre views)
     */
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }

    /**
     * Destrói o mapa e limpa recursos
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.initialized = false;
        }
    }
}
