import { Chart } from 'chart.js';

const ionicChartPlugin = {
  id: 'ionicStyles',
  beforeInit: function() {
    const style = window.getComputedStyle(document.body);

    // Get Ionic CSS variables
    const fontFamily = style.getPropertyValue('--ion-font-family') || 'Roboto, "Helvetica Neue", sans-serif';
    const fontSize = style.getPropertyValue('--ion-font-size-base') || '14px';
    const textColor = style.getPropertyValue('--ion-text-color') || '#000000';

    // Set global Chart.js defaults
    Chart.defaults.font.family = fontFamily;
    Chart.defaults.font.size = parseInt(fontSize);
    Chart.defaults.color = textColor;
  }
};

export default ionicChartPlugin;