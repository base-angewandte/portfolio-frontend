import { userInfo } from './userInfo';

/* eslint-disable-next-line */
export const attachmentHandlingMixin = {
  mixins: [userInfo],
  methods: {
    async actionLinked({ list, action }) {
      const fromId = this.$store.getters['data/getCurrentItemId'];
      const failArr = [];
      await Promise.all(list.map(relationId => new Promise(async (resolve) => {
        try {
          if (action === 'save') {
            const data = { from_entry: fromId, to_entry: relationId };
            await this.$store.dispatch('PortfolioAPI/post', { kind: 'relation', data });
          } else if (action === 'delete') {
            await this.$store.dispatch('PortfolioAPI/delete', { kind: 'relation', id: relationId });
          }
        } catch (e) {
          console.error(e);
          failArr.push(relationId);
        }
        resolve();
      })));
      // TODO: currently only number of failed links no title - is this good enough?
      this.informUser({
        failedArr: failArr,
        type: 'entry',
        action,
      });
      // fetch entry new to update relations
      try {
        const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: fromId });
        await this.$store.dispatch('data/setLinkedEntries', { list: entry.relations || [], replace: true });
      } catch (e) {
        console.error(e);
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.somethingWrong'),
          text: this.$t('notify.fetchLinkedFail'),
          type: 'error',
        });
      }
    },
  },
};
