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
      @submit-action="deleteLinked">
      <template
        slot="attached-box"
        slot-scope="props">
        <BaseImageBox
          :key="props.item.id"
          :selectable="props.selectActive"
          :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
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
      @submit-action="saveFileMeta">
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
          :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
          :box-ratio="100"
          :box-text="generateBoxText(props.item.metadata)"
          class="linked-base-box"
          @mouseenter.native="changeVideoHoverState($event, props.index, true)"
          @mouseleave.native="changeVideoHoverState($event, props.index, false)"
          @select-triggered="filesSelected(props.item.id, $event, props.item.published)"
          @clicked="$emit('show-preview', props.item)">
          <template slot="top">
            <div
              v-if="props.item.published"
              class="file-published">
              <EyeIcon
                aria-labelledby="title"
                class="published-icon">
                <title>Published</title>
                <desc>
                  {{ `file ${getFileName(props.item.original)} is released for publication` }}
                </desc>
              </EyeIcon>
            </div>
          </template>
        </BaseImageBox>
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
import { setLangLabels, getApiUrl, getLangLabel } from '../utils/commonUtils';
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
  },
  data() {
    return {
      fileText: '',
      fileSubtext: '',
      buttonText: '',
      entryAction: '',
      selectedEntries: [],
      selectedFiles: [],
      action: '',
      licenseSelected: {},
      imageHover: [],
      timeout: null,
      entriesLoading: false,
      filesLoading: false,
    };
  },
  computed: {
    isConverting() {
      return this.attachedList.some(file => !file.metadata);
    },
    licenses() {
      return ([{
        label: setLangLabels('nolicense', this.$i18n.availableLocales),
        source: '',
      }]).concat(this.$store.getters['data/getPrefetchedTypes']('medialicenses', 'source'));
    },
  },
  watch: {
    attachedList() {
      this.checkConverting();
    },
  },
  mounted() {
    this.checkConverting();
  },
  destroyed() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  },
  methods: {
    changeVideoHoverState(event, index, value) {
      this.$set(this.imageHover, index, value);
    },
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
        const [successIds, failIds] = await this.$store.dispatch('data/actionFiles', {
          list: this.selectedFiles,
          action: this.action,
          value: this.licenseSelected,
        });
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
    async deleteLinked() {
      this.entriesLoading = true;
      // check if user has selected entries
      if (this.selectedEntries.length) {
        this.$refs.linkedSection.attachmentsLoading = true;
        await this.$parent.actionLinked({ list: this.selectedEntries, action: 'delete' });
        this.entryAction = '';
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
    entrySelected(objId, sel) {
      if (sel) {
        this.selectedEntries.push(objId);
      } else {
        this.selectedEntries = this.selectedEntries.filter(entryId => entryId !== objId);
      }
    },
    filesSelected(objId, sel, published) {
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
    getFileName(file) {
      if (file) {
        return file.split('/').pop();
      }
      return '';
    },
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
    getImagePath(iconName, hover) {
      if (iconName && iconName.gif) {
        return getApiUrl(hover ? iconName.gif : iconName.jpg);
      }
      if (iconName) {
        // for local images
        // TODO: remove for production!
        if (iconName.includes('images')) {
          const match = /\/assets\/images\/(\w+\.\w+)$/.exec(iconName);
          /* eslint-disable-next-line */
          return require(`@/assets/images/${match[1]}`);
        } if (iconName.includes('http')) {
          return iconName;
        }
        return getApiUrl(iconName);
      }
      return '';
    },
    generateBoxText(metadata) {
      const wantedAttributes = ['FileSize', 'ImageSize', 'Title', 'Artist', 'Year'];
      if (metadata) {
        return Object.keys(metadata).filter(key => wantedAttributes.includes(key))
          .map(data => `${metadata[data].val}`);
      }
      return [];
    },
    goToLinked(id) {
      this.$store.commit('data/deleteLastParentItem');
      this.$router.push(`/entry/${id}`);
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

    .linked-base-box:nth-of-type(n + 5) {
      margin-top: $spacing;
    }

    .linked-base-box:not(:nth-child(4n)) {
      margin-right: $spacing;
    }
  }

  .license-dropdown {
    margin: $spacing auto 0 auto;
    text-align: left;
  }

  @media screen and (max-width: $tablet) {
    .attachment-area {

      .linked-base-box {
        flex: 0 0 calc(50% - #{$spacing-small});
      }

      .linked-base-box:nth-of-type(n + 3) {
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
