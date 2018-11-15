<template>
  <div class="attachment-area">
    <div class="linked-area">
      <h3 class="attachment-area-subheader">Verknüpfte Einträge</h3>
      <div class="box-area">
        <BaseImageBox
          v-for="linked of linkedList"
          :key="linked.id"
          :box-size="{ width: 'calc(25% - 12px)' }"
          :title="linked.title"
          show-title
          class="linked-base-box"/>
      </div>
    </div>
    <div class="linked-area">
      <h3 class="attachment-area-subheader">Angehängte Dateien</h3>
      <div class="box-area">
        <BaseImageBox
          v-for="attached of attachedList"
          :key="attached.id"/>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseImageBox } from 'base-components';

export default {
  components:{
    BaseImageBox,
  },
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

      .box-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .linked-base-box {
          margin-bottom: $spacing;
        }

        .linked-base-box:not(:nth-child(4n)) {
          margin-right: $spacing;
        }
      }
    }
  }
</style>
