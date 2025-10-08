<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Consumed Order Limit") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <BarChart v-if="facilityOrderCounts.length && !isLoading" :labels="chartData.labels" :data="chartData.data" :title="translate('Daily Consumed Orders')" />
    
    <div v-else class="empty-state">
      {{ translate('No records found') }}
    </div>
  </ion-content>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { closeOutline } from "ionicons/icons";
import { translate } from '@hotwax/dxp-components'
import { FacilityService } from "@/services/FacilityService";
import BarChart from '@/charts/BarChart.vue';

export default defineComponent({
  name: "ViewFacilityOrderCountModal",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    BarChart
  },
  props: ["facilityId"],
  data() {
    return {
      facilityOrderCounts: [] as Array<any>,
      isLoading: true
    }
  },
  async mounted() {
    this.facilityOrderCounts = await FacilityService.fetchFacilityOrderCounts(this.facilityId)
    this.isLoading = false;
  },
  computed: {
    chartData() {
      return {
        labels: this.facilityOrderCounts.map(item => item.entryDate),
        data: this.facilityOrderCounts.map(item => item.lastOrderCount)
      }
    }
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    }
  },
  setup() {
    return {
      closeOutline,
      translate
    };
  },
});
</script>