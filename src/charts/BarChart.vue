<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip
} from 'chart.js'
import { computed, defineProps } from 'vue'
import ionicChartPlugin from './ionicChartPlugin'
import { translate } from '@hotwax/dxp-components'

ChartJS.register(ionicChartPlugin, CategoryScale, LinearScale, BarElement, Title, Tooltip)

const props = defineProps({
  labels: {
    type: Array as () => string[],
    required: true
  },
  data: {
    type: Array as () => number[],
    required: true
  },
  title: {
    type: String,
    default: 'Chart'
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: translate('Orders'),
      data: props.data,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: props.title
    },
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  padding: 16px;
  overflow-x: auto;
  overflow-y: hidden;
}

.chart-container {
  height: 100%;
  min-width: min-content;
  width: auto;
}
</style>