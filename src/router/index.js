import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../views/Dashboard';
import FormView from '../views/FormView';
import NotFoundComponent from '../views/EntryNotFound';
import NetworkError from '../views/404Error';
import store from '../store';
import { i18n } from '../plugins/i18n';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.APP_PREFIX,
  routes: [
    {
      path: '*',
      component: NotFoundComponent,
    },
    {
      path: '/404',
      component: NetworkError,
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'notFound',
          name: 'EntryNotFound',
          component: NotFoundComponent,
        },
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
          async beforeEnter(to, from, next) {
            const { lang } = to.params;
            const path = to.path.replace(/^\/[a-z]{2}/, '');
            if (!process.env.LOCALES.includes(lang)) return next(process.env.DEFAULT_LOCALE);
            if (lang) {
              await import(`@/locales/${lang}.json`).then((msgs) => {
                i18n.setLocaleMessage(lang, msgs.default || msgs);
                localStorage.setItem('lang', lang);
                store.commit('PortfolioAPI/setLang', lang);
                i18n.locale = lang;
                // need to fetch schemas in correct language again
                store.dispatch('PortfolioAPI/fetchSchemas');
                return next(path);
              });
            }
            return next(path);
          },
          children: [
            {
              path: 'notFound',
              name: 'EntryNotFoundLang',
              component: NotFoundComponent,
            },
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
