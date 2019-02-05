import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../components/Dashboard';
import FormView from '../components/FormView';
import Login from '../components/Login';
import NotFoundComponent from '../components/NotFoundComponent';

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
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
});
