import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../views/Dashboard';
import FormView from '../views/FormView';
import NotFoundComponent from '../views/EntryNotFound';
import NetworkError from '../views/Error';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.VUE_APP_PREFIX,
  routes: [
    {
      path: '*',
      component: NotFoundComponent,
    },
    {
      path: '/error',
      component: NetworkError,
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'not-found',
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
            if (!process.env.VUE_APP_LOCALES
              .includes(lang)) return next(process.env.VUE_APP_DEFAULT_LOCALE);
            return next(path);
          },
          children: [
            {
              path: 'not-found',
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
