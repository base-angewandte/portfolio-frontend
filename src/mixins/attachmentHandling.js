import { userInfo } from './userInfo';

/* eslint-disable-next-line */
export const attachmentHandlingMixin = {
  mixins: [userInfo],
  methods: {
    async actionLinked({ list, action }) {
      const { attachmentArea } = this.$refs;
      if (attachmentArea) {
        attachmentArea.entriesLoading = true;
      }
      const fromId = this.$store.getters['data/getCurrentItemId'];
      const parentEntries = this.$store.getters['data/getLinkedParents'];
      const failArr = [];
      const successArr = [];
      let filteredList = list;
      // filter out entries that are already parents and inform user about it
      const alreadyParents = parentEntries.filter(parent => list.includes(parent.parent.id));
      if (alreadyParents.length) {
        filteredList = list.filter(linkId => !parentEntries
          .map(parent => parent.parent.id).includes(linkId));
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.linkingNotPossible'),
          text: `${this.$tc('notify.parentsAlready', alreadyParents.length)}: "${alreadyParents.map(parent => parent.parent.title).join('", "')}"`,
          type: 'info',
          duration: 8000,
        });
      }
      await Promise.all(filteredList.map(relationId => new Promise(async (resolve) => {
        try {
          if (action === 'save') {
            const data = { from_entry: fromId, to_entry: relationId };
            await this.$store.dispatch('PortfolioAPI/post', { kind: 'relation', data });
          } else if (action === 'delete') {
            await this.$store.dispatch('PortfolioAPI/delete', { kind: 'relation', id: relationId });
          }
          successArr.push(relationId);
        } catch (e) {
          console.error(e);
          failArr.push(relationId);
        }
        resolve();
      })));
      // TODO: currently only number of failed links no title - is this good enough?
      this.informUser({
        failedArr: failArr,
        successArr,
        type: 'link',
        action,
      });
      // fetch entry new to update relations
      try {
        const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: fromId });
        this.$store.commit('data/setLinked', { list: entry.relations || [], replace: true });
        this.$store.commit('data/setLinkedParents', { list: entry.parents });
      } catch (e) {
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.fetchLinkedFail'),
          type: 'error',
        });
      }
      if (attachmentArea) {
        attachmentArea.entriesLoading = false;
      }
    },
  },
};
