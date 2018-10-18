<template>
  <div
    id="menu-sidebar"
    class="mobile-hidden">
    <div class="base-row">
      <base-button
        :active="!$store.state.currentItemId"
        :text="$t('new')"
        icon="sheet-plus"
        icon-size="large"
        button-style="row"
        @clicked="getNewForm"/>
      <base-search
        :show-image="true" />
    </div>
    <div class="options-row">
      <div class="options">
        <base-button
          :text="'Optionen'"
          :icon="'remove'"
          :hide-icon="!showCheckbox"
          icon-position="right"
          @clicked="showCheckbox = !showCheckbox"/>
      </div>
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
        key="duplicate"
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
        button-style="single"
        @clicked="$store.commit('data/deleteSidebarItems', selectedMenuEntries)"/>
      <base-menu-list
        id="menu-list"
        key="menu-list"
        :selected="showCheckbox"
        :list="list"
        @clicked="showEntry"
        @selected="selectedMenuEntries.push($event)"/>
    </transition-group>
  </div>
</template>

<script>
import {
  BaseMenuList,
  BaseButton,
  BaseDropDown,
  BaseSearch,
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';

export default {
  components: {
    BaseMenuList,
    BaseButton,
    BaseDropDown,
    BaseSearch,
  },
  props: {
    newForm: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showCheckbox: false,
      newFormInt: this.newForm,
      list: this.$store.getters['data/getSidebarData'],
      selectedMenuEntries: [],
    };
  },
  watch: {
    newForm(val) {
      this.newFormInt = val;
    },
  },
  methods: {
    showEntry(index) {
      this.$emit('showEntry', this.list[index]);
    },
    getNewForm() {
      this.newFormInt = true;
      this.$store.commit('data/setCurrentItem', {})
      this.$emit('newForm');
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  #menu-sidebar {

    button + div {
      border-left: $separation-line;
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

  @media screen and (max-width: $mobile) {
    .base-menu-entry {
      display: block;
    }
  }
</style>
