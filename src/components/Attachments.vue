<template>
  <div class="attachment-area">
    <!-- ATTACHED ENTRIES -->
    <BaseResultBoxSection
      v-if="linkedList.length"
      ref="linkedSection"
      :entry-list="linkedList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :header-text="$t('form-view.attachedEntries')"
      :show-action-button-boxes="true"
      :is-loading="entriesLoading"
      :selected-list.sync="selectedEntries"
      :edit-mode="editModeActive === 'entry'"
      :action-buttons-config="[{
        text: 'form-view.deleteLinked',
        icon: 'waste-bin',
        value: 'delete',
        display: 'all',
      }]"
      :select-options-text="{
        selectAll: $t('selectAll'),
        selectNone: $t('selectNone'),
        entriesSelected: $t('entriesSelected', { type: $tc('entry', selectedEntries.length) })
      }"
      @update:edit-mode="editModeActive = 'entry'"
      @submit-action="deleteLinked">
      <template
        #resultBox="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
          :selected="props.isEntrySelected(props.item)"
          :title="props.item.to.title"
          :subtext="props.item.to.subtitle"
          :description="props.item.description"
          :image-url="props.item.to.image ? getImagePath(props.item.to.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="props.entrySelected(props.item.id, $event)"
          @clicked="goToLinked(props.item.to.id)" />
      </template>
    </BaseResultBoxSection>

    <!-- ATTACHED FILES -->
    <BaseResultBoxSection
      v-if="attachedList.length"
      ref="fileSection"
      :draggable="true"
      :entry-list="attachedList"
      :message-text="$t('form-view.fileActionText')"
      :message-subtext="`${$t('form-view.fileActionSubtext')}
        \n ${$t('form-view.fileActionSubtextDrag')}`"
      :header-text="$t('form-view.attachedFiles')"
      :edit-mode="editModeActive === 'file'"
      :is-loading="filesLoading"
      :selected-list.sync="selectedFiles"
      :select-options-text="{
        selectAll: $t('selectAll'),
        selectNone: $t('selectNone'),
        entriesSelected: $t('entriesSelected', { type: $tc('entry', selectedEntries.length) })
      }"
      :show-action-button-boxes="true"
      :action-buttons-config="[
        {
          text: $t('form-view.changeLicense'),
          icon: 'licence',
          value: 'license',
          display: pendingAction === 'license' ? 'all' : 'top',
        },
        {
          text: $t('form-view.featureMedia'),
          icon: 'subscribe',
          value: 'feature',
          display: 'top',
        },
        {
          text: $t('form-view.publishMedia'),
          icon: 'eye',
          value: 'publish',
          display: 'top',
          disabled: !attachedList.filter((item) => !item.published).length,
        },
        {
          text: $t('form-view.offlineMedia'),
          icon: 'eye-hide',
          value: 'offline',
          display: 'top',
          disabled: !attachedList.filter((item) => item.published).length,
        },
        {
          text: $t('form-view.deleteMedia'),
          icon: 'waste-bin',
          value: 'delete',
          display: 'top',
        },
      ]"
      use-options-button-on="always"
      @entries-changed="orderAction"
      @submit-action="checkFileActioning"
      @update:edit-mode="editModeActive = 'file'">
      <template #optionsMessageAreaAfter>
        <div
          v-if="pendingAction === 'license'"
          class="attachments__license-drop-down">
          <BaseDropDown
            v-model="licenseSelected"
            :options="licenses"
            :show-label="false"
            :label="$t('form-view.selectLicense')"
            :placeholder="$t('form-view.selectLicense')"
            :language="$i18n.locale"
            value-prop="source" />
        </div>
      </template>
      <template
        #resultBox="props">
        <BaseImageBox
          :key="props.item.id"
          :show-title="true"
          :selectable="props.selectActive"
          :selected="props.isEntrySelected(props.item)"
          :title="props.item.original ? getFileName(props.item.original) : props.item.id"
          :subtext="getLicenseLabel(props.item.license)"
          :description="getFileType(props.item)"
          :image-url="getImagePath(props.item.thumbnail
            || props.item.cover, imageHover[props.index])"
          :box-ratio="100"
          :box-text="generateBoxText(props.item.metadata)"
          class="linked-base-box"
          @mouseenter.native="changeVideoHoverState($event, props.index, true)"
          @mouseleave.native="changeVideoHoverState($event, props.index, false)"
          @select-triggered="props.entrySelected(props.item.id, $event, props.item.published)"
          @clicked="$emit('show-preview', props.item)">
          <template
            slot="footerLeft">
            <base-icon
              v-if="props.item.featured"
              name="subscribe"
              :title="capitalizeString($t('notify.featured'))"
              :aria-title="capitalizeString($t('notify.featured'))"
              :aria-description="iconDescription('featured', props.item.original)"
              class="status-icon" />
          </template>
          <template
            slot="footer">
            <template
              v-if="props.item.published">
              <div class="status-icons">
                <base-icon
                  v-if="props.item.archived"
                  name="archive-sheets"
                  :title="capitalizeString($t('notify.publishd'))"
                  :aria-title="capitalizeString($t('notify.publishd'))"
                  :aria-description="iconDescription('published', props.item.original)"
                  class="status-icon" />

                <base-icon
                  v-if="props.item.published"
                  name="eye"
                  :title="capitalizeString($t('notify.publishd'))"
                  :aria-title="capitalizeString($t('notify.publishd'))"
                  :aria-description="iconDescription('published', props.item.original)"
                  class="status-icon" />
              </div>
            </template>
          </template>
        </BaseImageBox>
      </template>
    </BaseResultBoxSection>

    <!-- PARENT ENTRIES -->
    <BaseResultBoxSection
      v-if="parentList.length"
      ref="parentSection"
      :entry-list="parentList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :header-text="$t('form-view.parentEntries')"
      :show-action-button-boxes="true"
      :is-loading="entriesLoading"
      :selected-list.sync="selectedEntries"
      :edit-mode="editModeActive === 'parent'"
      :action-buttons-config="[{
        text: 'form-view.deleteParents',
        icon: 'waste-bin',
        value: 'delete',
        display: 'all',
      }]"
      :select-options-text="{
        selectAll: $t('selectAll'),
        selectNone: $t('selectNone'),
        entriesSelected: $t('entriesSelected', { type: $tc('entry', selectedEntries.length) })
      }"
      @update:edit-mode="editModeActive = 'parent'"
      @submit-action="deleteLinked">
      <template
        #resultBox="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
          :selected="props.isEntrySelected(props.item)"
          :title="props.item.parent.title"
          :subtext="props.item.parent.subtitle"
          :description="props.item.description"
          :image-url="props.item.parent.image ? getImagePath(props.item.parent.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="props.entrySelected(props.item.id, $event)"
          @clicked="goToLinked(props.item.parent.id)" />
      </template>
    </BaseResultBoxSection>
  </div>
</template>

<script>
import { userInfo } from '@/mixins/userInfo';
import { capitalizeString, getApiUrl, getLangLabel } from '@/utils/commonUtils';

export default {
  mixins: [userInfo],
  props: {
    linkedList: {
      type: Array,
      default() {
        return [];
      },
    },
    attachedList: {
      type: Array,
      default() {
        return [];
      },
    },
    parentList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      // which section has the edit mode active
      editModeActive: '',
      // entries selected
      selectedEntries: [],
      // files selected
      selectedFiles: [],
      // variable specific for license action to store selected license
      licenseSelected: {},
      // to switch url during hover save hover state in this array
      imageHover: [],
      // timeout for requesting media again if there are still unconverted
      timeout: null,
      // toggle loader display, displayed during db requests
      entriesLoading: false,
      filesLoading: false,
      // store the pending action in a variable until process finished
      pendingAction: '',
      // store the pending action to follow up after for second or further function calls
      pendingActionFollowUp: '',
      // store the original attached list (needed to reset order after request error)
      attachedListOriginal: [],
      capitalizeString,
    };
  },
  computed: {
    // variable for checking if there are still unconverted files
    isConverting() {
      return this.attachedList.some((file) => !file.metadata);
    },
    licenses() {
      return this.$store.getters['data/getPrefetchedTypes']('medialicenses', 'source');
    },
  },
  watch: {
    // if attached media list changes trigger function to re-fetch media from time to time
    attachedList: {
      handler(val) {
        this.attachedListOriginal = val;
        this.checkConverting();
      },
      immediate: true,
    },
  },
  destroyed() {
    // if timeout was set (for refetching media), remove it
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  },
  methods: {
    // save hover state on mouse enter / leave to get correct video url
    changeVideoHoverState(event, index, value) {
      this.$set(this.imageHover, index, value);
    },
    /**
     * add a step before executing the action to check if action is 'license'
     * --> needs license selection first!
     * @param act
     */
    checkFileActioning(act) {
      this.pendingAction = act;
      // check if action is delete to add a confimation pop up before deleting
      if (this.pendingAction === 'delete') {
        // get all the data for selected file ids
        const files = this.attachedList.filter((file) => this.selectedFiles.includes(file.id));
        // get specifically the filenames to display (or the id if file is still converting)
        const titles = files.map((entry) => (this.getFileName(entry.original) || entry.id)
          .replace(/</g, '\\<')
          .replace(/>/g, '\\>'));
        // open the pop up
        this.$store.commit('data/setPopUp', {
          show: true,
          header: `${this.$tc('notify.fileActionTitle', titles.length)}?`,
          textTitle: this.$tc('notify.fileActionText', titles.length),
          textList: titles,
          icon: 'waste-bin',
          buttonTextRight: this.$tc('notify.fileActionTitle', titles.length),
          actionRight: () => this.saveFileMeta(),
          actionLeft: () => this.cancelDelete(),
        });
        // if action is everything but license (and delete) continue with the action
        // for license the drop down appears as soon as pendingAction is set and
        // no further code execution is necessary until user input is done
      } else if (this.pendingAction !== 'license'
      || this.pendingActionFollowUp === 'license') {
        this.saveFileMeta();
      }

      // set pendingActionFollowUp to trigger saveFileMeta() on next function call
      this.pendingActionFollowUp = this.pendingAction;
    },
    /**
     * action to order items, reset component if requests fails
     * @param {Array} orderedList
     * @returns {Promise<void>}
     */
    async orderAction(orderedList) {
      const response = await this.$store.dispatch('data/orderFiles', {
        action: 'order',
        entryId: this.$route.params.id,
        list: orderedList.map((item) => ({ id: item.id })),
      });

      if (response.error) {
        // reset order
        this.$store.commit('data/setMedia', { list: this.attachedListOriginal, replace: true });

        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.order') }),
          text: this.$t('notify.actionFailSubtextRetry', { toTitleCase: false }),
          type: 'error',
        });
      }
    },
    // function for using options (delete, change license, publish state) for files
    async saveFileMeta() {
      this.$store.commit('data/hidePopUp');
      this.filesLoading = true;
      // check if files were selected
      if (!this.selectedFiles.length) {
        // if not notify user that he needs to select files
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t(`notify.${this.pendingAction}`) }),
          text: this.$t('notify.selectForAction', {
            action: this.$t(`notify.${this.pendingAction}File`, { toTitleCase: false }),
            type: this.$tc('notify.media', 0, { toTitleCase: false }),
          }),
          type: 'error',
        });
        // check if a license was selected if action is license change
        // if not inform user he should select a license
      } else if (this.pendingAction === 'license' && this.licenseSelected.source === undefined) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.license') }),
          text: this.$t('notify.selectLicense'),
          type: 'error',
        });
        // check if a just a single file was selected if action is feature file
        // if not inform user he should select just 1 file
      } else if (this.pendingAction === 'feature' && this.selectedFiles.length > 1) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.feature') }),
          text: this.$t('notify.selectSingleForAction', {
            action: this.$t('notify.featureFile', { toTitleCase: false }),
          }),
          type: 'error',
        });
      } else {
        // define value and set depending on pendingAction
        let value = '';
        if (this.pendingAction === 'license') {
          value = this.licenseSelected;
        }
        if (this.pendingAction === 'feature') {
          // check featured state of selected file and toggle state if already featured
          value = !this.attachedList.find((obj) => obj.id === this.selectedFiles[0]).featured;
        }

        // if all error checks pass actually do the action
        const [successIds, failIds] = await this.$store.dispatch('data/actionFiles', {
          list: this.selectedFiles,
          action: this.pendingAction,
          value,
        });
        // and inform user of the fail / success
        this.informUser({
          successArr: successIds, failedArr: failIds, action: this.pendingAction, type: 'media',
        });
        if (successIds.length) {
          await this.fetchMedia();
          // check if action was delete and if yes propagate to parent to update user quota
          if (this.pendingAction === 'delete') {
            this.$emit('files-deleted');
          }
        }
        // clear all variables after action
        this.pendingAction = '';
        this.pendingActionFollowUp = '';
        this.selectedFiles = [];
        this.licenseSelected = {};
      }
      this.filesLoading = false;
    },
    // action for linked entries
    async deleteLinked() {
      this.entriesLoading = true;
      // check if user has selected entries
      if (this.selectedEntries.length) {
        // use parent function to action entries
        await this.$parent.actionLinked({ list: this.selectedEntries, action: 'delete' });
        // reset all involved variables
        this.entryEditModeActive = false;
        this.selectedEntries = [];
      } else {
        // notify user to select entries
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.delete') }),
          text: this.$t('notify.selectForAction', {
            action: this.$t('notify.deleteFile', { toTitleCase: false }),
            type: this.$tc('notify.entry', 0, { toTitleCase: false }),
          }),
          type: 'error',
        });
      }
      this.entriesLoading = false;
    },
    cancelDelete() {
      this.$store.commit('data/hidePopUp');
    },
    // get file name from url
    getFileName(file) {
      if (file) {
        // split into array by slash and then just get last entry
        return decodeURI(file.split('/').pop());
      }
      return '';
    },
    // function to get file type from metadata type information (for box display)
    getFileType(file) {
      const { type } = file;
      if (file.metadata && type) {
        if (type === 'i') {
          return this.$t('form-view.image');
        } if (type === 'v') {
          return this.$t('form-view.video');
        } if (type === 'a') {
          return this.$t('form-view.audio');
        } if (type === 'd') {
          return this.$t('form-view.document');
        }
        return this.$t('form-view.file');
      }
      return this.$t('form-view.fileConverting');
    },
    // get the correct media url
    getImagePath(iconName, hover) {
      // check if a gif is available in metadata
      if (iconName && iconName.gif && iconName.jpg) {
        // use it if hover state is true else use still image
        return getApiUrl(hover ? iconName.gif : iconName.jpg);
      }
      // check if there is url provided
      if (typeof iconName === 'string' && iconName) {
        // check if url is complete - if yes just use it
        if (iconName.includes('http')) {
          return iconName;
        }
        // else add base url
        return getApiUrl(iconName);
      }
      return '';
    },
    // if no image is available some metadata are used to create box text
    generateBoxText(metadata) {
      const wantedAttributes = ['FileSize', 'ImageSize', 'Title', 'Artist', 'Year'];
      if (metadata) {
        return Object.keys(metadata).filter((key) => wantedAttributes.includes(key))
          .map((data) => `${metadata[data].val}`);
      }
      return [];
    },
    goToLinked(id) {
      this.$emit('open-linked', id);
    },
    async fetchMedia() {
      // update information in attachement area with new info
      // TODO: do i need to do this or could i just change things locally??
      try {
        await this.$store.dispatch('data/fetchMediaData', this.$route.params.id);
      } catch (e) {
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.fetchMediaFail'),
          type: 'error',
        });
      }
    },
    getLicenseLabel(license) {
      if (license && license.label) {
        return getLangLabel(license.label, this.$i18n.locale, true);
      }
      return '';
    },
    checkConverting() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      // request media data again in a minute if media are still converting
      if (this.isConverting) {
        this.timeout = setTimeout(() => {
          this.fetchMedia();
        }, 60000);
      }
    },
    iconDescription(state, item) {
      return `${this.$t('form-view.file')} ${this.$t(`form-view.file${state[0].toUpperCase() + state.slice(1)}`, { file: this.getFileName(item) })}`;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {

    .attachments__license-drop-down {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: $spacing auto 0 auto;
      text-align: left;
      max-width: 100%;

      .license-button {
        border: 1px solid #{$font-color-second};
        padding: $spacing-small/2 $spacing-small !important;
        box-shadow: 0 0 4px 0 rgba(0,0,0,0.25);

        &:hover {
          border: 1px solid #{$app-color};
        }
      }
    }

    .linked-base-box {
      cursor: pointer;
    }

    .status-icon {
      height: $icon-medium;
      max-width: $icon-medium;
    }

    .status-icons {
      .status-icon {
        margin-left: $spacing-small;
      }
    }
  }
</style>
