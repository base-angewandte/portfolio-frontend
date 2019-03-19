import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../components/Dashboard';
import FormView from '../components/FormView';
import NotFoundComponent from '../components/NotFoundComponent';
import store from '../store';
import { i18n } from '../plugins/i18n';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: '/portfolio/',
  routes: [
    {
      path: '*',
      component: NotFoundComponent,
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'entry/:id',
          name: 'Entry',
          component: FormView,
        },
        {
          path: 'new',
          name: 'newEntry',
          component: FormView,
        },
        {
          path: ':lang',
          component: {
            template: '<router-view></router-view>',
          },
          beforeEnter(to, from, next) {
            const { lang } = to.params;
            const path = to.path.replace(/^\/[a-z]{2}/, '');
            if (!['en', 'de'].includes(lang)) return next('en');
            if (lang) {
              import(`@/locales/${lang}.json`).then((msgs) => {
                i18n.setLocaleMessage(lang, msgs.default || msgs);
                sessionStorage.setItem('lang', lang);
                store.commit('SkosmosAPI/setLang', lang);
                i18n.locale = lang;
                return next(path);
              });
            }
            return next(path);
          },
          children: [
            {
              path: 'entry/:id',
              name: 'EntryLang',
              component: FormView,
            },
            {
              path: 'new',
              name: 'newEntryLang',
              component: FormView,
            },
          ],
        },
      ],
    },
  ],
});
