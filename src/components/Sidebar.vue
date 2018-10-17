<template>
  <div
    id="menu-sidebar"
    class="mobile-hidden">
    <div class="base-row">
      <base-button
        :active="newFormInt"
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
        :list="list"
        @clicked="showEntry"/>
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
