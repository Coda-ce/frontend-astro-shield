/**
 * AstroShield - Impact Report Generator
 *
 * Gera relatórios detalhados de impacto com estimativas de vítimas,
 * danos estruturais e comparações científicas
 */

import { PopulationEstimator } from './population-estimator.js';

export class ImpactReport {
    constructor(impactData, impactCalculator) {
        this.data = impactData;
        this.calculator = impactCalculator;
        this.popEstimator = new PopulationEstimator({
            lat: impactData.location.lat,
            lon: impactData.location.lon
        });
    }

    /**
     * Gera relatório completo
     */
    async generate() {
        const energyMT = this.data.energyMT;

        return {
            crater: this.generateCraterSection(energyMT),
            fireball: this.generateFireballSection(energyMT),
            shockwave: this.generateShockwaveSection(energyMT),
            windblast: this.generateWindBlastSection(energyMT),
            earthquake: this.generateEarthquakeSection(),
            frequency: this.generateFrequencySection(energyMT),
            summary: this.generateSummary()
        };
    }

    /**
     * Seção de Cratera
     */
    generateCraterSection(energyMT) {
        const diameter = this.data.results.craterDiameter;
        const depth = this.calculator.calculateCraterDepth(diameter);
        const vaporizedPop = this.popEstimator.estimatePopulationInRadius(diameter / 2);

        return {
            severity: 'critical',
            metrics: [
                {
                    label: 'Diâmetro da cratera',
                    value: `${diameter.toFixed(2)} km`
                },
                {
                    label: 'Profundidade',
                    value: `${depth.toFixed(0)} m`
                },
                {
                    label: 'Velocidade de impacto',
                    value: `${this.data.asteroid.velocity.toFixed(1)} km/s`
                },
                {
                    label: 'Energia liberada',
                    value: `${energyMT.toFixed(2)} Megatons TNT`
                },
                {
                    label: 'População vaporizada',
                    value: vaporizedPop.toLocaleString('pt-BR')
                }
            ],
            comparison: this.getEnergyComparisonText(energyMT),
            casualties: {
                deaths: Math.round(vaporizedPop),
                injured: 0
            }
        };
    }

    /**
     * Seção de Bola de Fogo
     */
    generateFireballSection(energyMT) {
        const fireballDiameter = this.calculator.calculateFireballDiameter(energyMT);
        const thermalRadius = this.data.results.thermalRadius;
        const burns2ndRadius = this.calculator.calculate2ndDegreeBurnsRadius(energyMT);
        const clothesRadius = this.calculator.calculateClothesIgnitionRadius(energyMT);
        const treeRadius = this.calculator.calculateTreeIgnitionRadius(energyMT);

        // Estimativas de população
        const totalDeaths = this.popEstimator.estimatePopulationInRadius(thermalRadius);
        const burns3rd = this.popEstimator.estimatePopulationInRadius(thermalRadius) -
                        this.popEstimator.estimatePopulationInRadius(thermalRadius * 0.7);
        const burns2nd = this.popEstimator.estimatePopulationInRadius(burns2ndRadius) -
                        this.popEstimator.estimatePopulationInRadius(thermalRadius);

        return {
            severity: 'high',
            metrics: [
                {
                    label: 'Diâmetro da bola de fogo',
                    value: `${fireballDiameter.toFixed(1)} km`
                },
                {
                    label: 'Mortes por radiação térmica',
                    value: totalDeaths.toLocaleString('pt-BR')
                },
                {
                    label: 'Queimaduras de 3º grau',
                    value: `${burns3rd.toLocaleString('pt-BR')} pessoas`
                },
                {
                    label: 'Queimaduras de 2º grau',
                    value: `${burns2nd.toLocaleString('pt-BR')} pessoas`
                },
                {
                    label: 'Raio de ignição de roupas',
                    value: `${clothesRadius.toFixed(1)} km`
                },
                {
                    label: 'Raio de ignição de árvores',
                    value: `${treeRadius.toFixed(1)} km`
                }
            ],
            comparison: 'A radiação térmica causa queimaduras graves mesmo a grandes distâncias',
            casualties: {
                deaths: Math.round(totalDeaths),
                injured: Math.round(burns2nd + burns3rd)
            }
        };
    }

    /**
     * Seção de Onda de Choque
     */
    generateShockwaveSection(energyMT) {
        const decibels = this.calculator.calculateShockwaveDecibels(energyMT);
        const lungRadius = this.calculator.calculateLungDamageRadius(energyMT);
        const eardrumRadius = this.calculator.calculateEardrumRuptureRadius(energyMT);
        const buildingRadius = this.calculator.calculateBuildingCollapseRadius(energyMT);
        const homeRadius = this.calculator.calculateHomeCollapseRadius(energyMT);

        const totalDeaths = this.popEstimator.estimatePopulationInRadius(buildingRadius);

        return {
            severity: 'high',
            metrics: [
                {
                    label: 'Intensidade sonora',
                    value: `${decibels.toFixed(0)} dB`
                },
                {
                    label: 'Mortes por sobrepressão',
                    value: totalDeaths.toLocaleString('pt-BR')
                },
                {
                    label: 'Raio de danos pulmonares',
                    value: `${lungRadius.toFixed(1)} km`
                },
                {
                    label: 'Raio de tímpanos rompidos',
                    value: `${eardrumRadius.toFixed(1)} km`
                },
                {
                    label: 'Raio de colapso de edifícios',
                    value: `${buildingRadius.toFixed(1)} km`
                },
                {
                    label: 'Raio de colapso de casas',
                    value: `${homeRadius.toFixed(1)} km`
                }
            ],
            comparison: 'A onda de choque viaja mais rápido que o som',
            casualties: {
                deaths: Math.round(totalDeaths),
                injured: Math.round(this.popEstimator.estimatePopulationInRadius(eardrumRadius) * 0.5)
            }
        };
    }

    /**
     * Seção de Vento de Explosão
     */
    generateWindBlastSection(energyMT) {
        const windSpeed = this.calculator.calculateWindSpeed(energyMT);
        const treeFallRadius = this.calculator.calculateTreeFallRadius(energyMT);
        const homeRadius = this.calculator.calculateHomeCollapseRadius(energyMT);

        const totalDeaths = this.popEstimator.estimatePopulationInRadius(homeRadius * 0.6);

        return {
            severity: 'medium',
            metrics: [
                {
                    label: 'Velocidade máxima',
                    value: `${windSpeed.toFixed(2)} km/s (${(windSpeed * 3600).toFixed(0)} km/h)`
                },
                {
                    label: 'Mortes por vento',
                    value: totalDeaths.toLocaleString('pt-BR')
                },
                {
                    label: 'Raio de destruição total',
                    value: `${(homeRadius * 0.4).toFixed(1)} km`
                },
                {
                    label: 'Zona equivalente a EF5',
                    value: `${(homeRadius * 0.7).toFixed(1)} km`
                },
                {
                    label: 'Raio de árvores derrubadas',
                    value: `${treeFallRadius.toFixed(1)} km`
                }
            ],
            comparison: 'Ventos mais fortes que tornados categoria EF5',
            casualties: {
                deaths: Math.round(totalDeaths),
                injured: Math.round(totalDeaths * 1.5)
            }
        };
    }

    /**
     * Seção de Terremoto
     */
    generateEarthquakeSection() {
        const magnitude = this.data.results.seismicMagnitude;
        const perceptionRadius = this.calculator.calculateEarthquakePerceptionRadius(magnitude);

        const deaths = this.popEstimator.estimatePopulationInRadius(perceptionRadius * 0.1) * 0.05;

        return {
            severity: magnitude > 7 ? 'high' : 'medium',
            metrics: [
                {
                    label: 'Magnitude',
                    value: `${magnitude.toFixed(1)} Richter`
                },
                {
                    label: 'Mortes por terremoto',
                    value: Math.round(deaths).toLocaleString('pt-BR')
                },
                {
                    label: 'Raio de percepção',
                    value: `${perceptionRadius.toFixed(0)} km`
                }
            ],
            comparison: this.getEarthquakeComparison(magnitude),
            description: this.getEarthquakeDescription(magnitude),
            casualties: {
                deaths: Math.round(deaths),
                injured: Math.round(deaths * 3)
            }
        };
    }

    /**
     * Seção de Frequência
     */
    generateFrequencySection(energyMT) {
        const frequency = this.calculator.calculateFrequency(energyMT);

        return {
            severity: 'info',
            metrics: [
                {
                    label: 'Frequência estimada',
                    value: frequency
                }
            ],
            comparison: 'Impactos desta magnitude são raros mas inevitáveis na escala geológica',
            description: 'Baseado em estatísticas de NEO (Near-Earth Objects)'
        };
    }

    /**
     * Gera resumo executivo
     */
    generateSummary() {
        const totalDeaths =
            (this.popEstimator.estimatePopulationInRadius(this.data.results.craterDiameter / 2)) +
            (this.popEstimator.estimatePopulationInRadius(this.data.results.thermalRadius) * 0.8) +
            (this.popEstimator.estimatePopulationInRadius(this.data.results.blastRadius) * 0.6);

        const totalInjured = totalDeaths * 2.5;
        const totalArea = Math.PI * Math.pow(this.data.results.blastRadius, 2);

        return {
            totalDeaths: Math.round(totalDeaths),
            totalInjured: Math.round(totalInjured),
            totalArea: totalArea,
            eventScale: this.calculator.getEnergyComparison(this.data.energyMT)
        };
    }

    /**
     * Textos de comparação de energia
     */
    getEnergyComparisonText(energyMT) {
        if (energyMT < 1) {
            return 'Energia equivalente a um pequeno meteoro';
        } else if (energyMT < 100) {
            return 'Mais energia que dezenas de bombas atômicas combinadas';
        } else if (energyMT < 1000) {
            return 'Energia comparável a grandes erupções vulcânicas';
        } else {
            return 'Energia suficiente para alterar o clima global por anos';
        }
    }

    /**
     * Descrição de terremoto
     */
    getEarthquakeDescription(magnitude) {
        if (magnitude < 4) return 'Leve - Raramente sentido';
        if (magnitude < 5) return 'Moderado - Danos mínimos';
        if (magnitude < 6) return 'Forte - Danos em estruturas';
        if (magnitude < 7) return 'Maior - Danos sérios';
        if (magnitude < 8) return 'Grande - Destruição extensa';
        return 'Massivo - Devastação regional';
    }

    /**
     * Comparação de terremoto
     */
    getEarthquakeComparison(magnitude) {
        if (magnitude >= 9) {
            return 'Comparável aos maiores terremotos já registrados (Japão 2011, Chile 1960)';
        } else if (magnitude >= 8) {
            return 'Comparável ao terremoto de São Francisco (1906) ou Nepal (2015)';
        } else if (magnitude >= 7) {
            return 'Comparável ao terremoto do Haiti (2010)';
        } else {
            return 'Terremoto moderado, sentido em área ampla';
        }
    }
}
