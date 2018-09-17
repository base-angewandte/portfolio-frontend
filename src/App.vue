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
        <div id="menu-sidebar">
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
              @clicked="showCheckbox = !showCheckbox"/>
            <base-drop-down
              :default-select="'Alle Typ'"
              :selection-list="['Bild', 'Publikation', 'Film/Video']" />
            <base-drop-down
              :default-select="'Alle Typen'"
              :selection-list="['Bild', 'Publikation', 'Film/Video']" />
          </div>
          <base-menu-list
            :selected="showCheckbox"
            :list="list"/>
        </div>
        <div id="form-component">
          <div class="base-row">
            <base-menu-entry
              :id="'asingleentry'"
              :icon="'sheet-empty'"
              subtext="Ausstellung" />
            <base-button
              text="Save"
              icon-size="small"
              icon="save-file"
              button-style="row"
              class="separation-line"/>
          </div>
          <div class="options-row flex-align-right" >
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
          <base-form
            :list="formList"/>
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
  },
  data() {
    return {
      newForm: false,
      formList: [
        {
          name: 'Title',
          type: 'text',
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
          type: 'multiline-text',
          size: 'full',
        },
        {
          name: 'Authors',
          type: 'chips',
          mode: 'multi',
          source: 'dynamic',
          unknown: false,
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
    };
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
      overflow: hidden;

      #app-container {
        margin-top: $header-height + $spacing;
        display: flex;

        #menu-sidebar{
          max-width: 33%;
          height: 100vh;

            button + div {
              border-left: $separation-line;
            }
          }
        }

        #form-component {
          max-width: 66%;
        }

        #menu-sidebar + #form-component{
          margin-left: 16px;
        }
      }

    .base-row {
      height: $row-height-large;
      box-shadow: $box-shadow-reg;
      display: flex;
      margin-bottom: $spacing;

      &:hover {
        box-shadow: $box-shadow-hov;
      }
    }

    .options-row {
      height: $row-height-small;
      width: 100%;
      display: flex;
      align-items: baseline;
      margin-bottom: $spacing;

      &.flex-align-right {
        justify-content: flex-end;
        margin-right: -32px;
      }
    }

    .separation-line {
      border-left: $separation-line;
    }
  }
</style>
