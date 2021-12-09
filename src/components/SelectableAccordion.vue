<template>
  <div>
    <base-expand-row
      v-for="(item, index) in list"
      :key="item.id"
      :title="item.title"
      :subtitle="item.subtitle"
      :is-selectable="true"
      :is-selected="internalList[index].selected"
      @selected="selectItem(index, $event)">
      <slot
        :item="item" />
    </base-expand-row>
  </div>
</template>

<script>

export default {
  name: 'SelectableAccordion',
  props: {
    /**
     * The array of objects with which to populate the accordion.
     * Each object is expected to have the following properties:
     * - required: 'id'
     * - optional: 'title', 'subtitle', 'selected', 'responsible', 'year'
     */
    list: {
      type: Array,
      default: () => [],
    },
    /**
     * An array with object ids that should appear selected.
     */
    selectedList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // Stores internally necessary props in separate array to prevent issues with
      // outside store mutations
      internalList: [],
    };
  },
  watch: {
    list() {
      this.setInternalVar();
    },
    selectedList() {
      this.setInternalVar();
    },
  },
  created() {
    this.setInternalVar();
  },
  methods: {
    selectItem(index, selected) {
      this.$set(this.internalList[index], 'selected', selected);
      /**
       * event emitted when entry is clicked - returns the index and the row's
       * selected state (true/false)
       *
       * @event selected
       * @type { Object }
       */
      this.$emit('selected', { index, selected });
    },
    setInternalVar() {
      this.internalList = this.list.map((entry) => ({
        ...{
          selected: entry.selected || this.selectedList.includes(entry.id),
        },
      }));
    },
  },
};
</script>
