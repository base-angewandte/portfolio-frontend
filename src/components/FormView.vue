<template>
  <div id="form-component">
    <div id="form-head">
      <div class="base-row">
        <div class="base-row-header">
          <base-menu-entry
            :id="'asingleentry'"
            :icon="'sheet-empty'"
            :title="valueList.title"
            :title-bold="true"
            :subtext="formType" />
        </div>
        <div
          id="form-back-button"
          class="form-button mobile-elements">
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
              text="In Showroom veröffentlichen"
              icon-size="large"
              icon="eye"
              button-style="single" />
            <base-button
              text="Bearbeitung ermöglichen"
              icon-size="large"
              icon="people"
              button-style="single" />
            <base-button
              text="Publikation löschen"
              icon-size="large"
              icon="waste-bin"
              button-style="single"
              @clicked="showPopUp = !$store.state.data.isNewForm"/>
          </div>
        </transition>
      </div>
    </div>

    <base-pop-up
      :show="showPopUp"
      :title="'Eintrag löschen?'"
      :button-left-text="'Abbrechen'"
      :button-right-text="'Eintrag löschen'"
      button-right-icon="waste-bin"
      @close="showPopUp = false"
      @clicked="removeEntryAction">
      <div class="delete-pop-up">
        <div>
          <p class="delete-pop-up-text">
            {{ 'Soll "' + valueList.title + '" wirklich gelöscht werden?' }}
          </p>
        </div>
      </div>
    </base-pop-up>

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
        <base-form
          key="extended-form"
          :list="formExtended"
          class="form" />
      </div>
    </transition-group>
    <div
      class="subtitle"
      @click="extend = !extend">Angeängte Objekte und Medien</div>
    <div class="file-boxes mobile-hidden">
      <base-drop-box
        :show-plus="true"
        :box-size="{ width: '25%' }"
        icon="camera"
        text="Vorhandenen Eintrag hinzufügen"
        subtext="(Click oder Drag'n Drop)"/>
      <base-box-button
        :show-plus="true"
        :box-size="{ width: '25%'}"
        icon="sheet-empty"
        text="Neuen Eintrag anhängen"/>
      <base-drop-box
        :show-plus="true"
        :box-size="{ width: '50%' }"
        :box-ratio="'50'"
        icon="camera"
        text="Dateien anhängen"
        subtext="(Click oder Drag'n Drop)"
        @dropped="dropped($event)"/>
    </div>
    <div class="file-list mobile-elements">
      <base-menu-entry
        id="addFile"
        icon="sheet-plus"
        title="Vorhandenen Eintrag hinzufügen" />
      <base-menu-entry
        id="addNew"
        icon="sheet-plus"
        title="Neuen Eintrag anhängen"/>
      <base-menu-entry
        id="addExisting"
        icon="sheet-plus"
        title="Datei anhängen"/>
    </div>
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
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';
import BaseForm from './BaseForm';
import { FORM_MAPPINGS } from '../assets/data';

export default {
  components: {
    BasePopUp,
    BaseButton,
    BaseSearch,
    BaseDropDown,
    BaseMenuList,
    BaseMenuEntry,
    BaseForm,
    BaseBoxButton,
    BaseDropBox,
  },
  data() {
    return {
      formType: null,
      extend: false,
      formList: FORM_MAPPINGS.common,
      valueList: {},
      formExtended: [],
      showCheckbox: false,
      showFormMenu: true,
      unsavedChanges: false,
      showPopUp: false,
      popUpText: '',
    };
  },
  watch: {
    $route(to) {
      if (to.params.id) {
        try {
          // fetch entity
          // this.axios.get('get the entity');
          const { type } = this.$store.state.data.currentItem;
          this.valueList = Object.assign({}, this.$store.state.data.currentItem, {
            type: type ? [type] : [],
          });
          this.formType = type || '';
        } catch (err) {
          console.error(err);
        }
      } else {
        this.valueList = {};
        this.formType = '';
      }
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
        try {
          // fetch entity
          // this.axios.get('get the entity');
          const { type } = this.$store.state.data.currentItem;
          this.valueList = Object.assign({}, this.$store.state.data.currentItem, {
            type: type ? [type] : [],
          });
          this.formType = type || '';
        } catch (err) {
          console.error(err);
        }
      } else {
        // TODO: create a not found info (page?) for user!!
        // (redirect to new form (for now at least))
        this.$router.push('/dashboard/newItem');
      }
    } else {
      this.$store.commit('data/setNewForm', true);
    }
  },
  methods: {
    async changed(field) {
      this.formType = field;
      this.formExtended = await this.$store.dispatch('data/fetchFormExtension', field);
    },
    saveForm() {
      if (this.valueList.title) {
        if (this.$store.state.data.isNewForm) {
          this.$store.commit('data/setNewForm', false);
          this.$store.commit('data/addSidebarItem', this.valueList);
        } else {
          this.$store.commit('data/updateEntry', this.valueList);
        }
        this.unsavedChanges = false;
        this.$router.push(`/dashboard/item/${this.$store.state.data.currentItemId}`);

        this.$emit('saveForm');
      } else {
        // TODO: make known to user that title is missing!
      }
    },
    removeEntryAction(evt) {
      if (evt === 'buttonRight') {
        this.deleteEntry();
      }
      this.showPopUp = false;
    },
    deleteEntry() {
      this.$store.commit('data/deleteSidebarItems', [this.$store.state.data.currentItemId]);
      this.$store.commit('data/deleteCurrentItem');
      this.$router.push('/dashboard');
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
      padding-bottom: 8px;
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

  .delete-pop-up {
    text-align: center;
    font-size: $font-size-large;
    min-height: 150px;
    max-width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;

    .delete-pop-up-text {
      margin: auto;
      text-align: center;
    }
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
