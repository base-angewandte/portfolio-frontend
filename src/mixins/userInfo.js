/* eslint-disable-next-line */
export const userInfo = {
  methods: {
    /**
     * @param successArr: an array with all successfully modified items
     *  (ids sufficient, will only display number)
     * @param failedArr: an array with all failed items (ids or name/title strings)
     * @param noActionArr: array with items no action was taken on
     * @param action: type of action (e.g. publish, delete)
     * @param type: item type (entries, files or links)
     * @param listEntries: flag to specify if entries should be listed for failed
     * @param entryCount: provide number to steer if info text is displayed in
     *  singular or plural (0 will display plural)
     */
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
            action: this.$t(`notify.${action}d`, { toTitleCase: false }),
            type: this.$tc(`notify.${type}`, actionedNumber, { toTitleCase: false }),
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
            action: this.$t(`notify.${action}d`, { toTitleCase: false }),
            type: `${this.$tc(`notify.${type}`, failedNumber, { toTitleCase: false })} ${listEntries ? failedArr.join(', ') : ''}`,
          }),
          type: 'error',
        });
      }
      if (noActionArr.length) {
        this.$notify({
          group: 'request-notifications',
          title: this.$t('notify.noAction'),
          text: `${this.$t('notify.noActionList', {
            action: this.$t(`notify.${action}d`, { toTitleCase: false }),
          })} ${noActionArr.join(', ')}`,
          type: 'error',
        });
      }
    },
  },
};
