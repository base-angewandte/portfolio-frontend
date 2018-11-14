<template>
  <div
    id="menu-sidebar"
    class="mobile-hidden">

    <div class="sidebar-head">
      <div class="base-row">
        <base-button
          :active="$store.state.data.isNewForm"
          :text="$t('new')"
          icon="sheet-plus"
          icon-size="large"
          button-style="row"
          @clicked="getNewForm"/>
        <base-search
          :show-image="true"
          @input="filterEntries($event, 'title')"/>
      </div>
      <div class="options-row">
        <div class="options">
          <base-button
            :text="'Optionen'"
            :icon="'options-menu'"
            icon-size="small"
            icon-position="left"
            @clicked="$store.commit('data/setOptions', !showCheckbox)"/>
        </div>
        <base-drop-down
          :placeholder="'Sortieren nach'"
          :selection-list="['Nach Typ', 'A-Z', 'Z-A', 'Neueste', 'Älteste']"
          @selected="sortEntries"/>
        <base-drop-down
          :selected="'Alle Typen'"
          :selection-list="availableEntryTypes"
          @selected="filterEntries($event, 'type')"/>
      </div>
      <transition
        name="slide-toggle"
        class="options-extend">
        <div
          v-if="showCheckbox"
          class="options-extend-box">
          <base-button
            text="In Showroom veröffentlichen"
            icon-size="large"
            icon="eye"
            button-style="single"
            @clicked="actionEntries('publish')"/>
          <base-button
            text="Einträge offline stellen"
            icon-size="large"
            icon="forbidden"
            button-style="single"
            @clicked="actionEntries('offline')"/>
          <base-button
            text="Einträge duplizieren"
            icon-size="large"
            icon="duplicate"
            button-style="single"
            @clicked="duplicateEntries"/>
          <base-button
            text="Einträge löschen"
            icon-size="large"
            icon="waste-bin"
            button-style="single"
            @clicked="actionEntries('delete')"/>
        </div>
      </transition>
    </div>

    <base-menu-list
      id="menu-list"
      key="menu-list"
      :selected="showCheckbox"
      :list="listInt"
      :active-entry="activeEntry"
      @clicked="showEntry"
      @selected="selectEntry"/>
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
      selectedMenuEntries: [],
      listInt: [],
      activeEntryInt: null,
    };
  },
  computed: {
    showCheckbox() {
      return this.$store.state.data.showOptions;
    },
    activeEntry: {
      get() {
        const id = this.$store.state.data.currentItemId;
        if (id && this.$store.getters['data/getSidebarData'].find(entry => entry.id === id)) {
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
    list(val) {
      this.listInt = [].concat(val);
    },
    showCheckbox(val) {
      // delete selected when options menu is closed
      if (!val) {
        // TODO: this does not update checkboxes!!
        this.selectedMenuEntries = [];
      }
    },
  },
  created() {
    this.listInt = this.list;
  },
  methods: {
    showEntry(index) {
      this.$store.commit('data/setCurrentItem', this.list[index]);
      this.$store.commit('data/deleteParentItems');
      this.$emit('showEntry', this.list[index]);
    },
    selectEntry(evt) {
      if (evt.selected) {
        this.selectedMenuEntries.push(this.list[evt.index].id);
      } else {
        this.selectedMenuEntries = this.selectedMenuEntries
          .filter(entry => entry !== this.list[evt.index].id);
      }
    },
    getNewForm() {
      this.$store.commit('data/setCurrentItem', {});
      this.$store.commit('data/deleteParentItems');
      this.$emit('newForm');
    },
    sortEntries(evt) {
      this.$store.dispatch('data/sortEntries', evt);
    },
    filterEntries(val, type) {
      this.$store.dispatch('data/filterEntries', { val, type });
    },
    duplicateEntries() {
      this.$store.dispatch('data/duplicateEntries', this.selectedMenuEntries);
      this.selectedMenuEntries = [];
      // TODO: to have consistency this route is set since for now in store current item is set to
      // newly created one...but dont know if we want that??
      this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
    },
    actionEntries(value) {
      if (this.selectedMenuEntries.length) {
        this.$store.dispatch('data/actionEntries', { action: value, entries: this.selectedMenuEntries });
      } else {
        // TODO: inform user that no entries were selected!
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  #menu-sidebar {
    display: flex;
    flex-direction: column;
    height: calc(100vh - #{$header-height} - #{$row-height-small});

    button + div {
      border-left: $separation-line;
    }

    .sidebar-head {
      position: sticky;
      top: $header-height;
      z-index: 5;
      padding-top: $spacing;
      padding-bottom: $spacing-small;
      background-color: $background-color;
      flex: 0 0 auto;

      .options-extend-box {
        width: 100%;
        background-color: $background-color;
        overflow: hidden;
      }

      .options-extend {
      }
    }
  }

  #menu-list {
    flex: 1 1 auto;
    overflow-y: scroll;
  }

  .slide-toggle-enter-active,
  .slide-toggle-leave-active {
    transition: height .5s ease;
  }
  .slide-toggle-enter-active {
    height: calc(4 * #{$row-height-small});
  }
  .slide-toggle-enter,
  .slide-toggle-leave-active {
    height: 0;
  }
  .slide-toggle-leave {
    height: calc(4 * #{$row-height-small});
  }

  @media screen and (max-width: $mobile) {
    .base-menu-entry {
      display: block;
    }
  }
</style>
