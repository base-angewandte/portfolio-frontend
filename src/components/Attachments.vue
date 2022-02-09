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
        display: !selectedEntries.length ? 'top' : 'all',
        disabled: !selectedEntries.length,
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
      :message-subtext="$t('form-view.fileActionSubtext')"
      :header-text="$t('form-view.attachedFiles')"
      :edit-mode="editModeActive === 'file'"
      :is-loading="filesLoading || getIsArchivalBusy"
      :selected-list.sync="selectedFiles"
      :select-options-text="{
        selectAll: $t('selectAll'),
        selectNone: $t('selectNone'),
        entriesSelected: $t('entriesSelected', { type: $tc('entry', selectedEntries.length) })
      }"
      :show-action-button-boxes="true"
      :action-buttons-config="attachedFilesActionButtonsConfig"
      use-options-button-on="always"
      @entries-changed="orderAction"
      @submit-action="checkFileActioning"
      @update:edit-mode="editModeActive = 'file'">
      <template #optionsMessageAreaAfter>
        <div
          class="text-small">
          {{ $t('form-view.fileActionSubtextDrag') }}
        </div>

        <div
          v-if="pendingAction === 'license' && selectedFiles.length"
          class="attachments__license-drop-down-area">
          <BaseDropDown
            v-model="licenseSelected"
            :options="licenses"
            :show-label="false"
            :label="$t('form-view.selectLicense')"
            :placeholder="$t('form-view.selectLicense')"
            :language="$i18n.locale"
            class="attachments__license-drop-down"
            value-prop="source" />

          <BaseButton
            :disabled="!Object.keys(licenseSelected).length"
            :text="$t('form-view.licenseButton')"
            icon-position="right"
            icon="check-mark"
            button-style="secondary"
            class="license-button"
            @clicked="saveFileMeta" />
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
          @select-triggered="props.entrySelected(props.item.id,
                                                 $event, props.item.published,
                                                 props.item.archive_URI)"
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
              v-if="props.item.published || props.item.archive_id ||
                getArchivingMedia.includes(props.item.id)">
              <div class="status-icons">
                <base-icon
                  v-if="props.item.published"
                  name="eye"
                  :title="capitalizeString($t('notify.publishd'))"
                  :aria-title="capitalizeString($t('notify.publishd'))"
                  :aria-description="iconDescription('published', props.item.original)"
                  class="status-icon" />
                <base-icon
                  v-if="props.item.archive_id && getIsArchivalEnabled"
                  name="archive-sheets"
                  :title="capitalizeString($t('archival.archived'))"
                  :aria-title="capitalizeString($t('archival.archived'))"
                  :aria-description="iconDescription('archived', props.item.original)"
                  class="status-icon" />
                <base-icon
                  v-if="!props.item.archive_id && getIsArchivalEnabled
                    && getArchivingMedia.includes(props.item.id)"
                  name="archive-arrow"
                  :title="capitalizeString($t('archival.submitted'))"
                  :aria-title="capitalizeString($t('archival.submitted'))"
                  :aria-description="iconDescription('archived', props.item.original)"
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
        display: !selectedEntries.length ? 'top' : 'all',
        disabled: !selectedEntries.length,
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

    <!-- ARCHIVAL UNSAVED POP-UP -->
    <archival-unsaved-pop-up
      v-if="showArchivalUnsavedPopUp"
      :is-pop-up-open="showArchivalUnsavedPopUp"
      @cancel-unsaved="showArchivalUnsavedPopUp = false"
      @save-form="saveDataBeforeArchival()" />

    <!-- ARCHIVAL VALIDATION POP-UP -->
    <archival-validation-pop-up
      v-if="showArchivalValidationPopUp"
      ref="validationPopUp"
      :is-pop-up-open="showArchivalValidationPopUp"
      @cancel-validation="cancelArchivalValidation"
      @next-step="revalidateArchival" />

    <!-- ARCHIVAL LICENSING AGREEMENT POP-UP -->
    <archival-agreement-pop-up
      v-if="showArchivalAgreementPopUp"
      :is-pop-up-open="showArchivalAgreementPopUp"
      :selected-filenames="selectedFileNames"
      @cancel-agreement="cancelArchivalAgreement"
      @next-step="proceedToArchival" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { userInfo } from '@/mixins/userInfo';
import { capitalizeString, getApiUrl, getLangLabel } from '@/utils/commonUtils';
import ArchivalUnsavedPopUp from './ArchivalUnsavedPopUp';
import ArchivalValidationPopUp from './ArchivalValidationPopUp';
import ArchivalAgreementPopUp from './ArchivalAgreementPopUp';

export default {
  components: { ArchivalUnsavedPopUp, ArchivalValidationPopUp, ArchivalAgreementPopUp },
  mixins: [userInfo],
  // inject method used to save or discard the main form from child components of any depth
  inject: ['saveMainForm', 'discardMainForm'],
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
      // show/hide the archival unsaved pop-up
      showArchivalUnsavedPopUp: false,
      // show/hide the archival validation pop-up
      showArchivalValidationPopUp: false,
      // show/hide the archival licensing agreement pop-up
      showArchivalAgreementPopUp: false,
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
    ...mapGetters('data', [
      'getCurrentItemData',
      'getCurrentMedia',
      'getArchivalValidationOutcome',
      'getArchivalUpdateOutcome',
      'getArchivalErrors',
      'getIsFormSaved',
      'getArchiveMediaConsent',
      'getIsArchivalBusy',
      'getArchivingMedia',
      'getIsArchiveUpdate',
      'getIsArchivalEnabled',
    ]),
    attachedFilesActionButtonsConfig() {
      const config = [
        {
          text: this.$t('form-view.changeLicense'),
          icon: 'licence',
          value: 'license',
          display: 'top',
          disabled: !this.selectedFiles.length,
        },
        {
          text: this.$t('form-view.featureMedia'),
          icon: 'subscribe',
          value: 'feature',
          display: 'top',
          disabled: this.selectedFiles.length !== 1,
        },
        {
          text: this.$t('form-view.publishMedia'),
          icon: 'eye',
          value: 'publish',
          display: 'top',
          disabled: !this.attachedList
            .filter((file) => this.selectedFiles.includes(file.id))
            .filter((file) => !file.published).length,
        },
        {
          text: this.$t('form-view.offlineMedia'),
          icon: 'eye-hide',
          value: 'offline',
          display: 'top',
          disabled: !this.attachedList
            .filter((file) => this.selectedFiles.includes(file.id))
            .filter((file) => file.published).length,
        },
        {
          text: this.$t('form-view.deleteMedia'),
          icon: 'waste-bin',
          value: 'delete',
          display: 'top',
          disabled: !this.selectedFiles.length,
        },
      ];

      // check if archival functionality is enabled and insert archival button on first position
      if (this.getIsArchivalEnabled) {
        config.unshift({
          text: this.$t('form-view.archiveMedia'),
          icon: 'archive-sheets',
          value: 'archiveMedia',
          display: 'top',
          disabled: !this.attachedList
            .filter((file) => this.selectedFiles.includes(file.id))
            .filter((file) => !file.archive_id).length,
        });
      }

      return config;
    },
    /**
     * Returns an array with short file names (no path) + extension for currently selected files.
     */
    selectedFileNames() {
      try {
        const fileNames = [];
        // first filter out only objects which not already archived and where filename is selected
        // eslint-disable-next-line max-len
        const selObjects = this.getCurrentMedia
          .filter((obj) => this.selectedFiles.includes(obj.id))
          .filter((obj) => !obj.archive_id);

        // now iterate through filtered objects and populate fileNames
        selObjects.forEach((obj) => {
        // push only part after the last / character
          fileNames.push(obj.original.substr(obj.original.lastIndexOf('/') + 1));
        });
        return fileNames;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    /**
     * Guards for changes in the isArchiveUpdate store property
     */
    triggerArchiveUpdate() {
      return this.getIsArchiveUpdate;
    },
    /**
     * Returns an array of all media asset IDs belonging to the current entry.
     */
    mediaIds() {
      return this.attachedList
        .map((media) => media.id);
    },
    /**
     * Returns an array with the IDs of all archived media assets.
     */
    archivedMediaIds() {
      return this.attachedList
        .filter((media) => media.archive_URI !== null)
        .map((media) => media.id);
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
    // when there is a request triggered from the store to update archived data,
    // run the same validation as for initial archival
    triggerArchiveUpdate() {
      if (this.getIsArchiveUpdate) {
        this.runArchivalValidation();
      }
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
      // get all the data for selected file ids
      const files = this.attachedList.filter((file) => this.selectedFiles.includes(file.id));

      // check if action is delete to add a confirmation pop up before deleting
      if (files.length && this.pendingAction === 'delete') {
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
    filterSelectedFilesByProperty(property, value = true) {
      if (!property) {
        return this.selectedFiles;
      }
      return this.attachedList
        .filter((file) => this.selectedFiles.includes(file.id))
        .filter((file) => file[property] === value)
        .map((file) => file.id);
    },
    // function for using options (delete, change license, publish state, push to archive) for files
    async saveFileMeta() {
      this.$store.commit('data/hidePopUp');
      this.filesLoading = true;

      // check if files were selected again
      // (action buttons should be disabled if no file is selected)
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
        // When action is archiveMedia and the media archival consent has not yet been
        // accepted, run the archival validation. If the archival consent has been
        // accepted, this means that validation and agreement steps are already completed
        // and it's ok to dispatch the archiveMedia action to store
      } else if (this.pendingAction === 'archiveMedia' && !this.getArchiveMediaConsent) {
        await this.runArchivalValidation();
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

        // filter selectedFiles for final requests
        let list = this.selectedFiles;
        if (this.pendingAction === 'publish') {
          list = this.filterSelectedFilesByProperty('published', false);
        }
        if (this.pendingAction === 'offline') {
          list = this.filterSelectedFilesByProperty('published');
        }
        if (this.pendingAction === 'archiveMedia') {
          list = this.filterSelectedFilesByProperty('archive_id', null);
        }

        // if all error checks pass actually do the action
        const [successIds, failIds] = await this.$store.dispatch('data/actionFiles', {
          action: this.pendingAction,
          list,
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
          // if the license of any archived asset has changed, update the store with
          // advice that the remote archive needs update
          if (this.pendingAction === 'license' && this.archivedMediaIds.length > 0
              && this.archivedAssetsChangedLicense(successIds)) {
            this.$store.dispatch('data/fetchIsArchiveChanged');
          }
        }
        // clear all variables after action
        this.pendingAction = '';
        this.pendingActionFollowUp = '';
        this.selectedFiles = [];
        this.licenseSelected = {};
        this.showArchivalAgreementPopUp = false;
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
    // function triggered upon entry selection updating selectedEntries accordingly
    entrySelected(objId, sel) {
      if (sel) {
        // only add if entry is not there yet
        if (!this.selectedEntries.includes(objId)) {
          this.selectedEntries.push(objId);
        }
      } else {
        this.selectedEntries = this.selectedEntries.filter((entryId) => entryId !== objId);
      }
    },
    // function triggered if medium selected
    filesSelected(objId, selectAll, published, archiveUri) {
      // special case publish, for all others just update selectedFiles accordingly
      if (this.pendingAction !== 'publish') {
        if (selectAll) {
          // another special case: don't select files for archival if they were already archived
          if (this.pendingAction === 'archiveMedia' && archiveUri) {
            // skip this file
          } else {
            this.selectedFiles.push(objId);
          }
        } else {
          this.selectedFiles = this.selectedFiles.filter((entryId) => entryId !== objId);
        }
      } else {
        // filter item from array in case it was already added previously
        // easier than replacing the selected value for relevant item
        this.selectedFiles = this.selectedFiles.filter((file) => file.id !== objId);
        // check if file was selected and add it with opposite value
        if (selectAll) {
          this.selectedFiles.push({ id: objId, selected: !published });
        }
      }
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
      // update information in attachment area with new info
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
      // or in the "submitted for archival" state
      if (this.isConverting || this.getArchivingMedia.length > 0) {
        this.timeout = setTimeout(() => {
          this.fetchMedia();
        }, 60000);
      }
    },
    iconDescription(state, item) {
      return `${this.$t('form-view.file')} ${this.$t(`form-view.file${state[0].toUpperCase() + state.slice(1)}`, { file: this.getFileName(item) })}`;
    },
    setAction(val) {
      // close other selects
      this.entryAction = '';
      this.parentEntryAction = '';
      if (val) {
        this.pendingAction = val;
        this.fileSubtext = this.$t(`form-view.${val}Subtext`);
        this.fileText = this.$t('form-view.fileActionText', { action: this.$t(`form-view.${val}Text`, { toTitleCase: false }) });
        this.buttonText = this.$t(`form-view.${val}Button`);
      } else {
        this.fileText = '';
        this.selectedFiles = [];
      }
    },
    setEntryAction(type) {
      // close other selects
      this.pendingAction = '';
      this[`${type === 'entry' ? 'parentEntry' : 'entry'}Action`] = '';
      // clear entries
      this.selectedEntries = [];
      this[`${type}Action`] = 'delete';
    },
    selectEntries(listType, selectAll) {
      if (listType === 'files') {
        this.selectedFiles = [];
        if (selectAll) {
          // eslint-disable-next-line max-len
          this.attachedList.forEach((file) => this.filesSelected(file.id, selectAll, file.published, file.archive_URI));
          // If action is "Push to Archive" and all attached files are already archived,
          // the count of selected files will be 0 after executing the filesSelected function.
          // In this case, notify the user why Select All didn't do anything
          if (this.pendingAction === 'archiveMedia' && this.selectedFiles.length === 0) {
            this.$notify({
              group: 'request-notifications',
              title: this.$t('archival.titleAlreadyArchived'),
              text: this.$t('archival.textAlreadyArchived'),
              type: 'warning',
            });
          }
        }
      } else {
        this.selectedEntries = selectAll ? this[`${listType}List`].map((entry) => entry.id) : [];
      }
    },
    /**
     * Handles the request to validate data that is to be archived.
     */
    async runArchivalValidation() {
      // if form is not saved, notify the user to save first
      if (!this.getIsFormSaved) {
        this.showArchivalUnsavedPopUp = true;
      } else {
        // first set any previous archival validation outcome to void
        this.$store.commit('data/setArchivalValidationOutcome', null);
        // prepare the params required to validate archival data
        const mediaIds = this.selectedFiles.length > 0 ? this.selectedFiles : this.mediaIds;
        // obtain a new validation outcome
        await this.$store.dispatch('data/validateArchivalData', mediaIds);
        if (this.getArchivalValidationOutcome) {
          switch (this.getArchivalValidationOutcome) {
          case 200:
            this.showArchivalValidationPopUp = false;
            // if it's an archive update, proceed straight to update request
            if (this.getIsArchiveUpdate) {
              await this.updateArchive();
            } else {
              // else ask for consent to the licensing agreement
              this.displayArchivalAgreement();
            }
            break;
          case 400:
            // display the validation popup
            this.showArchivalValidationPopUp = true;
            // reload the popup's form if this is a revalidation
            if (this.$refs.validationPopUp) this.$refs.validationPopUp.reloadForm();
            break;
          case 500:
            this.failArchival(this.$t('archival.internalServerError'));
            break;
          case 503:
            this.failArchival(this.$t('archival.serviceUnavailable'));
            break;
          default:
            // unknown status code returned by the server
            this.failArchival(this.$t('archival.generalError'));
          }
        } else {
          // could not reasonably determine the validation outcome
          this.failArchival(this.$t('archival.generalError'));
        }
      }
    },
    /**
     * Handles the request to update already archived data in the remote archiving system.
     */
    async updateArchive() {
      // first set any previous archival update outcome to void
      this.$store.commit('data/setArchivalUpdateOutcome', null);
      await this.$store.dispatch('data/updateArchive');
      switch (this.getArchivalUpdateOutcome) {
      case 200:
        this.showArchivalValidationPopUp = false;
        // change this store property to false to make it possible to trigger renewed
        // requests for archive update
        this.$store.commit('data/setIsArchiveUpdate', false);
        // inform the user of success
        this.$notify({
          group: 'request-notifications',
          title: this.$t('archival.archiveUpdateTitle'),
          text: this.$t('archival.archiveUpdateSuccessful'),
          type: 'success',
        });
        break;
      case 400:
        // display the validation popup
        this.showArchivalValidationPopUp = true;
        // reload the popup's form if this is a revalidation
        if (this.$refs.validationPopUp) this.$refs.validationPopUp.reloadForm();
        break;
      case 500:
        this.failArchival(this.$t('archival.internalServerError'));
        break;
      case 503:
        this.failArchival(this.$t('archival.serviceUnavailable'));
        break;
      default:
        // unknown status code returned by the server
        this.failArchival(this.$t('archival.generalError'));
      }
    },
    /**
     * Saves the main form data from the "archival unsaved" pop-up
     * and proceeds to archival validation.
     */
    async saveDataBeforeArchival() {
      try {
        // save main form via injected method
        await this.saveMainForm(false);
        this.runArchivalValidation();
      } catch (e) {
        console.error(e);
      } finally {
        this.showArchivalUnsavedPopUp = false;
      }
    },
    /**
     * Displays the agreement pop-up only if we have the filenames
     * of the files that are to be archived.
     */
    displayArchivalAgreement() {
      if (this.selectedFileNames) {
        // ok to open the pop-up
        this.showArchivalAgreementPopUp = true;
      } else {
        // destroy any previous pop-up instance
        this.showArchivalValidationPopUp = false;
        // we don't have enough info to proceed
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.archive'),
          text: this.$t('notify.somethingWrong'),
          type: 'error',
        });
      }
    },
    /**
     * Triggered when the user clicks "Cancel" on the archival validation pop-up
     */
    cancelArchivalValidation() {
      // Discard any unsaved changes (#1433)
      this.discardMainForm();
      this.showArchivalValidationPopUp = false;
      // change this store property to false to make it possible to trigger renewed
      // requests for archive update
      this.$store.commit('data/setIsArchiveUpdate', false);
    },
    /**
     * Notifies the user that the archival operation (validation or update)
     * has failed due to technical reasons like server unavailable, request timeout,
     * internal server error, etc
     */
    failArchival(reason) {
      // change this store property to false to make it possible to trigger renewed
      // requests for archive update
      this.$store.commit('data/setIsArchiveUpdate', false);
      this.$notify({
        group: 'request-notifications',
        title: this.$t('form-view.archiveMedia'),
        text: reason,
        type: 'error',
      });
    },
    /**
     * Triggered when the user clicks "Cancel" on the archival agreement pop-up
     */
    cancelArchivalAgreement() {
      this.showArchivalValidationPopUp = false;
      this.showArchivalAgreementPopUp = false;
    },
    /**
     * Handles the request to revalidate archival fields after the user fills in
     * the missing fields on the archival validation pop-up and clicks "Next".
     */
    async revalidateArchival() {
      // Wait for the main form to be saved
      await this.saveMainForm(false);
      // Initiate the validation routine again
      await this.runArchivalValidation();
    },
    /**
     * Proceeds to the actual archival request after all the steps of the archival wizard
     * (validation, licensing agreement) have been completed.
     */
    proceedToArchival() {
      this.saveFileMeta();
    },
    /**
     * Occurs when an attachment is clicked.
     */
    onAttachmentClicked(isSelectActive, item) {
      // if the attachment area is expanded (active) and this attachment is archived
      if (isSelectActive && item.archive_URI) {
        // don't show any preview (#1496)
      } else {
        this.$emit('show-preview', item);
      }
    },
    /**
     * Returns true if the image box is selectable for the item
     * supplied as argument, false otherwise.
     */
    isImageBoxSelectable(isSelectActive, item) {
      if (!isSelectActive) return false;
      if (this.pendingAction === 'archiveMedia' && item.archive_URI) return false;
      return !(this.pendingAction === 'archiveMedia' && this.getArchivingMedia.includes(item.id));
    },
    /**
     * Returns true if the license of any *archived* media asset has changed,
     * false otherwise. Takes as argument the media IDs that were actioned upon.
     */
    archivedAssetsChangedLicense(actionedMediaIds) {
      return actionedMediaIds.some((item) => this.archivedMediaIds.includes(item));
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {

    .attachments__license-drop-down-area {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      margin: $spacing auto 0 auto;
      text-align: left;
      max-width: 100%;

      .attachments__license-drop-down {
        max-width: 100%;
      }

      .license-button {
        font-size: $font-size-regular;
        border: 1px solid #{$button-disabled-border-color};
        padding: $spacing-small $spacing-small !important;
        min-height: 2rem;
        box-shadow: 0 0 4px 0 rgba(0,0,0,0.25);

        &:enabled {
          border: 1px solid #{$font-color-second};
        }

        &:hover:enabled {
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

    .text-small {
      font-size: $font-size-small;
    }

    &::v-deep .base-multiline-text-input__additions {
      justify-content: flex-end;
    }
  }
</style>
