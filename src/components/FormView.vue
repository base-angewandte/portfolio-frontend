<template>
  <div id="form-component">
    <div id="form-head">
      <div class="base-row">
        <div class="base-row-header">
          <base-menu-entry
            :id="'asingleentry'"
            :icon="'sheet-empty'"
            :title="formList[0].value"
            :title-bold="true"
            subtext="Ausstellung" />
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
            @clicked="newForm = false"/>
          <base-button
            v-else
            text="Abbrechen"
            icon-size="small"
            button-style="row"
            class="form-button-inner"
            @clicked="newForm = false"/>
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
            @clicked="newForm = unsavedChanges = false"/>
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
              button-style="single" />
          </div>
        </transition>
      </div>
    </div>
    <base-form
      :list="formList"
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
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';
import BaseForm from './BaseForm';

export default {
  components: {
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
      newForm: false,
      formList: [
        {
          name: 'Title',
          type: 'autocomplete',
          size: 'half',
        },
        {
          name: 'Subtitle',
          type: 'text',
          size: 'half',
        },
        {
          name: 'Typ',
          type: 'chips',
          mode: 'single',
          source: 'cv',
          unknown: false,
          size: 'full',
        },
        {
          name: 'Description',
          type: 'multiline',
          size: 'full',
        },
        {
          name: 'Schlagwörter',
          type: 'chips',
          source: 'static',
          unknown: true,
          mode: 'multi',
          size: 'full',
        },
        {
          name: 'Notizen',
          type: 'multiline',
          size: 'full',
        },
      ],
      formExtended: [
        {
          name: 'Beteiligte',
          type: 'chips',
          mode: 'multi',
          source: 'dynamic',
          unknown: false,
          size: 'full',
        },
        /*
        {
          name: 'Laufzeit',
          type: 'date',
          size: 'half',
        },
        {
          name: 'Eröffnung',
          type: 'date',
          size: 'half',
        }, */
        {
          name: 'Veranstaltungsort',
          type: 'autocomplete',
          mode: 'single',
          source: 'dynamic',
          unknown: true,
          size: 'half',
        },
        {
          name: 'Ort / Adresse',
          type: 'autocomplete',
          mode: 'single',
          source: 'dynamic',
          unknown: true,
          size: 'half',
        },
        {
          name: 'Links',
          type: 'text',
          size: 'full',
        },
      ],
      showCheckbox: false,
      showFormMenu: true,
      unsavedChanges: false,
    };
  },
  created() {
    console.log(this.$route);
    if (window.innerWidth <= 640) {
      this.showFormMenu = false;
    }
  },
  methods: {
    changed(field) {
      console.log(field);
      this.formType = field;
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
