<template>
  <div class="attachment-area">
    <!-- ATTACHED ENTRIES -->
    <AttachmentsSection
      ref="linkedSection"
      :attached-list="linkedList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :option-button-text="$t('form-view.deleteLinked')"
      :action-button-text="$t('form-view.deleteButton')"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.attachedEntries')"
      :action="entryAction"
      :is-loading="entriesLoading"
      @set-action="entryAction = 'delete'"
      @submit-action="deleteLinked"
      @cancel-action="resetSelected">
      <template
        slot="attached-box"
        slot-scope="props">
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
    </AttachmentsSection>

    <!-- ATTACHED FILES -->
    <AttachmentsSection
      ref="fileSection"
      :attached-list="attachedList"
      :message-text="fileText"
      :message-subtext="fileSubtext"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.attachedFiles')"
      :action-button-text="buttonText"
      :action="action"
      :is-loading="filesLoading"
      @set-action="setAction"
      @submit-action="saveFileMeta"
      @cancel-action="resetSelected">
      <!-- SLOT FOR ADDITIONAL OPTIONS NEEDED FOR FILES -->
      <template
        slot="option-buttons"
        slot-scope="scope">
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
      <template
        slot="attached-box"
        slot-scope="props">
        <BaseImageBox
          :key="props.item.id"
          :show-title="true"
          :selectable="props.selectActive"
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
          @select-triggered="filesSelected(props.item.id, $event, props.item.published)"
          @clicked="$emit('show-preview', props.item)">
          <div
            slot="top">
            <template v-if="props.item.published">
              <div class="file-published">
                <EyeIcon
                  :aria-labelledby="'title_' + props.item.id"
                  class="published-icon">
                  <title :id="'title_' + props.item.id">
                    Published
                  </title>
                  <desc>
                    {{ `file ${getFileName(props.item.original)} is released for publication` }}
                  </desc>
                </EyeIcon>
              </div>
            </template>
          </div>
        </BaseImageBox>
      </template>
    </AttachmentsSection>

    <!-- PARENT ENTRIES -->
    <AttachmentsSection
      ref="parentSection"
      :attached-list="parentList"
      :message-text="$t('form-view.deleteLinkedText')"
      :message-subtext="$t('form-view.deleteLinkedSubtext')"
      :option-button-text="$t('form-view.deleteParents')"
      :action-button-text="$t('form-view.deleteButton')"
      :cancel-text="$t('cancel')"
      :header-text="$t('form-view.parentEntries')"
      :action="parentEntryAction"
      :is-loading="entriesLoading"
      @set-action="parentEntryAction = 'delete'"
      @submit-action="deleteLinked"
      @cancel-action="resetSelected">
      <template
        slot="attached-box"
        slot-scope="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
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
    </AttachmentsSection>
  </div>
</template>

<script>
import {
  BaseImageBox, BaseButton, BaseDropDown,
} from 'base-ui-components';
import EyeIcon from '../assets/icons/eye.svg';
import { userInfo } from '../mixins/userInfo';
import { getApiUrl, getLangLabel } from '../utils/commonUtils';
import AttachmentsSection from './AttachmentsSection';

export default {
  components: {
    AttachmentsSection,
    BaseDropDown,
    BaseImageBox,
    BaseButton,
    EyeIcon,
  },
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
    };
  },
  computed: {
    // variable for checking if there are still unconverted files
    isConverting() {
      return this.attachedList.some(file => !file.metadata);
    },
    licenses() {
      return this.$store.getters['data/getPrefetchedTypes']('medialicenses', 'source');
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
    // function for using options (delete, change license, publish state) for files
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
            action: this.$t(`notify.${action}File`),
            type: this.$tc('notify.media', 0),
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
        }
        // clear all variables after action
        this.action = '';
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
        this.entryAction = '';
        this.parentEntryAction = '';
        this.selectedEntries = [];
      } else {
        // notify user to select entries
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.delete') }),
          text: this.$t('notify.selectForAction', {
            action: this.$t('notify.deleteFile'),
            type: this.$tc('notify.entry', 0),
          }),
          type: 'error',
        });
      }
      this.entriesLoading = false;
    },
    // function triggered upon entry selection updating selectedEntries accordingly
    entrySelected(objId, sel) {
      if (sel) {
        this.selectedEntries.push(objId);
      } else {
        this.selectedEntries = this.selectedEntries.filter(entryId => entryId !== objId);
      }
    },
    // function triggered if medium selected
    filesSelected(objId, sel, published) {
      // special case publish, for all others just update selectedFiles accordingly
      if (this.action !== 'publish') {
        if (sel) {
          this.selectedFiles.push(objId);
        } else {
          this.selectedFiles = this.selectedFiles.filter(entryId => entryId !== objId);
        }
      } else {
        // filter item from array in case it was already added previously
        // easier than replacing the selected value for relevant item
        this.selectedFiles = this.selectedFiles.filter(file => file.id !== objId);
        // check if file was selected and add it with opposite value
        /* eslint-disable-next-line */
        if (sel) {
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
      if (iconName && iconName.gif) {
        // use it if hover state is true else use still image
        return getApiUrl(hover ? iconName.gif : iconName.jpg);
      }
      // check if there is url provided
      if (iconName) {
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
        return Object.keys(metadata).filter(key => wantedAttributes.includes(key))
          .map(data => `${metadata[data].val}`);
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
    setAction(val) {
      if (val) {
        this.action = val;
        this.fileSubtext = this.$t(`form-view.${val}Subtext`);
        this.fileText = this.$t('form-view.fileActionText', { action: this.$t(`form-view.${val}Text`) });
        this.buttonText = this.$t(`form-view.${val}Button`);
      } else {
        this.fileText = '';
        this.selectedFiles = [];
      }
    },
    resetSelected() {
      this.selectedEntries = [];
      this.selectedFiles = [];
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {

    .linked-base-box {
      cursor: pointer;

      .file-published {
        height: $icon-max;
        width: $icon-max;
        position: absolute;
        border-radius: $icon-max/2;
        background: radial-gradient(closest-side,
          rgba(255,255,255,1) 50%,
          rgba(255,255,255,0) 100%);
        right: -$spacing-small;
        top: -$spacing-small;
        display: flex;

        .published-icon {
          height: $icon-medium;
          max-width: $icon-medium;
          margin: auto;
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
