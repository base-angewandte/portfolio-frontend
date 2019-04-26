/* eslint-disable-next-line */
export const userInfo = {
  methods: {
    informUser({
      successArr = [],
      failedArr = [],
      noActionArr = [],
      action, type,
      listEntries = false,
      entryCount,
    }) {
      const actionedNumber = successArr.length;
      if (actionedNumber) {
        // inform user of successfully saved meta info / deleted files
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionSuccessTitle', { action: this.$t(`notify.${action}`) }),
          text: this.$tc('notify.actionSuccessSubtext', entryCount >= 0 ? entryCount : actionedNumber, {
            count: actionedNumber,
            action: this.$t(`notify.${action}d`),
            type: this.$tc(`notify.${type}`, actionedNumber),
          }),
          type: 'success',
        });
      }
      const failedNumber = failedArr.length;
      if (failedNumber) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.actionFailed', { action: this.$t(`notify.${action}`) }),
          text: this.$tc('notify.actionFailSubtext', failedNumber, {
            count: failedNumber,
            action: this.$t(`notify.${action}d`),
            type: `${this.$tc(`notify.${type}`, failedNumber)}\n${listEntries ? failedArr.join(',\n') : ''}`,
          }),
          type: 'error',
        });
      }
      if (noActionArr.length) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.noAction'),
          text: `${this.$t('notify.noActionList', {
            action: this.$t(`notify.${action}d`),
          })}\n${noActionArr.join(',\n')}`,
          type: 'error',
        });
      }
    },
  },
};
