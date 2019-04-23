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
    async actionEntries(action) {
      let success = [];
      let failed = [];
      let noAction = [];
      if (action === 'delete') {
        [success, failed] = await this.$store.dispatch('data/deleteEntries');
      } else if (action === 'publish') {
        [success, failed, noAction] = await this.$store.dispatch('data/modifyEntries', { prop: 'published', value: true });
      } else if (action === 'offline') {
        [success, failed, noAction] = await this.$store.dispatch('data/modifyEntries', { prop: 'published', value: false });
      }
      const actionedNumber = success.length;
      if (actionedNumber) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.entrySuccessTitle', { action: this.$t(`notify.${action}`) }),
          text: this.$tc('notify.entrySuccessSubtext', actionedNumber, { count: actionedNumber, action: this.$t(`notify.${action}d`) }),
          type: 'success',
        });
      }
      if (failed.length) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.entryFailTitle', { action: this.$t(`notify.${action}`) }),
          text: `${this.$tc('notify.entryFailSubtext', 0, { action: this.$t(`notify.${action}d`) })} ${failed.join(', ')}`,
          type: 'error',
        });
      }
      if (noAction.length) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.noAction'),
          text: `${this.$t('notify.noActionList', { action: this.$t(`notify.${action}d`) })} ${noAction.join(', ')}`,
          type: 'error',
        });
      }
      this.$store.commit('data/setSelected', []);
      this.$store.commit('data/hidePopUp');
    },
  },
};
