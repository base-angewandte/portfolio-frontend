<template>
  <div class="attachment-area">

    <!-- ATTACHED ENTRIES -->
    <div
      v-if="linkedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <BaseOptions
          :show-options="showEntryAction"
          @options-toggle="showEntryAction = $event">
          <template slot="beforeOptions">
            <h3
              v-if="showTitle"
              class="attachment-area-subheader">{{ $t('form-view.attachedEntries') }}</h3>
          </template>
          <template slot="options">
            <BaseButton
              v-if="!showEntryAction"
              :text="$t('form-view.deleteLinked')"
              icon-size="large"
              icon="waste-bin"
              button-style="single"
              class="attachment-options"
              @clicked="showEntryAction = true"/>
            <div
              v-else
              class="attachment-options">
              <BaseButton
                :text="$t('cancel')"
                icon-size="large"
                icon="remove"
                button-style="single"
                @clicked="showEntryAction = false"/>
              <BaseButton
                :text="$t('form-view.deleteButton')"
                icon-size="large"
                icon="save-file"
                button-style="single"
                @clicked="deleteLinked"/>
            </div>
          </template>
        </BaseOptions>
      </div>

      <!-- ACTION AREA -->
      <transition name="slide">
        <div
          v-if="showEntryAction"
          key="message-area"
          class="message-area">
          <div class="message-area-text">
            {{ $t('form-view.deleteLinkedText') }}
          </div>
          <div class="message-area-subtext">
            {{ $t('form-view.deleteLinkedSubtext') }}
          </div>
        </div>
      </transition>

      <!-- BOX AREA -->
      <div
        key="box-area"
        class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :selectable="!!showEntryAction"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
          :title="linked.to.title"
          :subtext="linked.to.subtitle"
          :description="linked.description"
          :image-url="linked.to.image ? getImagePath(linked.to.image) : ''"
          show-title
          class="linked-base-box"
          @select-triggered="entrySelected(linked.id, $event)"
          @clicked="goToLinked(linked.to.id)"/>

        <!-- ACTION BUTTON -->
        <BaseBoxButton
          v-if="!!showEntryAction"
          :text="$t('form-view.deleteLinked')"
          :box-size="{ width: 'calc(25% - 12px)' }"
          icon="save-file"
          box-style="small"
          class="linked-base-box"
          @clicked="deleteLinked"/>
      </div>
    </div>

    <!-- ATTACHED FILES -->
    <div
      v-if="attachedList.length"
      class="linked-area">

      <!-- HEADER ROW -->
      <div class="header-row">
        <BaseOptions
          :show-options="showFileAction"
          @options-toggle="fileText = action = ''; showFileAction = $event">
          <template slot="beforeOptions">
            <h3
              v-if="showTitle"
              class="attachment-area-subheader">{{ $t('form-view.attachedFiles') }}</h3>
          </template>
          <template slot="options">
            <div
              v-if="!fileText"
              class="attachment-options">
              <BaseButton
                :text="$t('form-view.changeLicense')"
                icon-size="large"
                icon="licence"
                button-style="single"
                @clicked="action = 'license'"/>
              <BaseButton
                :text="$t('form-view.publishMedia')"
                icon-size="large"
                icon="eye"
                button-style="single"
                @clicked="action = 'publish'"/>
              <BaseButton
                :text="$t('form-view.deleteMedia')"
                icon-size="large"
                icon="waste-bin"
                button-style="single"
                @clicked="action = 'delete'"/>
            </div>
            <div
              v-else
              class="attachment-options">
              <BaseButton
                :text="$t('cancel')"
                icon-size="large"
                icon="remove"
                button-style="single"
                @clicked="action = ''"/>
              <BaseButton
                :text="buttonText"
                icon-size="large"
                icon="save-file"
                button-style="single"
                @clicked="saveFileMeta"/>
            </div>
          </template>
        </BaseOptions>
      </div>

      <!-- ACTION AREA -->
      <transition name="slide">
        <div
          v-if="fileText"
          class="message-area">
          <div class="message-area-text">
            {{ fileText }}
          </div>
          <div class="message-area-subtext">
            {{ fileSubtext }}
          </div>
          <!-- TODO: replace this with skosmos project values! -->
          <BaseDropDown
            v-if="action === 'license'"
            :options="[{
                         label: 'CC-BY',
                         value: 'cc-by',
                       },
                       {
                         label: 'CC0',
                         value: 'cc0',
                       }
                       ,
                       {
                         label: $t('nolicense'),
                         value: 'no license',
                       }
            ]"
            :show-label="false"
            :label="$t('form-view.selectLicense')"
            :placeholder="$t('form-view.selectLicense')"
            v-model="licenseSelected"
            class="license-dropdown"/>
        </div>
      </transition>

      <!-- BOX AREA -->
      <div class="box-area">
        <BaseImageBox
          v-for="(attached, index) of attachedList"
          :show-title="true"
          :selectable="!!fileText"
          :selected="(action === 'publish' && attached.published)
          || selectedFiles.includes(attached.id)"
          :title="attached.original ? getFileName(attached.original) : attached.id"
          :subtext="attached.license ? attached.license.toUpperCase() : ''"
          :description="getFileType(attached)"
          :image-url="getImagePath(attached.thumbnail || attached.cover, imageHover[index])"
          :box-size="{ width: 'calc(25% - 0.43em - (0.43em/2))' }"
          :box-ratio="100"
          :box-text="generateBoxText(attached.metadata)"
          :key="attached.id"
          :class="['linked-base-box', { 'image-box': !!attached.thumbnail }]"
          @mouseenter.native="changeVideoHoverState($event, index, true)"
          @mouseleave.native="changeVideoHoverState($event, index, false)"
          @select-triggered="filesSelected(attached.id, $event, attached.published)"
          @clicked="$emit('show-preview', attached)">
          <template slot="top">
            <div
              v-if="attached.published"
              class="file-published">
              <EyeIcon
                aria-labelledby="title"
                class="published-icon">
                <title>Published</title>
                <desc>
                  {{ `file ${getFileName(attached.original)} was published` }}
                </desc>
              </EyeIcon>
            </div>
          </template>
        </BaseImageBox>

        <!-- ACTION BUTTON -->
        <BaseBoxButton
          v-if="action"
          :text="buttonText"
          :box-size="{ width: 'calc(25% - 12px)' }"
          icon="save-file"
          box-style="small"
          class="linked-base-box"
          @clicked="saveFileMeta"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BaseBoxButton, BaseImageBox, BaseButton, BaseDropDown,
} from 'base-ui-components';
import BaseOptions from './BaseOptions';
import EyeIcon from '../assets/icons/eye.svg';
import { userInfo } from '../mixins/userInfo';

export default {
  components: {
    BaseBoxButton,
    BaseDropDown,
    BaseImageBox,
    BaseButton,
    BaseOptions,
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
    showTitle: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      fileText: '',
      fileSubtext: '',
      buttonText: '',
      showEntryAction: false,
      showFileAction: false,
      selectedEntries: [],
      selectedFiles: [],
      publishFiles: [],
      action: '',
      licenseSelected: {},
      imageHover: [],
    };
  },
  computed: {
    isConverting() {
      console.log(this.attachedList.some(file => !file.metadata));
      return this.attachedList.some(file => !file.metadata);
    },
  },
  watch: {
    action(val) {
      if (val) {
        this.fileSubtext = this.$t(`form-view.${val}Subtext`);
        this.fileText = this.$t('form-view.fileActionText', { action: this.$t(`form-view.${val}Text`) });
        this.buttonText = this.$t(`form-view.${val}Button`);
      } else {
        this.fileText = '';
        this.publishFiles = [];
        this.selectedFiles = [];
      }
    },
    attachedList() {
      console.log('list changed!');
      // request media data again every minute if media are still converting
      if (this.isConverting) {
        /* eslint-disable-next-line */
        setTimeout(() => {
          this.fetchMedia();
        }, 1000);
      }
    },
  },
  methods: {
    changeVideoHoverState(event, index, value) {
      this.$set(this.imageHover, index, value);
    },
    async saveFileMeta() {
      // check if files were selected
      if ((this.action === 'publish' && !this.publishFiles.length) && !this.selectedFiles.length) {
        // if not notify user that he needs to select files
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t(`notify.${this.action}`) }),
          text: this.$t('notify.selectForAction', {
            action: this.$t(`notify.${this.action}File`),
            type: this.$tc('notify.media', 0),
          }),
          type: 'error',
        });
        // check if a license was selected if action is license change
        // if not inform user he should select a license
      } else if (this.action === 'license' && this.licenseSelected.value === undefined) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t('notify.license') }),
          text: this.$t('notify.selectLicense'),
          type: 'error',
        });
      } else {
        const [successIds, failIds] = await this.$store.dispatch('data/actionFiles', {
          list: this.action === 'publish' ? this.publishFiles : this.selectedFiles,
          action: this.action,
          value: this.licenseSelected.value,
        });
        this.informUser({
          successArr: successIds, failedArr: failIds, action: this.action, type: 'media',
        });
        if (successIds.length) {
          await this.fetchMedia();
        }
        // clear all variables after action
        this.action = '';
        this.selectedFiles = [];
        this.publishFiles = [];
        this.licenseSelected = {};
      }
    },
    async deleteLinked() {
      // check if user has selected entries
      if (this.selectedEntries.length) {
        await this.$parent.actionLinked({ list: this.selectedEntries, action: 'delete' });
        this.showEntryAction = false;
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
        this.publishFiles = this.publishFiles.filter(file => file.id !== objId);
        // check if the new state equals the state saved to db --> only add if not
        /* eslint-disable-next-line */
        if (sel !== published) {
          this.publishFiles.push({ id: objId, selected: sel });
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
      const matches = file.id.match(/^([a-z]):/);
      const type = matches && matches.length ? matches[1] : '';
      if (file.metadata && type) {
        if (type === 'i') {
          return this.$t('form-view.image');
        } if (type === 'v') {
          return this.$t('form-view.video');
        } if (type === 'a') {
          return this.$t('form-view.audio');
        }
        return this.$t('form-view.document');
      }
      return this.$t('form-view.fileConverting');
    },
    getImagePath(iconName, hover) {
      if (iconName && iconName.gif) {
        return `${process.env.PORTFOLIO_HOST}${hover ? iconName.gif : iconName.jpg}`;
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
        return `${process.env.PORTFOLIO_HOST}${iconName}`;
      }
      return '';
    },
    generateBoxText(metadata) {
      const wantedAttributes = ['FileSize', 'ImageSize'];
      if (metadata) {
        return Object.keys(metadata).filter(key => wantedAttributes.includes(key))
          .map(data => `${data}: ${metadata[data].val}`);
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
  },
};
</script>

<style lang="scss" scoped>
  @import "../styles/variables.scss";

  .attachment-area {
    .attachment-area-subheader {
      font-size: $font-size-regular;
      color: $font-color-second;
      font-weight: normal;
      margin: $spacing;

    }

    .linked-area {

      .header-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .attachment-options {
          display: flex;
        }
      }

      .box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

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

        .image-box {
          cursor: pointer;
        }
      }
    }

    .message-area {
      margin-bottom: $spacing-large;
      text-align: center;
      color: $font-color-second;
      backface-visibility: hidden;
      z-index: 1;

      .message-area-text {
        font-size: $font-size-large;
      }

      .message-area-subtext {
        font-size: $font-size-small;
      }

      .license-dropdown {
        margin: $spacing auto 0 auto;
        text-align: left;
      }
    }

    .slide-enter-active {
      transition: all .5s ease-in-out;
    }

    .slide-enter {
      opacity: 0;
      transform: translateY(-#{$spacing});
    }
  }

  @media screen and (max-width: $mobile) {
    .attachment-area {
      .attachment-area-subheader {
      }

      .linked-area {

        .box-area {

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
    }
  }
</style>
