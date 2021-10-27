import { mutations } from './mutations';
import { getters } from './getters';
import { actions } from './actions';
import { MainState } from './state';
import { auth } from '@/plugins/firebase';

// const defaultState = (): MainState => {
//   console.log(' Auth  object..');
//   console.log(auth);
//   let dill: MainState = {
//     isLoggedIn: auth !== null && auth.currentUser !== null ? true : null,
//     token: '',
//     logInError: false,
//     registerError: false,
//     userProfile: null,
//     dashboardMiniDrawer: false,
//     dashboardShowDrawer: true,
//     notifications: [],
//   };
//   return dill;
// };

const defaultState: MainState = {
  isLoggedIn: auth !== null && auth.currentUser !== null ? true : null,
  token: '',
  logInError: false,
  registerError: false,
  userProfile: null,
  dashboardMiniDrawer: false,
  dashboardShowDrawer: true,
  notifications: [],
};

export const mainModule = {
  state: defaultState,
  mutations,
  actions,
  getters,
};
