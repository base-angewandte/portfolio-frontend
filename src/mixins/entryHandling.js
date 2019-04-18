/* eslint-disable-next-line */
export const entryHandlingMixin = {
  methods: {
    confirmAction({ action, entries }) {
      const actionText = this.$t(`notify.${action}`);
      this.$store.commit('data/setSelected', entries);
      const titles = entries.map(entry => entry.title);
      this.$store.commit('data/setPopUp', {
        show: true,
        header: `${this.$tc('notify.entryActionTitle', titles.length, { action: actionText })}?`,
        text: `${this.$tc('notify.entryActionText', titles.length, { action: actionText })}<br>${titles.join(',<br>')}`,
        icon: action === 'delete' ? 'waste-bin' : 'eye',
        buttonTextRight: this.$tc('notify.entryActionTitle', titles.length, { action: actionText }),
        actionRight: () => this.action(action),
      });
    },
  },
};
