<template>
  <div id="form-component">
    <div id="form-head">
      <div
        v-if="parent"
        class="base-row-parent base-row-header"
        @click="returnToParent(parent.id)">
        <base-menu-entry
          id="parentheader"
          :title="parent.title"
          :title-bold="true"
          :subtext="parent.type"
          icon="sheet-empty"/>
      </div>
      <div class="base-row">
        <div class="base-row-header">
          <base-menu-entry
            :id="'asingleentry'"
            :icon="'sheet-empty'"
            :title="valueList.title"
            :title-bold="true"
            :is-activatable="false"
            :subtext="formType" />
        </div>
        <div
          id="form-back-button"
          :class="['form-button', 'mobile-elements', { 'form-button-child' : parent }]">
          <base-button
            v-if="!unsavedChanges"
            text="Zurück"
            icon-size="small"
            icon="arrow-left"
            button-style="row"
            class="form-button-inner"
            @clicked="$store.commit('data/setNewForm' ,false)"/>
          <base-button
            v-else
            text="Abbrechen"
            icon-size="small"
            button-style="row"
            class="form-button-inner"
            @clicked="$store.commit('data/setNewForm' ,false)"/>
        </div>
        <div
          id="form-save-button"
          class="form-button">
          <base-button
            :active="unsavedChanges"
            text="Save"
            icon-size="small"
            icon="save-file"
            button-style="row"
            class="form-button-inner"
            @clicked="saveForm"/>
        </div>

      </div>
      <div class="form-options">
        <div class="options-button-row mobile-elements">
          <base-button
            :text="'Optionen'"
            :icon="'remove'"
            :hide-icon="!showFormMenu"
            icon-position="right"
            class="options"
            @clicked="showFormMenu = !showFormMenu"/>
        </div>
        <transition name="slide-fade2">
          <div
            v-if="showFormMenu"
            class="options-row flex-align-right" >
            <base-button
              :text="valueList.published ? 'Aus Showroom entfernen' : 'In Showroom veröffentlichen'"
              icon-size="large"
              icon="eye"
              button-style="single"
              @clicked="actionEntry(valueList.published)"/>
            <base-button
              :disabled="true"
              text="Bearbeitung ermöglichen"
              icon-size="large"
              icon="people"
              button-style="single" />
            <base-button
              text="Publikation löschen"
              icon-size="large"
              icon="waste-bin"
              button-style="single"
              @clicked="confirmDelete"/>
          </div>
        </transition>
      </div>
    </div>

    <!-- FORM -->
    <base-form
      :list="formList"
      :form-values="valueList"
      class="form"
      @selected="changed"/>
    <transition-group
      name="slide-fade2">
      <div
        v-if="formType || extend"
        key="extended-section"
        class="subsection">
        <div
          key="extended-title"
          class="subtitle">Weitere Angaben</div>

        <!-- FORM EXTENSION -->
        <base-form
          key="extended-form"
          :list="formExtended"
          :form-values="extendedValueList"
          class="form" />
      </div>
      <div
        key="file-area-header"
        class="subtitle"
        @click="extend = !extend">Angeängte Objekte und Medien</div>
      <div
        key="file-area"
        class="file-boxes mobile-hidden">
        <base-drop-box
          key="addEntry"
          :show-plus="true"
          :box-size="{ width: '25%' }"
          icon="camera"
          text="Vorhandenen Eintrag hinzufügen"
          subtext="(Click oder Drag'n Drop)"/>
        <base-box-button
          key="addNew"
          :show-plus="true"
          :box-size="{ width: '25%'}"
          icon="sheet-empty"
          text="Neuen Eintrag anhängen"
          @clicked="openNewForm"/>
        <base-drop-box
          key="addFile"
          :show-plus="true"
          :box-size="{ width: '50%' }"
          :box-ratio="'50'"
          icon="camera"
          text="Dateien anhängen"
          subtext="(Click oder Drag'n Drop)"
          @dropped="dropped($event)"/>
      </div>
      <div
        key="mobile-file-area"
        class="file-list mobile-elements">
        <base-menu-entry
          id="addFile"
          key="mobile-addFile"
          icon="sheet-plus"
          title="Vorhandenen Eintrag hinzufügen" />
        <base-menu-entry
          id="addNew"
          key="mobile-addNew"
          icon="sheet-plus"
          title="Neuen Eintrag anhängen"
          @activated="openNewForm"/>
        <base-menu-entry
          id="addExisting"
          key="mobile-addExisting"
          icon="sheet-plus"
          title="Datei anhängen"/>
      </div>
    </transition-group>
    <base-pop-up
      :show="!!filesToUpload.length"
      title="Dateien hochladen"
      button-left-text="Abbrechen"
      button-right-text="Hochladen">
      <div class="popup-upload-area">
        <base-upload-bar
          v-for="(file, index) of filesToUpload"
          :key="index"
          :filename="file.name"/>
      </div>
      <base-input
        :label="'Test1'"
        :show-label="false"
        placeholder="Phaidra URL hier eingeben"
        class="files-popup-input-field"/>
      <div class="popup-text">
        <base-drop-down
          :label="'Lizenz auswählen'"
          :selected="'Wähle die Lizenz aus'"
          :selection-list="['CC-0', 'CC-BY', 'CC-BY-SA',
                            'CC-BY-ND', 'CC-BY-NC', 'CC-BY-NC-SA', 'CC-BY-NY-DD']"
          :background-color="'rgb(240, 240, 240)'"
          :fixed-width="true"
          header-style="inline"/>
        <base-drop-down
          :selected="'Bilder veröffentlichen?'"
          :selection-list="['Bilder anzeigen', 'Bilder nicht veröffentlichen']"
          :background-color="'rgb(240, 240, 240)'"
          :fixed-width="true"
          label="Bilder im Showroom anzeigen?"
          header-style="inline"/>
      </div>
    </base-pop-up>
  </div>
</template>

<script>
import {
  BaseButton,
  BaseSearch,
  BaseDropDown,
  BaseMenuList,
  BaseMenuEntry,
  BaseBoxButton,
  BaseDropBox,
  BasePopUp,
  BaseInput,
  BaseUploadBar,
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';
import BaseForm from './BaseForm';
import { FORM_MAPPINGS } from '../assets/data';

export default {
  components: {
    BaseUploadBar,
    BasePopUp,
    BaseButton,
    BaseSearch,
    BaseDropDown,
    BaseMenuList,
    BaseMenuEntry,
    BaseForm,
    BaseBoxButton,
    BaseDropBox,
    BaseInput,
  },
  data() {
    return {
      formType: null,
      extend: false,
      formList: FORM_MAPPINGS.common,
      valueList: {},
      formExtended: [],
      extendedValueList: {},
      showCheckbox: false,
      showFormMenu: true,
      unsavedChanges: false,
      routeChanged: false,
      parentHasUnsaved: false,
      linkedItems: [],
      filesToUpload: [],
    };
  },
  computed: {
    parent() {
      return this.$store.getters['data/getLatestParentItem'];
    },
  },
  watch: {
    $route(to) {
      this.routeChanged = true;
      if (to.params.id) {
        this.resetForm();
        this.updateForm();
      } else {
        this.resetForm();
      }
      window.scrollTo(0, 0);
    },
    valueList: {
      handler(val, oldVal) {
        // determine if any prop has content
        const populatedProps = Object.keys(val).filter(prop => val[prop] && val[prop].length);
        if (populatedProps.length && oldVal.title && !this.routeChanged) {
          this.unsavedChanges = true;
          this.parentHasUnsaved = true;
        }
      },
      deep: true,
    },
    extendedValueList: {
      handler(val, oldVal) {
        const formVal = {};
        const itemVal = {};
        if (val) {
          Object.keys(val).forEach((key) => {
            if (val[key]) {
              this.$set(formVal, key, val[key]);
            }
          });
        }
        const item = this.$store.state.data.currentItem.data;
        if (item) {
          Object.keys(item).forEach((key) => {
            if (item[key]) {
              this.$set(itemVal, key, item[key]);
            }
          });
        }
        const populatedProps = Object.keys(val).filter(prop => val[prop] && val[prop].length);
        if (populatedProps.length && Object.keys(oldVal).length
          && !(JSON.stringify(formVal) === JSON.stringify(itemVal))) {
          this.unsavedChanges = true;
        }
        this.routeChanged = false;
      },
      deep: true,
    },
  },
  async created() {
    if (window.innerWidth <= 640) {
      this.showFormMenu = false;
    }
    const entryId = this.$route.params.id;
    if (entryId) {
      const entryExists = await this.$store.dispatch('data/setCurrentItemById', entryId);
      if (entryExists) {
        this.updateForm();
      } else {
        // TODO: create a not found info (page?) for user!!
        // (redirect to new form (for now at least))
        this.$router.push('/dashboard/newItem');
      }
    }
  },
  mounted() {
    this.unsavedChanges = false;
    this.parentHasUnsaved = false;
  },
  methods: {
    async changed(evt) {
      const { value, field } = evt;
      if (field === 'type') {
        this.formType = value;
        this.formExtended = await this.$store.dispatch('data/fetchFormExtension', value);
        this.extendedValueList = {};
      }
    },
    saveForm() {
      if (this.valueList.title) {
        const data = Object.assign({}, this.extendedValueList);
        if (!this.$route.params.id) {
          // TODO: check somewhere if the entry should be linked to a parent
          this.$store.dispatch('data/addSidebarItem', Object.assign({}, this.valueList, { data }));
        } else {
          this.$store.dispatch('data/updateEntry', Object.assign({}, this.valueList, { data }));
        }
        this.unsavedChanges = false;
        this.parentHasUnsaved = false;
        this.$router.push(`/dashboard/item/${this.$store.state.data.currentItemId}`);

        this.$emit('saveForm');
      } else {
        // TODO: make known to user that title is missing!
      }
    },
    confirmDelete() {
      if (!this.$store.state.data.isNewForm) {
        this.$store.commit('data/setDeletable', [this.$store.state.data.currentItemId]);
        this.$store.commit('data/setPopUp', {
          show: true,
          header: 'Eintrag wirklich löschen?',
          text: `Wollen sie den Eintrag "${this.valueList.title}" wirklich löschen?`,
          icon: 'waste-bin',
          buttonText: 'Eintrag löschen',
          action: 'delete',
        });
      }
    },
    // TODO: refactor so that delete (above) and publish can have same method
    actionEntry(published) {
      this.$store.commit('data/setDeletable', [this.$store.state.data.currentItemId]);
      this.$store.commit('data/setPopUp', {
        show: true,
        header: `Eintrag wirklich ${published ? 'entfernen' : 'veröffentlichen'}?`,
        text: `Wollen sie den Eintrag "${this.valueList.title}" wirklich ${published ? 'entfernen' : 'veröffentlichen'}?`,
        icon: 'waste-bin',
        buttonText: `Eintrag ${published ? 'entfernen' : 'veröffentlichen'}`,
        action: published ? 'offline' : 'publish',
      });
    },
    async updateForm() {
      try {
        // fetch entity
        // this.axios.get('get the entity');
        const { type } = this.$store.state.data.currentItem;
        this.valueList = Object.assign({}, this.$store.state.data.currentItem, {
          type: type ? [type] : [],
        });
        this.extendedValueList = Object.assign({}, this.$store.state.data.currentItem.data);
        this.formType = type || '';
        if (this.formType) {
          this.formExtended = await this.$store.dispatch('data/fetchFormExtension', this.formType);
        }
      } catch (err) {
        console.error(err);
      }
    },
    openNewForm() {
      // TODO: check if this is the desired behaviour
      this.saveForm();
      this.$store.commit('data/setParentItem', this.valueList.id);
      this.$store.commit('data/deleteCurrentItem');
      this.$router.push('/dashboard/newItem');
    },
    dropped(e) {
      for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
        this.filesToUpload.push(e.dataTransfer.files[i]);
      }
      if (e.dataTransfer.items) {
        const linkedArr = [];
        const id = e.dataTransfer.getData('text/plain');
        if (!linkedArr.find(item => item.id === id)) {
          // TODO: do i actually need complete object or would id also be sufficient
          const linkedElement = this.$store.getters['data/getEntryById'](id);
          linkedArr.push(linkedElement);
        }
        // TODO: some action to actually link the items (database save!)
      }
    },
    returnToParent(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$store.dispatch('data/setCurrentItemById', id);
      this.$router.push(`/dashboard/item/${id}`);
    },
    resetForm() {
      this.valueList = {};
      this.extendedValueList = {};
      this.unsavedChanges = false;
      this.parentHasUnsaved = false;
      this.formType = '';
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  #form-component {

    #form-head {
      background-color: $background-color;
      position: sticky;
      top: $header-height;
      z-index: 5;
      padding-top: $spacing;
      padding-bottom: $spacing-small;

      .base-row-parent {
        border-bottom: $separation-line;
        position: relative;
        cursor: pointer;

        &:hover {
          color: $app-color;
        }

        &::after {
          content: '';
          position:absolute;
          height: 100%;
          width: 100%;
          z-index: 10;
          top: 0;
          left: 0;
          background-color: rgb(240, 240, 240);
          opacity: 0.5;
        }

        &:hover::after {
          opacity: 0;
        }
      }
    }
  }

  .options-button-row {
    width: 100%;

    .options {
      margin: auto;
    }
  }

  .slide-fade2-enter-active, .slide-fade2-move {
    transition: all 0.5s ease;
  }
  .slide-fade2-enter, .slide-fade2-leave-to {
    opacity: 0;
    transform: translateY(-#{$spacing});
  }

  .slide-fade2-leave-active {
    position: absolute;
    transition: all 0.3s ease;
  }

  .file-boxes {
    display: flex;

    div:not(:last-child) {
      margin-right: 16px;
    }
  }

  .file-list {
    margin-top: $spacing;
  }

  #menu-sidebar + #form-component {
    margin-left: 16px;
  }

  #form-save-button {
    border-left: $separation-line;
  }

  .subtitle {
    color: $font-color-second;
    height: $row-height-small;
    line-height: $row-height-small;
    margin: $spacing-small $spacing;
  }

  .form-button-child {
    display: block;
    border-left: $separation-line;
  }

  .popup-text {
    display: flex;
    align-items: flex-end;
  }

  .popup-text > div:first-of-type {
    margin-right: 16px;
  }

  .files-popup-input-field {
    margin-bottom: $spacing;
  }

  .popup-upload-area {
    margin: $spacing 0;
  }

  @media screen and (max-width: $mobile) {
    #form-component {
      max-width: 100%;
    }

    #menu-sidebar + #form-component {
      margin-left: 0;
    }

    #form-back-button, #form-save-button {
      width: 50%;
    }

    #form-back-button {
      order: 1;
    }

    #form-save-button {
      order: 2;
    }

    .form-button-inner {
      width: 100%;
    }
  }
</style>
