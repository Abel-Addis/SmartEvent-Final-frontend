<script>
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export default {
    name: 'BarChart',
    components: { Bar },
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
                            display: false
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
    <Bar :data="chartData" :options="chartOptions" />
</template>
