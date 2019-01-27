<template>
  <div>
    <div
      key="file-area"
      class="file-boxes mobile-hidden">
      <BaseDropBox
        key="addEntry"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)' }"
        icon="camera"
        text="Vorhandenen Eintrag hinzufügen"
        subtext="(Click oder Drag'n Drop)"
        class="file-boxes-margin"
        @dropped="droppedEntries($event)"
        @clicked="openEntrySelect"/>
      <BaseBoxButton
        key="addNew"
        :show-plus="true"
        :box-size="{ width: 'calc(25% - 8px)'}"
        icon="sheet-empty"
        text="Neuen Eintrag anhängen"
        class="file-boxes-margin"
        @clicked="openNewForm"/>
      <label class="file-select">
        <BaseDropBox
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
      <BaseMenuEntry
        id="addFile"
        key="mobile-addFile"
        icon="sheet-plus"
        title="Vorhandenen Eintrag hinzufügen" />
      <BaseMenuEntry
        id="addNew"
        key="mobile-addNew"
        icon="sheet-plus"
        title="Neuen Eintrag anhängen"
        @activated="openNewForm"/>
      <BaseMenuEntry
        id="addExisting"
        key="mobile-addExisting"
        icon="sheet-plus"
        title="Datei anhängen"/>
    </div>
  </div>
</template>

<script>
import {
  BaseDropBox,
  BaseMenuEntry,
  BaseBoxButton,
} from 'base-components';

export default {
  components: {
    BaseBoxButton,
    BaseDropBox,
    BaseMenuEntry,
  },
};
</script>

<style lang="scss" scoped>

</style>
