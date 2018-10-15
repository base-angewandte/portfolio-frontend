import Vue from 'vue';
import Router from 'vue-router';
import Landing from '../components/Landing';
import FormView from '../components/FormView';
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
      name: 'Landing',
      component: Landing,
    },
    {
      path: '/item/:id',
      name: 'Item',
      component: FormView,
    },
    {
      path: '/newItem',
      name: 'newItem',
      component: FormView,
    },
  ],
});
