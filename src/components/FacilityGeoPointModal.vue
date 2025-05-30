<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Latitude & Longitude") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <form @keyup.enter="saveGeoPoint">
      <ion-item class="ion-margin-bottom">
        <ion-input aria-label="zipcode" :placeholder="translate('Zipcode')" v-model="geoPoint.postalCode" @keydown="validateZipCode($event)" @ionInput="postalCodeUpdate"/>
        <ion-button slot="end" fill="outline" :disabled="!isPostalCodeChanged" @click="generateLatLong">
          {{ translate("Generate") }}
          <ion-icon v-if="!isGeneratingLatLong" slot="end" :icon="colorWandOutline" />
          <ion-spinner v-else data-spinner-size="small"/>
        </ion-button>
      </ion-item>
      <ion-item>
        <ion-input label-placement="floating" type="number" v-model="geoPoint.latitude">
          <div slot="label">{{ translate("Latitude")}}<ion-text color="danger">*</ion-text></div>
        </ion-input>
      </ion-item>
      <ion-item>
        <ion-input label-placement="floating" type="number" v-model="geoPoint.longitude">
          <div slot="label">{{ translate("Longitude")}}<ion-text color="danger">*</ion-text></div>
        </ion-input>  
      </ion-item>
    </form>
  </ion-content>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button @click="saveGeoPoint">
      <ion-icon :icon="saveOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters, useStore } from "vuex";
import { closeOutline, colorWandOutline, saveOutline } from "ionicons/icons";
import { translate } from '@hotwax/dxp-components'
import { showToast } from "@/utils";
import { hasError } from "@/adapter";
import { UtilService } from "@/services/UtilService";
import logger from "@/logger";
import { FacilityService } from '@/services/FacilityService'
import emitter from "@/event-bus";
  
export default defineComponent({
  name: "FacilityGeoPointModal",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  },
  computed: {
    ...mapGetters({
      postalAddress: 'facility/getPostalAddress',
    })
  },
  props: ['facilityId'],
  data() {
    return {
      geoPoint: {} as any,
      isGeneratingLatLong: false,
      isPostalCodeChanged: false
    }
  },
  beforeMount() {
    this.geoPoint = JSON.parse(JSON.stringify(this.postalAddress))
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    },
    postalCodeUpdate() {
      this.isPostalCodeChanged = this.geoPoint.postalCode !== this.postalAddress.postalCode;
    },
    validateZipCode(e: any) {
      if(/[`!@#$%^&*()_+=\\|,.<>?~{};:'"/]/.test(e.key)){
        e.preventDefault();
        return false;
      } 
    },
    async generateLatLong() {
      if(!this.geoPoint.postalCode.trim()) {
        showToast(translate("Please fill in the required Zipcode"))
        return;
      }
      this.isGeneratingLatLong = true
      const postalCode = this.geoPoint.postalCode;
      const query = postalCode.startsWith('0') ? `${postalCode} OR ${postalCode.substring(1)}` : postalCode;
      
      const payload = {
        json: {
          params: {
            q: `postcode: ${query}`
          }
        }
      }

      try {
        const resp = await UtilService.generateLatLong(payload)

        if(!hasError(resp) && resp.data.response.docs.length > 0) {
          const result = resp.data.response.docs[0]
          this.geoPoint.latitude = result.latitude
          this.geoPoint.longitude = result.longitude
        } else {
          throw resp.data
        }
      } catch(err) {
        showToast(translate("Unable to find the latitude and longitude for the entered zip code."))
        logger.error('Unable to find the latitude and longitude for the entered zip code.', err)
      }
      this.isGeneratingLatLong = false
    },
    async saveGeoPoint() {
      if(!this.geoPoint.latitude || !this.geoPoint.longitude) {
        showToast("Please fill all the required fields")
        return;
      }
      // Convert latitude and longitude to numeric form
      this.geoPoint.latitude = parseFloat(this.geoPoint.latitude);
      this.geoPoint.longitude = parseFloat(this.geoPoint.longitude);

      emitter.emit('presentLoader')

      let resp, geoPoints = '';

      try {
        // passing old postalCode from here, as we don't allow user to update postalCode from this modal,
        // and the user can only update the latLon from here
        resp = await FacilityService.updateFacilityPostalAddress({...this.geoPoint, postalCode: this.postalAddress.postalCode, facilityId: this.facilityId})

        if(!hasError(resp)) {
          geoPoints = this.geoPoint
          showToast(translate("Facility latitude and longitude updated successfully."))
          await this.store.dispatch('facility/fetchFacilityContactDetailsAndTelecom', { facilityId: this.facilityId })
        } else {
          throw resp.data
        }
      } catch(err) {
        showToast(translate("Failed to update facility latitude and longitude."))
        logger.error(err)
      }
      modalController.dismiss({ geoPoints })
      emitter.emit('dismissLoader')
    }
  },
  setup() {
    const store = useStore()

    return {
      closeOutline,
      colorWandOutline,
      saveOutline,
      store,
      translate
    };
  },
});
</script>

<style scoped>
[data-spinner-size="small"] {
  transform: scale(0.5);
}
</style>