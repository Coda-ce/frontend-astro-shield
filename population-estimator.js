/**
 * AstroShield - Population Estimator
 *
 * Sistema de estimativa de população afetada por zona de impacto
 * Baseado em dados de densidade populacional e localização geográfica
 */

export class PopulationEstimator {
    constructor(impactLocation) {
        this.lat = impactLocation.lat;
        this.lng = impactLocation.lon;

        // Database de cidades principais mundiais (top 100)
        this.majorCities = [
            { name: 'Tóquio', lat: 35.6762, lng: 139.6503, population: 37400068 },
            { name: 'Delhi', lat: 28.7041, lng: 77.1025, population: 28514000 },
            { name: 'Xangai', lat: 31.2304, lng: 121.4737, population: 25582000 },
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 21650000 },
            { name: 'Cidade do México', lat: 19.4326, lng: -99.1332, population: 21581000 },
            { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: 20076000 },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 19980000 },
            { name: 'Pequim', lat: 39.9042, lng: 116.4074, population: 19618000 },
            { name: 'Dhaka', lat: 23.8103, lng: 90.4125, population: 19578000 },
            { name: 'Osaka', lat: 34.6937, lng: 135.5023, population: 19281000 },
            { name: 'Nova York', lat: 40.7128, lng: -74.0060, population: 18819000 },
            { name: 'Karachi', lat: 24.8607, lng: 67.0011, population: 15400000 },
            { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, population: 14967000 },
            { name: 'Chongqing', lat: 29.4316, lng: 106.9123, population: 14838000 },
            { name: 'Istambul', lat: 41.0082, lng: 28.9784, population: 14751000 },
            { name: 'Calcutá', lat: 22.5726, lng: 88.3639, population: 14681000 },
            { name: 'Manila', lat: 14.5995, lng: 120.9842, population: 13482000 },
            { name: 'Lagos', lat: 6.5244, lng: 3.3792, population: 13463000 },
            { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 13293000 },
            { name: 'Tianjin', lat: 39.3434, lng: 117.3616, population: 13215000 },
            { name: 'Kinshasa', lat: -4.4419, lng: 15.2663, population: 13171000 },
            { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, population: 12638000 },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 12458000 },
            { name: 'Moscou', lat: 55.7558, lng: 37.6173, population: 12410000 },
            { name: 'Shenzhen', lat: 22.5431, lng: 114.0579, population: 11908000 },
            { name: 'Lahore', lat: 31.5204, lng: 74.3587, population: 11126000 },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946, population: 11440000 },
            { name: 'Paris', lat: 48.8566, lng: 2.3522, population: 10901000 },
            { name: 'Bogotá', lat: 4.7110, lng: -74.0721, population: 10574000 },
            { name: 'Jakarta', lat: -6.2088, lng: 106.8456, population: 10517000 },
            { name: 'Chennai', lat: 13.0827, lng: 80.2707, population: 10456000 },
            { name: 'Lima', lat: -12.0464, lng: -77.0428, population: 10391000 },
            { name: 'Bangkok', lat: 13.7563, lng: 100.5018, population: 10156000 },
            { name: 'Londres', lat: 51.5074, lng: -0.1278, population: 9046000 },
            { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, population: 9746000 },
            { name: 'Teerã', lat: 35.6892, lng: 51.3890, population: 8896000 },
            { name: 'Chicago', lat: 41.8781, lng: -87.6298, population: 8864000 },
            { name: 'Chengdu', lat: 30.5728, lng: 104.0668, population: 8813000 },
            { name: 'Nanjing', lat: 32.0603, lng: 118.7969, population: 8245000 },
            { name: 'Wuhan', lat: 30.5928, lng: 114.3055, population: 8176000 },
            { name: 'Ho Chi Minh', lat: 10.8231, lng: 106.6297, population: 8145000 },
            { name: 'Luanda', lat: -8.8383, lng: 13.2344, population: 7774000 },
            { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, population: 7681000 },
            { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, population: 7429000 },
            { name: 'Hangzhou', lat: 30.2741, lng: 120.1551, population: 7236000 },
            { name: 'Madrid', lat: 40.4168, lng: -3.7038, population: 6497000 },
            { name: 'Toronto', lat: 43.6532, lng: -79.3832, population: 6082000 },
            { name: 'Barcelona', lat: 41.3851, lng: 2.1734, population: 5494000 },
            { name: 'Miami', lat: 25.7617, lng: -80.1918, population: 6066000 },
            { name: 'Filadélfia', lat: 39.9526, lng: -75.1652, population: 5695000 }
        ];

        // Densidade populacional por tipo de área (pessoas/km²)
        this.densities = {
            megacity: 15000,      // Megacidades
            major_city: 8000,     // Grandes cidades
            city: 3000,           // Cidades médias
            suburban: 1000,       // Subúrbios
            rural: 50,            // Rural
            remote: 5,            // Remoto
            ocean: 0              // Oceano
        };
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
     * Determina tipo de área baseado na localização
     */
    getAreaType() {
        // Verificar se está próximo de uma grande cidade
        for (const city of this.majorCities) {
            const distance = this.calculateDistance(
                this.lat, this.lng,
                city.lat, city.lng
            );

            if (distance < 50) {
                if (city.population > 10000000) return 'megacity';
                if (city.population > 5000000) return 'major_city';
                return 'city';
            }
        }

        // Verificar se está no oceano (simplificado)
        const isOcean = this.isOceanLocation(this.lat, this.lng);
        if (isOcean) return 'ocean';

        // Baseado em latitude (simplificado)
        const absLat = Math.abs(this.lat);
        if (absLat > 60) return 'remote';  // Polar
        if (absLat > 45) return 'rural';   // Temperado

        return 'suburban';
    }

    /**
     * Verifica se localização é no oceano (simplificado)
     */
    isOceanLocation(lat, lng) {
        // Oceano Pacífico
        if (lng > 140 || lng < -80) {
            if (Math.abs(lat) < 60) return true;
        }

        // Oceano Atlântico
        if (lng > -80 && lng < -10) {
            if (lat < 10 && lat > -60) return true;
        }

        // Oceano Índico
        if (lng > 40 && lng < 120) {
            if (lat < 10 && lat > -60) return true;
        }

        return false;
    }

    /**
     * Estima população dentro de um raio em km
     */
    estimatePopulationInRadius(radiusKm) {
        let totalPopulation = 0;

        // Verificar cidades dentro do raio
        for (const city of this.majorCities) {
            const distance = this.calculateDistance(
                this.lat, this.lng,
                city.lat, city.lng
            );

            if (distance <= radiusKm) {
                // Proporção da cidade afetada
                const cityRadius = Math.sqrt(city.population / (Math.PI * this.densities.megacity));
                const overlap = this.calculateOverlap(distance, radiusKm, cityRadius);
                totalPopulation += city.population * overlap;
            }
        }

        // Adicionar população de área não coberta por cidades
        const areaType = this.getAreaType();
        const density = this.densities[areaType];
        const area = Math.PI * radiusKm * radiusKm;
        const backgroundPopulation = area * density * 0.3; // 30% da densidade base

        totalPopulation += backgroundPopulation;

        return Math.round(totalPopulation);
    }

    /**
     * Calcula sobreposição entre dois círculos
     */
    calculateOverlap(distance, radius1, radius2) {
        if (distance >= radius1 + radius2) return 0;
        if (distance <= Math.abs(radius1 - radius2)) return 1;

        // Fórmula de interseção de círculos
        const r1Sq = radius1 * radius1;
        const r2Sq = radius2 * radius2;
        const dSq = distance * distance;

        const overlap = (r1Sq + r2Sq - dSq) / (2 * radius1 * radius2);
        return Math.max(0, Math.min(1, overlap));
    }

    /**
     * Calcula vítimas por zona de impacto
     */
    calculateCasualtiesByZone(zones) {
        const casualties = {};

        for (const [zoneName, zoneData] of Object.entries(zones)) {
            const population = this.estimatePopulationInRadius(zoneData.radius);
            const mortalityRate = zoneData.mortalityRate || 1.0; // 100% por padrão

            casualties[zoneName] = {
                population: population,
                deaths: Math.round(population * mortalityRate),
                injured: Math.round(population * (1 - mortalityRate) * 0.8),
                radius: zoneData.radius
            };
        }

        return casualties;
    }

    /**
     * Retorna cidades afetadas dentro de um raio
     */
    getAffectedCities(radiusKm) {
        const affected = [];

        for (const city of this.majorCities) {
            const distance = this.calculateDistance(
                this.lat, this.lng,
                city.lat, city.lng
            );

            if (distance <= radiusKm) {
                affected.push({
                    ...city,
                    distance: distance,
                    severity: this.getSeverity(distance, radiusKm)
                });
            }
        }

        return affected.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Determina severidade do impacto em uma cidade
     */
    getSeverity(distance, maxRadius) {
        const ratio = distance / maxRadius;
        if (ratio < 0.2) return 'total';
        if (ratio < 0.4) return 'catastrophic';
        if (ratio < 0.6) return 'severe';
        if (ratio < 0.8) return 'moderate';
        return 'light';
    }
}
