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
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'item/:id',
          name: 'Item',
          component: FormView,
        },
        {
          path: 'newItem',
          name: 'newItem',
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
