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
        <div id="form-component">test</div>
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
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';


export default {
  name: 'App',
  components: {
    BaseButton,
    BaseSearch,
    BaseDropDown,
    BaseMenuList,
  },
  data() {
    return {
      newForm: false,
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
          flex: 0 0 33%;
          max-width: 33%;
          height: 100vh;

          .base-row {
            height: $row-height-large;
            box-shadow: $box-shadow-reg;
            display: flex;
            margin-bottom: $spacing;

            &:hover {
              box-shadow: $box-shadow-hov;
            }

            button + div {
              border-left: $separation-line;
            }
          }

          .options-row {
            height: $row-height-small;
            width: 100%;
            display: flex;
            align-items: baseline;
            margin-bottom: $spacing;
          }
        }

        #form-component {
          background-color: white;
          flex: 0 0 66%;
        }

        #menu-sidebar + #form-component{
          margin-left: 16px;
        }
      }
    }
  }
</style>
