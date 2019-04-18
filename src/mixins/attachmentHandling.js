/* eslint-disable-next-line */
export const attachmentHandlingMixin = {
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
      const numberOfFailedLinks = failArr.length;
      if (numberOfFailedLinks) {
        // TODO: currently only number of failed links no title - is this good enough?
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.linkingErrorTitle'),
          text: this.$tc('notify.linkingErrorSubtext', numberOfFailedLinks, { count: numberOfFailedLinks }),
          type: 'error',
        });
      }
      // fetch entry new to update relations
      try {
        const entry = await this.$store.dispatch('PortfolioAPI/get', { kind: 'entry', id: fromId });
        this.$store.commit('data/setLinked', { list: entry.relations || [], replace: true });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
