<script>
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default {
    name: 'LineChart',
    components: { Line },
    props: {
        chartData: {
            type: Object,
            required: true
        },
        options: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        chartOptions() {
            // Get computed CSS color values
            const getColor = (varName) => {
                const root = document.documentElement
                const value = getComputedStyle(root).getPropertyValue(varName).trim()
                return value ? `hsl(${value})` : '#888'
            }

            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: getColor('--foreground'),
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getColor('--popover'),
                        titleColor: getColor('--popover-foreground'),
                        bodyColor: getColor('--popover-foreground'),
                        borderColor: getColor('--border'),
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: getColor('--border'),
                            drawBorder: false
                        },
                        ticks: {
                            color: getColor('--muted-foreground')
                        }
                    },
                    y: {
                        grid: {
                            color: getColor('--border'),
                            drawBorder: false
                        },
                        ticks: {
                            color: getColor('--muted-foreground')
                        }
                    }
                },
                ...this.options
            }
        }
    }
}
</script>

<template>
    <Line :data="chartData" :options="chartOptions" />
</template>
