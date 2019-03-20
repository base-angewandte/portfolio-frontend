import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../views/Dashboard';
import FormView from '../views/FormView';
import NotFoundComponent from '../views/NotFoundComponent';
import store from '../store';
import { i18n } from '../plugins/i18n';
import prodEnv from '../../config/prod.env';

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
            if (!prodEnv.LOCALES.includes(lang)) return next(prodEnv.DEFAULT_LOCALE);
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
