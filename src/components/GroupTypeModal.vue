<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()"> 
          <ion-icon :icon="closeOutline" slot="icon-only" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Group type") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <form @keyup.enter="saveGroupType()"  class="ion-margin-top">
      <!-- Empty state -->
      <div class="empty-state" v-if="!facilityGroupTypes.length">
        <p>{{ translate("No group types found")}}</p>
      </div>

      <div v-else>
        <ion-radio-group v-model="facilityGroupValue.facilityGroupTypeId">
          <ion-item :key="groupType.facilityGroupTypeId" v-for="groupType in facilityGroupTypes">
            <ion-radio :value="groupType.facilityGroupTypeId">
              <ion-label>
                {{ groupType.description ? groupType.description : groupType.facilityGroupTypeId }}
                <p>{{ groupType.facilityGroupTypeId }}</p>
              </ion-label>
            </ion-radio>
          </ion-item>
        </ion-radio-group>
      </div>
    </form>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!isGroupTypeUpdated()" @click="saveGroupType()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import { 
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from "@hotwax/dxp-components";
import { mapGetters, useStore } from "vuex";
import { FacilityService } from "@/services/FacilityService";
import { hasError } from "@/adapter";
import logger from "@/logger";
import { showToast } from "@/utils";

export default defineComponent({
  name: "GroupTypeModal",
  components: { 
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonTitle,
    IonToolbar 
  },
  data() {
    return {
      facilityGroupValue: JSON.parse(JSON.stringify(this.facilityGroup))
    }
  },
  props: ["facilityGroup"],
  computed: {
    ...mapGetters({
      facilityGroupTypes: "util/getFacilityGroupTypes",
      groups: "facility/getFacilityGroups",
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    },
    async saveGroupType() {
      try {
        const resp = await FacilityService.updateFacilityGroup({
          facilityGroupId: this.facilityGroupValue.facilityGroupId,
          facilityGroupTypeId: this.facilityGroupValue.facilityGroupTypeId
        })

        if(!hasError(resp)) {
          showToast(translate("Facility group type updated successfully."))
          const currentGroup = this.groups.find((group: any) => group.facilityGroupId === this.facilityGroupValue.facilityGroupId)
          currentGroup.facilityGroupTypeId = this.facilityGroupValue.facilityGroupTypeId

          await this.store.dispatch('facility/updateFacilityGroups', this.groups)
          modalController.dismiss()
        } else {
          throw resp.data;
        }
      } catch(err) {
        showToast(translate("Failed to update facility group type."))
        logger.error(err)
      }
    },
    isGroupTypeUpdated() {
      return this.facilityGroup.facilityGroupTypeId !== this.facilityGroupValue.facilityGroupTypeId
    }
  },
  setup() {
    const store = useStore();
    return {
      closeOutline,
      saveOutline,
      translate,
      store
    };
  }
});
</script>

<style scoped>
ion-content {
  --padding-bottom: 80px;
}
</style>