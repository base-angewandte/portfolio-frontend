<template>
  <div
    id="menu-sidebar"
    class="mobile-hidden">
    <div class="base-row">
      <base-button
        :active="$store.state.data.isNewForm"
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
          :icon="'options-menu'"
          icon-size="small"
          icon-position="left"
          @clicked="showCheckbox = !showCheckbox"/>
      </div>
      <base-drop-down
        :placeholder="'Sortieren nach'"
        :selection-list="['Nach Typ', 'A-Z', 'Z-A', 'Neueste', 'Älteste']"
        @selected="sortEntries"/>
      <base-drop-down
        :default-select="'Alle Typen'"
        :selection-list="availableEntryTypes"
        @selected="filterEntries"/>
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
        @clicked="deleteEntries"/>
      <base-menu-list
        id="menu-list"
        key="menu-list"
        :selected="showCheckbox"
        :list="listInt"
        :active-entry="activeEntry"
        @clicked="showEntry"
        @selected="selectEntry($event)"/>
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
  data() {
    return {
      showCheckbox: false,
      selectedMenuEntries: [],
      listInt: [],
      activeEntryInt: null,
    };
  },
  computed: {
    activeEntry: {
      get() {
        if (this.$store.state.data.currentItemId) {
          return this.activeEntryInt || this.$store.getters['data/getCurrentItemIndex'];
        }
        return null;
      },
      set(val) {
        this.activeEntryInt = val;
      },
    },
    availableEntryTypes() {
      return this.$store.getters['data/getEntryTypes'];
    },
    list: {
      get() {
        return [].concat(this.$store.getters['data/getSidebarData']);
      },
    },
  },
  watch: {
    activeEntry(val) {
      this.$store.commit('data/setNewForm', val === null);
    },
    list(val) {
      this.listInt = val;
      // this.activeEntry = this.$store.getters['data/getCurrentItemIndex'];
    },
  },
  created() {
    this.$store.commit('data/setNewForm', !this.$store.state.data.currentItemId);
    this.listInt = this.list;
  },
  methods: {
    showEntry(index) {
      this.$store.commit('data/setCurrentItem', this.list[index]);
      this.$emit('showEntry', this.list[index]);
    },
    selectEntry(index) {
      this.selectedMenuEntries.push(this.list[index].id);
    },
    getNewForm() {
      this.$store.commit('data/setCurrentItem', {});
      this.$emit('newForm');
    },
    deleteEntries() {
      this.$store.commit('data/deleteSidebarItems', this.selectedMenuEntries);
      this.selectedMenuEntries = [];
      this.showCheckbox = false;
      // TODO: check if currently displayed item is one of the deleted and remove from form
      // if necessary! (and change route)
    },
    sortEntries(evt) {
      this.$store.commit('data/sortEntries', evt);
    },
    filterEntries(evt) {
      // TODO: CONTINUE HERE!!
      // TODO: also use this for SEARCH!!
      console.log(evt);
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
