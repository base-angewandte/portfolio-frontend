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
        <div
          class="base-row-header">
          <base-menu-entry
            :id="'asingleentry'"
            :icon="'sheet-empty'"
            :title="showOverlay ? '' : valueList.title"
            :title-bold="true"
            :is-activatable="false"
            :subtext="formType"/>
        </div>
        <div
          id="form-back-button"
          :class="['form-button', 'mobile-elements', { 'form-button-child' : parent }]">
          <base-button
            :text="unsavedChanges ? $t('cancel') : $t('back')"
            :icon="unsavedChanges ? '' : 'arrow-left'"
            icon-size="small"
            button-style="row"
            class="form-button-inner"
            @clicked="returnFromForm"/>
        </div>
        <div
          id="form-save-button"
          class="form-button">
          <base-button
            :active="unsavedChanges"
            :text="$t('save')"
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
            :text="$t('options')"
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
              :disabled="$store.state.data.isNewForm"
              :text="valueList.published ? $t('form-view.offline') : $t('form-view.publish')"
              icon-size="large"
              icon="eye"
              button-style="single"
              @clicked="actionEntry(valueList.published ? 'offline' : 'publish')"/>
            <base-button
              :disabled="true"
              :text="$t('form-view.edit')"
              icon-size="large"
              icon="people"
              button-style="single" />
            <base-button
              :disabled="$store.state.data.isNewForm"
              :text="$t('form-view.delete', { type: formType ? formType : $t('entry') })"
              icon-size="large"
              icon="waste-bin"
              button-style="single"
              @clicked="actionEntry('delete')"/>
          </div>
        </transition>
      </div>
    </div>

    <!-- FORM -->
    <div class="form-container">
      <base-form
        :list="formList"
        :form-values="valueList"
        class="form"
        @selected="changed"
        @values-changed="valuesChanged($event)"/>
      <transition-group
        name="slide-fade2">
        <div
          v-if="formType"
          key="extended-section"
          class="subsection">
          <div
            key="extended-title"
            class="subtitle">{{ $t('form-view.formExtended') }}</div>

          <!-- FORM EXTENSION -->
          <base-form
            key="extended-form"
            :list="formExtended"
            :form-values="valueList.data"
            class="form"
            @values-changed="valuesChanged($event, 'data')"/>
        </div>
        <div
          key="file-area"
          class="file-boxes mobile-hidden">
          <base-drop-box
            key="addEntry"
            :show-plus="true"
            :box-size="{ width: 'calc(25% - 8px)' }"
            icon="camera"
            text="Vorhandenen Eintrag hinzufügen"
            subtext="(Click oder Drag'n Drop)"
            class="file-boxes-margin"
            @dropped="droppedEntries($event)"
            @clicked="openEntrySelect"/>
          <base-box-button
            key="addNew"
            :show-plus="true"
            :box-size="{ width: 'calc(25% - 8px)'}"
            icon="sheet-empty"
            text="Neuen Eintrag anhängen"
            class="file-boxes-margin"
            @clicked="openNewForm"/>
          <label class="file-select">
            <base-drop-box
              key="addFile"
              :show-plus="true"
              :box-size="{ width: 'calc(100%)' }"
              :box-ratio="'50'"
              icon="camera"
              text="Dateien anhängen"
              subtext="(Click oder Drag'n Drop)"
              @dropped="handleFileSelect($event)"/>
            <input
              type="file"
              multiple
              @change="handleFileSelect">
          </label>

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
        <AttachmentArea
          :key="'attachmentArea'"
          :linked-list="linkedList"
          :attached-list="fileList"
          :text="text"
          subtext="Die Objekte werden für Showroom freigegeben"/>
      </transition-group>
      <transition name="slide">
        <BaseForm
          v-if="showOverlay"
          ref="overlay"
          :list="formList"
          class="form slide-in-form"/>
      </transition>
    </div>

    <uploader
      v-if="!!filesToUpload.length"
      :file-list="filesToUpload"
      @cancel="filesToUpload = []"
      @success="filesToUpload = []"/>
    <BasePopUp
      :show="showEntryPopUp"
      title="Select Entries to Link"
      button-right-text="Link Selected"
      @button-left="showEntryPopUp = false"
      @button-right="linkEntries(selectedEntries)">
      <div class="menu-wrapper">
        <Sidebar
          :list="selectableEntries"
          :select-active="true"
          :options-visible="false"
          :new-enabled="false"
          :height="'62vh'"
          :hide-active="true"
          class="menu"
          @sort="sortSelectable"
          @filter="filterSelectable"
          @selected-changed="selectedEntries = [].concat($event)"/>
      </div>
    </BasePopUp>
  </div>
</template>

<script>
import {
  BaseButton,
  BaseSearch,
  BaseMenuList,
  BaseMenuEntry,
  BaseBoxButton,
  BaseDropBox,
  BasePopUp,
} from 'base-components';
import 'base-components/dist/lib/base-components.min.css';
import BaseForm from './BaseForm';
import Uploader from './Uploader';
import { FORM_MAPPINGS } from '../assets/data';
import AttachmentArea from './AttachmentArea';
import Sidebar from './Sidebar';

export default {
  components: {
    Sidebar,
    BasePopUp,
    AttachmentArea,
    BaseButton,
    BaseSearch,
    BaseMenuList,
    BaseMenuEntry,
    BaseForm,
    BaseBoxButton,
    BaseDropBox,
    Uploader,
  },
  data() {
    return {
      formType: null,
      extend: false,
      formList: FORM_MAPPINGS.common,
      valueList: {},
      valueListCopy: {},
      formExtended: [],
      showCheckbox: false,
      showFormMenu: true,
      unsavedChanges: false,
      routeChanged: false,
      linkedItems: [],
      filesToUpload: [],
      showEntryPopUp: false,
      selectedEntries: [],
      selectableEntries: [],
      sortValue: '',
      filterValues: { title: '', type: '' },
      text: '',
      showOverlay: false,
    };
  },
  computed: {
    parent() {
      return this.$store.getters['data/getLatestParentItem'];
    },
    linkedList() {
      return this.$store.getters['data/getCurrentLinked'];
    },
    fileList() {
      return this.valueList.files;
    },
  },
  watch: {
    async $route(to) {
      this.routeChanged = true;
      if (to.params.id) {
        await this.updateForm();
      } else {
        await this.resetForm();
      }
      window.scrollTo(0, 0);
      this.routeChanged = false;
      this.showOverlay = false;
    },
    valueList: {
      handler(val) {
        // determine if any prop has content (necessary for new form)
        const populatedProps = Object.keys(val)
          .filter(prop => (val[prop] && val[prop].length)
            || Object.keys(val[prop]).find(cprop => val[prop][cprop] && val[prop][cprop].length));
        this.unsavedChanges = !!populatedProps.length && !this.routeChanged
          && JSON.stringify(val) !== JSON.stringify(this.valueListCopy);
      },
      deep: true,
    },
    showEntryPopUp() {
      this.selectedEntries = [];
    },
  },
  async created() {
    this.routeChanged = true;
    if (window.innerWidth <= 640) {
      this.showFormMenu = false;
    }
    const entryId = this.$route.params.id;
    if (entryId) {
      const entryExists = await this.$store.dispatch('data/setCurrentItemById', entryId);
      if (entryExists) {
        await this.updateForm();
      } else {
        // TODO: create a not found info (page?) for user!!
        // (redirect to new form (for now at least))
        this.$router.push('/new');
      }
    }
    this.routeChanged = false;
  },
  mounted() {
    this.unsavedChanges = false;
  },
  methods: {
    async changed(evt) {
      const { value, field } = evt;
      if (field === 'type') {
        this.formType = value;
        this.formExtended = await this.$store.dispatch('data/fetchFormExtension', value);
        // TODO: find logic to keep as many data as possible not just empty extension!
        this.$set(this.valueList, 'data', {});
      }
    },
    async saveForm() {
      if (this.valueList.title) {
        const data = Object.assign({}, this.valueList.data);
        try {
          if (!this.$route.params.id) {
            // TODO: check somewhere if the entry should be linked to a parent and
            // a) link to parent entry b) save to database
            // --> do this.linkEntries(this.$store.data.currentItemId)
            await this.$store.dispatch('data/addSidebarItem', Object.assign({}, this.valueList, { data }));
            this.$router.push(`/entry/${this.$store.state.data.currentItemId}`);
          } else {
            await this.$store.dispatch('data/updateEntry', Object.assign({}, this.valueList, { data }));
          }
          // this (JSON...) is necessary to destroy any links between the two objects...
          this.valueListCopy = Object.assign({}, JSON.parse(JSON.stringify(this.valueList)));
          this.unsavedChanges = false;
          this.$emit('save-form');
        } catch (e) {
          this.$notify({
            group: 'request-notifications',
            title: 'Saving to database failed',
            text: e.message,
            type: 'warn',
          });
        }
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Title missing',
          text: 'In order to save please specify a title!',
          type: 'warn',
        });
      }
    },
    actionEntry(action) {
      if (!this.$store.state.data.isNewForm && !this.unsavedChanges) {
        this.$store.dispatch('data/actionEntries', {
          action,
          entries: [this.$store.state.data.currentItemId],
        });
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Unsaved Changes',
          text: `Please save your ${this.$store.state.data.isNewForm ? 'new Form' : 'Changes'} first!`,
          type: 'warn',
        });
      }
    },
    async updateForm() {
      try {
        const { type } = this.$store.state.data.currentItem;
        this.formType = type || '';
        if (this.formType) {
          this.formExtended = await this.$store.dispatch('data/fetchFormExtension', this.formType);
        }
        // set the current data from store item
        // use initializeObject() to have all properties present
        // from the beginning and prevent false "unsavedChanges"
        this.valueList = Object.assign({}, this.initializeObject(this.formList),
          this.$store.state.data.currentItem, {
            type: type ? [type] : [],
            data: Object.assign({}, this.initializeObject(this.formExtended),
              this.$store.state.data.currentItem.data),
          });
        debugger;
        // this (JSON...) is necessary to destroy any links between the two objects...
        this.valueListCopy = Object.assign({}, JSON.parse(JSON.stringify(this.valueList)));
      } catch (err) {
        console.error(err);
      }
    },
    openNewForm() {
      if (this.valueList.title) {
        this.showOverlay = true;
        this.formType = '';
        this.$store.commit('data/setParentItem', this.valueList.id);
        this.$store.commit('data/setNewForm', true);
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.saveForm();
          this.$store.commit('data/deleteCurrentItem');
          this.$router.push('/new');
        }, 700);
      } else {
        this.$notify({
          group: 'request-notifications',
          title: 'Linking not possible',
          text: 'Please specify a title for this entry first',
          type: 'warn',
        });
      }
    },
    droppedEntries(e) {
      // check if it was not a file that was dragged in and if anything is attached to event at all
      if (!e.dataTransfer.files.length && e.dataTransfer.items) {
        // get the id of the dragged item
        const id = e.dataTransfer.getData('text/plain');
        // check if the dragged item was actually the one already open
        if (id !== this.valueList.id) {
          // if not link the entry
          this.linkEntries([id]);
        } else {
          // otherwise issue a warning that entry can not be linked to itself
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.linkingNotPossible'),
            text: this.$t('notify.selfLinked'),
            type: 'warn',
          });
        }
      }
    },
    handleFileSelect(e) {
      // get files - depending if dragged or selected from file browse different event prop
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      // check if it was actual files that were dragged in
      if (files && files.length) {
        for (let i = 0; i < files.length; i += 1) {
          this.filesToUpload.push(files[i]);
        }
      }
    },
    returnToParent(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$store.dispatch('data/setCurrentItemById', id);
      this.$router.push(`/entry/${id}`);
    },
    resetForm() {
      this.valueList = {};
      this.valueListCopy = {};
      this.unsavedChanges = false;
      this.formType = '';
    },
    valuesChanged(val, prop) {
      // update the value lists with the provided changes
      if (prop) {
        this.$set(this.valueList, prop, val);
      } else {
        this.valueList = Object.assign({}, val);
      }
    },
    async linkEntries(val) {
      // TODO communicate this to database!
      // also linked entries should actually be connected to the entry at hand not hardcoded
      // --> should be done in store!!!
      const list = [];
      await val.forEach((entryId) => {
        const entry = this.$store.getters['data/getEntryById'](entryId);
        // TODO: also check if it is a parent already!!!!!
        if (!this.linkedList.map(e => e.id).includes(entryId)) {
          list.push(entry);
        } else {
          this.$notify({
            group: 'request-notifications',
            title: this.$t('notify.linkingNotPossible'),
            text: this.$t('notify.alreadyLinked'),
            type: 'warn',
          });
        }
      });
      this.$store.commit('data/setLinked', { list });
      this.showEntryPopUp = false;
    },
    returnFromForm() {
      if (this.parent) {
        this.returnToParent(this.parent.id);
      } else {
        this.$router.push('/');
      }
    },
    clickHeader() {
      this.text = this.text ? '' : 'Bitte Objekte Wählen';
    },
    openEntrySelect() {
      this.selectableEntries = this.filterSelected();
      this.showEntryPopUp = true;
    },
    filterSelectable(val) {
      const data = this.filterSelected();
      this.$set(this.filterValues, val.type, val.val === 'Alle Typen' ? '' : val.val);
      this.selectableEntries = data.filter(entry => entry.title
        .includes(this.filterValues.title)
        && (!this.filterValues.type || entry.type === this.filterValues.type));
      this.sortSelectable(this.sortValue);
    },
    sortSelectable(val) {
      this.sortValue = val;
      const data = this.selectableEntries;
      if (data.length) {
        if (val === 'Nach Typ') {
          data.sort((a, b) => {
            if (a.type > b.type) {
              return 1;
            }
            return -1;
          });
        } else if (val === 'A-Z') {
          data.sort((a, b) => {
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
              return 1;
            }
            return -1;
          });
        } else if (val === 'Z-A') {
          data.sort((a, b) => {
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
              return -1;
            }
            return 1;
          });
        }
      }
    },
    filterSelected() {
      return [].concat(this.$store.getters['data/getSidebarData']
        .filter(entry => entry.id !== this.$store.state.data.currentItemId
          && !this.$store.getters['data/getCurrentLinked'].includes(entry)));
    },
    initializeObject(formData) {
      const formValues = {};
      formData.forEach((field) => {
        let initVal = '';
        if (field.dataType === Array) {
          initVal = [];
        } else if (field.dataType === Object) {
          initVal = {};
        }
        this.$set(formValues, field.name, initVal);
      });
      return formValues;
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
    margin-top: $spacing;

    .file-boxes-margin {
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

  .form-button-child {
    display: block;
    border-left: $separation-line;
  }

  .file-select {
    width: 50%;

    & > input[type='file'] {
      display: none;
    }
  }

  .menu-wrapper {
    padding: 0 $spacing $spacing;
    background-color: rgb(240, 240, 240);
  }

  .subtitle {
    color: $font-color-second;
    padding: $spacing;
  }

  .form-container {
    position: relative;

    .slide-in-form {
      top: 0;
      position: absolute;
    }
  }

  .slide-enter-active {
    box-shadow: $pop-up-shadow;
    transition: opacity 0.4s ease-in, transform 0.5s ease-in, box-shadow 0.7s ease-in;
  }

  .slide-enter-to {
    box-shadow: none;
  }

  .slide-enter {
    transform: translateY(400px);
    opacity: 0;
    box-shadow: $pop-up-shadow;
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
