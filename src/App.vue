<template>
  <div id="app">
    <Welcome/>
  </div>
</template>

<script>
import Welcome from './components/Welcome';

export default {
  name: 'App',
  components: {
    Welcome,
  },
};
</script>

<style>
  #app {
    position: relative;
    margin: auto;
    text-align: center;
    padding-top: 200px;
  }
</style>
