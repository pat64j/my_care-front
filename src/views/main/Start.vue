<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { store } from '@/store';
import { dispatchCheckLoggedIn, dispatchAuthCheck } from '@/store/main/actions';
import { readIsLoggedIn } from '@/store/main/getters';
import { auth } from '@/plugins/firebase';


const startRouteGuard = async (to, from, next) => {
  await dispatchAuthCheck(store);
  await dispatchCheckLoggedIn(store);

  if (readIsLoggedIn(store)) {
    if (to.path === '/login' || to.path === '/') {
      next('/main');
    } else {
      next();
    }
  } else if (readIsLoggedIn(store) === false) {
    console.log('readIsLoggedIn(store) ======= false');
    if (to.path === '/' || (to.path as string).startsWith('/main')) {
      next('/login');
    } else {
      next();
    }
  }
};

@Component
export default class Start extends Vue {
  public  async beforeRouteEnter(to, from, next) {
    console.log('before each received.');
    console.log(auth.currentUser);
    await startRouteGuard(to, from, next);
  }

  public beforeRouteUpdate(to, from, next) {
    startRouteGuard(to, from, next);
  }
}
</script>
