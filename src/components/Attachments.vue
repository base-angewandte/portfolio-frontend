<template>
  <div class="attachment-area">
    <!-- ATTACHED ENTRIES -->
    <BaseResultBoxSection
      ref="linkedSection"
      :entry-list="linkedList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :option-button-text="$t('form-view.deleteLinked')"
      :action-button-text="$t('form-view.deleteButton')"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.attachedEntries')"
      :action="entryAction"
      :is-loading="entriesLoading"
      :selected-list="selectedEntries"
      @set-action="setEntryAction('entry')"
      @all-selected="selectEntries('linked', $event)"
      @submit-action="deleteLinked"
      @cancel-action="resetSelected">
      <template
        v-slot:result-box="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
          :selected="selectedEntries.map(entry => entry.id || entry).includes(props.item.id)"
          :box-size="{ width: 'calc(25% - 8rem/19 - (8rem/19/2))' }"
          :title="props.item.to.title"
          :subtext="props.item.to.subtitle"
          :description="props.item.description"
          :image-url="props.item.to.image ? getImagePath(props.item.to.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(props.item.id, $event)"
          @clicked="goToLinked(props.item.to.id)" />
      </template>
    </BaseResultBoxSection>

    <!-- ATTACHED FILES -->
    <BaseResultBoxSection
      ref="fileSection"
      :entry-list="attachedList"
      :message-text="fileText"
      :message-subtext="fileSubtext"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.attachedFiles')"
      :action-button-text="buttonText"
      :action="action"
      :is-loading="filesLoading || getIsArchivalBusy"
      :selected-list="selectedFiles"
      entry-type="media"
      @all-selected="selectEntries('files', $event)"
      @set-action="setAction"
      @submit-action="saveFileMeta"
      @cancel-action="resetSelected">
      <!-- SLOT FOR ADDITIONAL OPTIONS NEEDED FOR FILES -->
      <template
        slot="option-buttons"
        slot-scope="scope">
        <BaseButton
          v-if="getIsArchivalEnabled"
          :text="$t('form-view.archiveMedia')"
          icon-size="large"
          icon="archive-sheets"
          button-style="single"
          @clicked="scope.setAction('archiveMedia')" />
        <BaseButton
          :text="$t('form-view.changeLicense')"
          icon-size="large"
          icon="licence"
          button-style="single"
          @clicked="scope.setAction('license')" />
        <BaseButton
          :text="$t('form-view.publishMedia')"
          icon-size="large"
          icon="eye"
          button-style="single"
          @clicked="scope.setAction('publish')" />
        <BaseButton
          :text="$t('form-view.deleteMedia')"
          icon-size="large"
          icon="waste-bin"
          button-style="single"
          @clicked="scope.setAction('delete')" />
      </template>
      <template slot="options-message-area-after">
        <BaseDropDown
          v-if="action === 'license'"
          v-model="licenseSelected"
          :options="licenses"
          :show-label="false"
          :label="$t('form-view.selectLicense')"
          :placeholder="$t('form-view.selectLicense')"
          :language="$i18n.locale"
          value-prop="source"
          class="license-dropdown" />
      </template>
      <!-- eslint-disable -->
      <template
        v-slot:result-box="props">
        <BaseImageBox
          :key="props.item.id"
          :show-title="true"
          :selectable="isImageBoxSelectable(props.selectActive, props.item)"
          :selected="selectedFiles.map(file => file.id || file).includes(props.item.id)"
          :title="props.item.original ? getFileName(props.item.original) : props.item.id"
          :subtext="getLicenseLabel(props.item.license)"
          :description="getFileType(props.item)"
          :image-url="getImagePath(props.item.thumbnail
            || props.item.cover, imageHover[props.index])"
          :box-size="{ width: 'calc(25% - 8rem/19 - (8rem/19/2))' }"
          :box-ratio="100"
          :box-text="generateBoxText(props.item.metadata)"
          class="linked-base-box"
          @mouseenter.native="changeVideoHoverState($event, props.index, true)"
          @mouseleave.native="changeVideoHoverState($event, props.index, false)"
          @select-triggered="filesSelected(props.item.id, $event, props.item.published, props.item.archive_URI)"
          @clicked="onAttachmentClicked(props.selectActive, props.item)">
          <template v-slot:top>
            <div class="status-icons">
              <base-icon
                v-if="props.item.published"
                name="eye"
                :title="capitalizeString($t('notify.publishd'))"
                :aria-title="capitalizeString($t('notify.publishd'))"
                :aria-description="publishedIconDescription(props.item.original)"
                class="status-icon" />
              <base-icon
                v-if="props.item.archive_id"
                name="archive-sheets"
                :title="capitalizeString($t('archival.archived'))"
                :aria-title="capitalizeString($t('archival.archived'))"
                :aria-description="publishedIconDescription(props.item.original)"
                class="status-icon" />
              <base-icon
                v-if="!props.item.archive_id && getArchivingMedia.includes(props.item.id)"
                name="archive-arrow"
                :title="capitalizeString($t('archival.submitted'))"
                :aria-title="capitalizeString($t('archival.submitted'))"
                :aria-description="publishedIconDescription(props.item.original)"
                class="status-icon" />
            </div>
          </template>
        </BaseImageBox>
      </template>
    </BaseResultBoxSection>

    <!-- PARENT ENTRIES -->
    <BaseResultBoxSection
      ref="parentSection"
      :entry-list="parentList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :option-button-text="$t('form-view.deleteParents')"
      :action-button-text="$t('form-view.deleteButton')"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.parentEntries')"
      :action="parentEntryAction"
      :is-loading="entriesLoading"
      :selected-list="selectedEntries"
      @set-action="setEntryAction('parentEntry')"
      @all-selected="selectEntries('parent', $event)"
      @submit-action="deleteLinked"
      @cancel-action="resetSelected">
      <template
        v-slot:result-box="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
          :selected="selectedEntries.map(entry => entry.id || entry).includes(props.item.id)"
          :box-size="{ width: 'calc(25% - 8rem/19 - (8rem/19/2))' }"
          :title="props.item.parent.title"
          :subtext="props.item.parent.subtitle"
          :description="props.item.description"
          :image-url="props.item.parent.image ? getImagePath(props.item.parent.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(props.item.id, $event)"
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
      ref="validationPopUp"
      v-if="showArchivalValidationPopUp"
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
import { userInfo } from '../mixins/userInfo';
import { capitalizeString, getApiUrl, getLangLabel } from '../utils/commonUtils';
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
      // text for message area of files (differs per action)
      fileText: '',
      // subtext for message area of files (differs per action)
      fileSubtext: '',
      // button text for files (differs per action)
      buttonText: '',
      // current action active for entries section
      entryAction: '',
      // current action active for entries section
      parentEntryAction: '',
      // entries selected
      selectedEntries: [],
      // files selected
      selectedFiles: [],
      // current action for files
      action: '',
      // variable specific for license action to store selected license
      licenseSelected: {},
      // to switch url during hover save hover state in this array
      imageHover: [],
      // timeout for requesting media again if there are still unconverted
      timeout: null,
      // toggle loader display, displayed during db requests
      entriesLoading: false,
      filesLoading: false,
      capitalizeString,
      // show/hide the archival unsaved pop-up
      showArchivalUnsavedPopUp: false,
      // show/hide the archival validation pop-up
      showArchivalValidationPopUp: false,
      // show/hide the archival licensing agreement pop-up
      showArchivalAgreementPopUp: false,
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
    /**
     * Returns an array with short file names (no path) + extension for currently selected files.
     */
    selectedFileNames() {
      try {
        const fileNames = [];
        // first filter out only objects where filename is selected
        // eslint-disable-next-line max-len
        const selObjects = this.getCurrentMedia.filter((obj) => this.selectedFiles.includes(obj.id));
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
      handler() {
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
    // function for using options (delete, change license, publish state, push to archive) for files
    async saveFileMeta(act) {
      this.filesLoading = true;
      // special case publish since publish / offline in one
      const action = act === 'publish' ? 'change' : act;
      // check if files were selected
      if (!this.selectedFiles.length) {
        // if not notify user that he needs to select files
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t(`notify.${action}`) }),
          text: this.$t('notify.selectForAction', {
            action: this.$t(`notify.${action}File`, { toTitleCase: false }),
            type: this.$tc('notify.media', 0, { toTitleCase: false }),
          }),
          type: 'error',
        });
        // check if a license was selected if action is license change
        // if not inform user he should select a license
      } else if (this.action === 'license' && this.licenseSelected.source === undefined) {
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
      } else if (this.action === 'archiveMedia' && !this.getArchiveMediaConsent) {
        this.runArchivalValidation();
      } else {
        // if all error checks pass actually do the action
        const [successIds, failIds] = await this.$store.dispatch('data/actionFiles', {
          list: this.selectedFiles,
          action: this.action,
          value: this.licenseSelected,
        });
        // and inform user of the fail / success
        this.informUser({
          successArr: successIds, failedArr: failIds, action, type: 'media',
        });
        if (successIds.length) {
          await this.fetchMedia();
          // check if action was delete and if yes propagate to parent to update user quota
          if (action === 'delete') {
            this.$emit('files-deleted');
          }
          // if the license of any archived asset has changed, update the store with
          // advice that the remote archive needs update
          if (action === 'license' && this.archivedMediaIds.length > 0
              && this.archivedAssetsChangedLicense(successIds)) {
            this.$store.commit('data/setIsArchiveChanged', true);
          }
        }
        // clear all variables after action
        this.action = '';
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
        this.entryAction = '';
        this.parentEntryAction = '';
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
      if (this.action !== 'publish') {
        if (selectAll) {
          // another special case: don't select files for archival if they were already archived
          if (this.action === 'archiveMedia' && archiveUri) {
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
      // or in the "submitted for archival" state
      if (this.isConverting || this.getArchivingMedia.length > 0) {
        this.timeout = setTimeout(() => {
          this.fetchMedia();
        }, 60000);
      }
    },
    setAction(val) {
      // close other selects
      this.entryAction = '';
      this.parentEntryAction = '';
      if (val) {
        this.action = val;
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
      this.action = '';
      this[`${type === 'entry' ? 'parentEntry' : 'entry'}Action`] = '';
      // clear entries
      this.selectedEntries = [];
      this[`${type}Action`] = 'delete';
    },
    resetSelected() {
      this.selectedEntries = [];
      this.selectedFiles = [];
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
          if (this.action === 'archiveMedia' && this.selectedFiles.length === 0) {
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
    publishedIconDescription(item) {
      return `${this.$t('form-view.file')} ${this.$t('form-view.filePublished', { file: this.getFileName(item) })}`;
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
      if (this.selectedFileNames && (this.selectedFileNames.length === this.selectedFiles.length)) {
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
      this.runArchivalValidation();
    },
    /**
     * Proceeds to the actual archival request after all the steps of the archival wizard
     * (validation, licensing agreement) have been completed.
     */
    proceedToArchival() {
      this.saveFileMeta('archiveMedia');
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
      if (this.action === 'archiveMedia' && item.archive_URI) return false;
      if (this.action === 'archiveMedia' && this.getArchivingMedia.includes(item.id)) return false;
      return true;
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
  .linked-base-box {
    cursor: pointer;
    .status-icons {
      max-width: 100%;
      position: absolute;
      background: radial-gradient(closest-side,
        rgba(255,255,255,1) 50%,
        rgba(255,255,255,0) 100%);
      right: 0;
      top: -$spacing-small;
      padding: $spacing-small $spacing-small;
      display: flex;
      flex-direction: column;
      .status-icon {
        height: $icon-medium;
        width: $icon-medium;
        margin: $spacing-small/2 $spacing-small;

        &:first-of-type {
          margin-top: $spacing-small;
        }
        &:last-child {
          margin-bottom: $spacing-small;
        }
      }
    }
  }
  .linked-base-box:nth-child(n + 5) {
    margin-top: $spacing;
  }
  .linked-base-box:not(:nth-child(4n)) {
    margin-right: $spacing;
  }
}
.license-dropdown {
  margin: $spacing auto 0 auto;
  text-align: left;
  max-width: 100%;
}
@media screen and (max-width: $tablet) {
  .attachment-area {
    .linked-base-box {
      // subtracted 0.01rem for edge
      flex: 0 0 calc(50% - #{$spacing-small} - 0.01rem);
    }
    .linked-base-box:nth-child(n + 3) {
      margin-top: $spacing;
    }
    .linked-base-box:not(:nth-child(4n)) {
      margin-right: 0;
    }
    .linked-base-box:not(:nth-child(2n)) {
      margin-right: $spacing;
    }
  }
}
</style>
