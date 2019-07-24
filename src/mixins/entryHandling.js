import { userInfo } from './userInfo';

/* eslint-disable-next-line */
export const entryHandlingMixin = {
  mixins: [userInfo],
  methods: {
    confirmAction({ action, entries }) {
      const actionText = this.$t(`notify.${action}`);
      this.$store.commit('data/setSelected', entries);
      const titles = entries.map(entry => entry.title
        .replace(/</g, '\\<')
        .replace(/>/g, '\\>'));
      this.$store.commit('data/setPopUp', {
        show: true,
        header: `${this.$tc('notify.entryActionTitle', titles.length, { action: actionText })}?`,
        textTitle: this.$tc('notify.entryActionText', titles.length, { action: actionText }),
        textList: titles,
        icon: action === 'delete' ? 'waste-bin' : 'eye',
        buttonTextRight: this.$tc('notify.entryActionTitle', titles.length, { action: actionText }),
        actionRight: () => this.action(action),
      });
    },
    async actionEntries(action) {
      this.$store.commit('data/setPopUpLoading', true);
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
      this.$store.commit('data/setPopUpLoading', false);
      this.informUser({
        successArr: success,
        failedArr: failed,
        noActionArr: noAction,
        action,
        type: 'entry',
        listEntries: true,
      });
      this.$store.commit('data/setSelected', []);
      this.$store.commit('data/hidePopUp');
    },
  },
};
