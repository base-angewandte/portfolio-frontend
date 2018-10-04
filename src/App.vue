<template>
  <div id="app">
    <div class="wrapper">
      <base-header
        :lang="'en'"
        :active="'recherche'"
        :profile.prop="null"
        :emit-navigation="true"
        :urls.prop="{
          de:'/recherche/de/',
          en:'/recherche/en/',
          login:'/recherche/login/',
          logout:'/recherche/logout/'}"
        @navigate="navigate($event.detail[0])" />
      <div id="app-container">
        <div
          id="menu-sidebar"
          class="mobile-hidden">
          <div class="base-row">
            <base-button
              :active="newForm"
              :text="'Neu'"
              icon="sheet-plus"
              icon-size="large"
              button-style="row"
              @clicked="newForm = !newForm"/>
            <base-search
              :show-image="true" />
          </div>
          <div class="options-row">
            <base-button
              :text="'Optionen'"
              :icon="'remove'"
              :hide-icon="!showCheckbox"
              icon-position="right"
              class="options"
              @clicked="showCheckbox = !showCheckbox"/>
            <base-drop-down
              :default-select="'Sortieren nach'"
              :selection-list="['Bild', 'Publikation', 'Film/Video']" />
            <base-drop-down
              :default-select="'Alle Typen'"
              :selection-list="['Bild', 'Publikation', 'Film/Video']" />
          </div>
          <transition-group
            name="slide-fade2"
            class="options-extend">
            <base-button
              v-if="showCheckbox"
              key="publish"
              text="In Showroom veröffentlichen"
              icon-size="large"
              icon="eye"
              button-style="single" />
            <base-button
              v-if="showCheckbox"
              key="publish"
              text="Einträge duplizieren"
              icon-size="large"
              icon="duplicate"
              button-style="single" />
            <base-button
              v-if="showCheckbox"
              key="delete"
              text="Einträge löschen"
              icon-size="large"
              icon="waste-bin"
              button-style="single" />
            <base-menu-list
              id="menu-list"
              key="menu-list"
              :selected="showCheckbox"
              :list="list"/>
          </transition-group>
        </div>
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
            id="form"
            :list="formList"/>
          <div class="file-boxes mobile-hidden">
            <base-drop-box
              :show-plus="true"
              :box-size="{ width: 'calc(25% - 16px)' }"
              icon="camera"
              text="Vorhandenen Eintrag hinzufügen"
              subtext="(Click oder Drag'n Drop)"/>
            <base-box-button
              :show-plus="true"
              :box-size="{ width: 'calc(25% - 16px)', height: '200px' }"
              icon="sheet-empty"
              text="Neuen Eintrag anhängen"
              subtext="(Click oder Drag'n Drop)"/>
            <base-drop-box
              :show-plus="true"
              :box-size="{ width: 'calc(50% - 16px)', height: '200px' }"
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
      </div>
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
import BaseForm from './components/BaseForm';


export default {
  name: 'App',
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
          name: 'Author',
          type: 'chips',
          mode: 'multi',
          source: 'dynamic',
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
      list: [
        {
          id: '1',
          title: 'On a lovely Summers Day',
          active: false,
          type: 'Bild',
          selected: false,
          shared: true,
          error: true,
        },
        {
          id: '2',
          title: 'Oh this hot hot heat',
          active: false,
          type: 'Bild',
          selected: false,
        },
        {
          id: '3',
          title: 'And then again a different title',
          active: false,
          type: 'Ausstellung',
          selected: false,
          shared: true,
        },
        {
          id: '4',
          title: 'Allons-y!!',
          active: false,
          type: 'Bild',
          selected: false,
        },
      ],
      showCheckbox: false,
      showFormMenu: true,
      unsavedChanges: false,
    };
  },
  created() {
    if (window.innerWidth <= 640) {
      this.showFormMenu = false;
    }
  },
};
</script>

<style lang="scss">
  @import "./styles/variables.scss";

  #app {
    .wrapper {
      display: block;
      margin: 0 auto;
      max-width: $page-max-width;
      min-width: $page-min-width;
      padding: $spacing;
      position: relative;
      min-height: 100vh;

      #app-container {
        margin-top: $header-height;
        display: flex;

        #menu-sidebar {
          max-width: 33%;
          align-self: flex-start;
          position: sticky;
          top: $header-height;
          padding-top: $spacing;

          button + div {
            border-left: $separation-line;
          }
        }

        #form-component {

          #form-head{
            background-color: $background-color;
            position: sticky;
            top: $header-height;
            z-index: 2;
            padding-top: $spacing;
            padding-bottom: 8px;
          }
        }
      }
    }

    .base-row {
      height: $row-height-large;
      box-shadow: $box-shadow-reg;
      display: flex;
      margin-bottom: $spacing-small;
      width: 100%;

      &:hover {
        box-shadow: $box-shadow-hov;
      }

      .base-row-header {
        overflow: hidden;
        width: 100%;
      }
    }

    .options-button-row {
      width: 100%;

      .options {
        margin: auto;
      }
    }

    .options-row {
      height: $row-height-small;
      width: 100%;
      display: flex;
      align-items: baseline;
      background-color: $background-color;

      &.flex-align-right {
        justify-content: flex-end;
        margin-right: -32px;
      }

      .options {
        flex-grow: 2;
      }
    }

    #menu-list {
      margin-top: $spacing-small;
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
  }

  .file-boxes {
    display: flex;
    margin-top: 16px;

    div:not(:last-child) {
      margin-right: 16px;
    }
  }

  .file-list {
    margin-top: $spacing;
  }

  #form-component {
    max-width: 66%;
  }

  #menu-sidebar + #form-component {
    margin-left: 16px;
  }

  .mobile-elements {
    display: none;
  }

  #form-save-button {
    border-left: $separation-line;
  }

  @media screen and (max-width: $mobile) {
    #app .wrapper {
      padding: $spacing-small;
    }

    .mobile-hidden {
      display: none;
    }

    #form-component {
      max-width: 100%;
    }

    #menu-sidebar + #form-component {
      margin-left: 0;
    }

    .mobile-elements {
      display: block;
    }

    #app .options-row {
      flex-wrap: wrap;
      height: auto;
    }

    #app .options-row.flex-align-right {
      justify-content: center;
    }

    .base-menu-entry {
      display: block;
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

    #app .base-row .base-row-header {
      order: 3;
      border-top: $separation-line;
    }

    #app .base-row {
      height: auto;
      flex-wrap: wrap;
    }

    .form-button-inner {
      width: 100%;
    }
  }
</style>
