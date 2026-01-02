<script>
import { Doughnut } from 'vue-chartjs'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
)

export default {
    name: 'DoughnutChart',
    components: { Doughnut },
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
            // Get CSS variable values for theme colors
            const getColor = (varName) => {
                if (typeof window !== 'undefined') {
                    const root = document.documentElement
                    const value = getComputedStyle(root).getPropertyValue(varName).trim()
                    return `hsl(${value})`
                }
                return '#000'
            }

            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: getColor('--foreground'),
                            font: {
                                size: 12
                            },
                            padding: 15
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
                ...this.options
            }
        }
    }
}
</script>

<template>
    <Doughnut :data="chartData" :options="chartOptions" />
</template>
