<template>
  <div>
    <base-expand-row
      v-for="(item, index) in list"
      :key="item.id"
      :title="item.title"
      :subtitle="item.subject"
      :is-selectable="true"
      :is-selected="internalList[index].selected"
      :is-expanded="internalList[index].expanded"
      @selected="selectItem(index, $event)"
      @expanded="onExpanded(index, $event)">
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
     * Each object is expected to have the following properties: 'id', 'title', 'subtitle'
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
    /**
     * Specifies how the accordion should expand. Valid values:
     * `single` - only one flap at a time can be open
     * `multiple` - any number of flaps can be open
     */
    expandMode: {
      type: String,
      default: 'single',
    },
  },
  data() {
    return {
      // Stores info about whether each entry in accordeon is selected or expanded.
      internalList: [],
    };
  },
  watch: {
    list() {
      this.internalList = [];
      this.setInternalList();
    },
    selectedList() {
      this.setInternalList();
    },
  },
  created() {
    this.setInternalList();
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
    /**
     * Fires when any of accordion's flaps changes the expanded/collapsed state.
     */
    onExpanded(index, expanded) {
      if (this.expandMode === 'single' && expanded === true) {
        // collapse all rows except the current one
        for (let i = 0; i < this.internalList.length; i += 1) {
          if (i === index) {
            this.$set(this.internalList[i], 'expanded', true);
          } else {
            this.$set(this.internalList[i], 'expanded', false);
          }
        }
      } else {
        this.$set(this.internalList[index], 'expanded', expanded);
      }
    },
    /**
     * Fires when the component is instantiated, or when `list` changes,
     * or when `selectedList` changes. This method updates `internalList`
     * to reflect the state that each accordion flap should be in: selected and/or expanded.
     */
    setInternalList() {
      const temp = [];
      for (let i = 0; i < this.list.length; i += 1) {
        temp[i] = {
          selected: this.selectedList.includes(this.list[i].id),
          expanded: this.internalList[i] ? this.internalList[i].expanded : false,
        };
      }
      this.internalList = temp;
    },
  },
};
</script>
