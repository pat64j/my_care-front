import { api } from '@/api';
import router from '@/router';
import { removeLocalToken, saveLocalToken } from '@/utils';
import { AxiosError } from 'axios';
import { auth, db } from '@/plugins/firebase'
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth'
import { doc, collection, addDoc, getDoc, setDoc } from 'firebase/firestore'
import { getStoreAccessors } from 'typesafe-vuex';
import { ActionContext } from 'vuex';
import { State } from '../state';
import {
    commitAddNotification,
    commitRemoveNotification,
    commitSetLoggedIn,
    commitSetLogInError,
    commitSetRegisterError,
    commitSetToken,
    commitSetUserProfile,
} from './mutations';
import { IUserRegisterCreate, IUserProfile } from '@/interfaces'
import { AppNotification, MainState } from './state';

type MainContext = ActionContext<MainState, State>;

export const actions = {
    actionAuthCheck(context: MainContext) {
        onAuthStateChanged(auth, user => {
            console.log(user);
            if (user) {
                commitSetLoggedIn(context, true);
                commitSetLogInError(context, false);
            } else {
                commitSetLoggedIn(context, false);
                commitSetLogInError(context, false);
            }
        });
    },
    async actionLogIn(context: MainContext, payload: { username: string; password: string }) {
        try {
            console.log('login action triggered');
            const response = await signInWithEmailAndPassword(auth, payload.username, payload.password);
            const token = auth.currentUser;
            if (response.user) {
                console.log('user token received');
                // saveLocalToken(token);
                // commitSetToken(context, token);
                dispatchAuthCheck(context);
                console.log('context.state.isLoggedIn');
                console.log(context.state.isLoggedIn);
                // commitSetLoggedIn(context, true);
                // commitSetLogInError(context, false);
                await dispatchGetUserProfile(context);
                await dispatchRouteLoggedIn(context);
                commitAddNotification(context, { content: 'Logged in', color: 'success' });
            } else {
                console.log('no token received');
                await dispatchLogOut(context);
            }
        } catch (err) {
            console.log('sign in error caught');
            commitSetLogInError(context, true);
            await dispatchLogOut(context);
        }
    },
    async actionRegisterNewUser(context: MainContext, payload: IUserRegisterCreate) {
        try {
            await createUserWithEmailAndPassword(auth, payload.email, payload.password)
            const usr = auth.currentUser;
            if (usr) {
                await updateProfile(usr, { displayName: payload.full_name })
                await setDoc(doc(db, 'users', usr.uid), {
                    full_name: payload.full_name,
                    bio: payload.bio ?? '',
                    is_active: payload.is_active,
                    is_superuser: payload.is_superuser
                });
                await sendEmailVerification(usr)
                commitSetLoggedIn(context, true);
                commitSetLogInError(context, false);
                commitSetRegisterError(context, false);
                await dispatchGetUserProfile(context);
                await dispatchRouteLoggedIn(context);
                commitAddNotification(context, { content: 'Click the link sent to your email to complete registration.', color: 'info' });
                console.log('done registering...')
            } else {
                console.log('no user found...')
                await dispatchLogOut(context);
            }
        } catch (error) {
            console.log(error)
            console.log('register caught error')
            await dispatchLogOut(context);
            commitSetLogInError(context, true);
        }
    },
    async actionGetUserProfile(context: MainContext) {
        try {
            const profileSnap = await getDoc(doc(db, 'users', auth.currentUser?.uid ?? ''));
            console.log('logging profile');
            console.log(profileSnap);
            if (profileSnap.exists()) {
                console.log('profile exists')
                const usrProf: IUserProfile = {
                    id: '',
                    bio: profileSnap.data().bio,
                    is_active: profileSnap.data().is_active,
                    email: auth.currentUser?.email ?? '',
                    is_superuser: profileSnap.data().is_superuser,
                    full_name: auth.currentUser?.displayName ?? '',
                    profile_url: auth.currentUser?.photoURL ?? ''
                };
                commitSetUserProfile(context, usrProf);
            }
        } catch (error) {
            await dispatchCheckApiError(context, error);
        }
    },
    async actionUpdateUserProfile(context: MainContext, payload) {
        try {
            const loadingNotification = { content: 'saving', showProgress: true };
            commitAddNotification(context, loadingNotification);
            const response = (await Promise.all([
                api.updateMe(context.state.token, payload),
                await new Promise((resolve, reject) => setTimeout(() => resolve(), 500)),
            ]))[0];
            commitSetUserProfile(context, response.data);
            commitRemoveNotification(context, loadingNotification);
            commitAddNotification(context, { content: 'Profile successfully updated', color: 'success' });
        } catch (error) {
            await dispatchCheckApiError(context, error);
        }
    },
    async actionCheckLoggedIn(context: MainContext) {
        if (!context.state.isLoggedIn) {
            let token = auth.currentUser;
            // console.log('loging token')
            // console.log(token);
            if (!token) {
                await dispatchRemoveLogIn(context);
            }
            if (token) {
                try {
                    commitSetLoggedIn(context, true);
                    dispatchGetUserProfile(context)
                } catch (error) {
                    await dispatchRemoveLogIn(context);
                }
            } else {
                await dispatchRemoveLogIn(context);
            }
        }
    },
    async actionRemoveLogIn(context: MainContext) {
        await signOut(auth);
        commitSetToken(context, '');
        commitSetLoggedIn(context, false);
    },
    async actionLogOut(context: MainContext) {
        await dispatchRemoveLogIn(context);
        await dispatchRouteLogOut(context);
    },
    async actionUserLogOut(context: MainContext) {
        await dispatchLogOut(context);
        commitAddNotification(context, { content: 'Logged out', color: 'success' });
    },
    actionRouteLogOut(context: MainContext) {
        if (router.currentRoute.path !== '/login') {
            router.push('/login');
        }
    },
    async actionCheckApiError(context: MainContext, payload: AxiosError) {
        if (payload.response!.status === 401) {
            await dispatchLogOut(context);
        }
    },
    actionRouteLoggedIn(context: MainContext) {
        const pathArray: string[] = ['/login', '/', '/register'];
        if (pathArray.includes(router.currentRoute.path.toString())) {
            router.push('/main');
        }
    },
    async removeNotification(context: MainContext, payload: { notification: AppNotification, timeout: number }) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                commitRemoveNotification(context, payload.notification);
                resolve(true);
            }, payload.timeout);
        });
    },
    async passwordRecovery(context: MainContext, payload: { username: string }) {
        const loadingNotification = { content: 'Sending password recovery email', showProgress: true };
        try {
            commitAddNotification(context, loadingNotification);
            const response = (await Promise.all([
                api.passwordRecovery(payload.username),
                await new Promise((resolve, reject) => setTimeout(() => resolve(), 500)),
            ]))[0];
            commitRemoveNotification(context, loadingNotification);
            commitAddNotification(context, { content: 'Password recovery email sent', color: 'success' });
            await dispatchLogOut(context);
        } catch (error) {
            commitRemoveNotification(context, loadingNotification);
            commitAddNotification(context, { color: 'error', content: 'Incorrect username' });
        }
    },
    async resetPassword(context: MainContext, payload: { password: string, token: string }) {
        const loadingNotification = { content: 'Resetting password', showProgress: true };
        try {
            commitAddNotification(context, loadingNotification);
            const response = (await Promise.all([
                api.resetPassword(payload.password, payload.token),
                await new Promise((resolve, reject) => setTimeout(() => resolve(), 500)),
            ]))[0];
            commitRemoveNotification(context, loadingNotification);
            commitAddNotification(context, { content: 'Password successfully reset', color: 'success' });
            await dispatchLogOut(context);
        } catch (error) {
            commitRemoveNotification(context, loadingNotification);
            commitAddNotification(context, { color: 'error', content: 'Error resetting password' });
        }
    },
};

const { dispatch } = getStoreAccessors<MainState | any, State>('');

export const dispatchCheckApiError = dispatch(actions.actionCheckApiError);
export const dispatchAuthCheck = dispatch(actions.actionAuthCheck);
export const dispatchCheckLoggedIn = dispatch(actions.actionCheckLoggedIn);
export const dispatchGetUserProfile = dispatch(actions.actionGetUserProfile);
export const dispatchRegisterNewUser = dispatch(actions.actionRegisterNewUser)
export const dispatchLogIn = dispatch(actions.actionLogIn);
export const dispatchLogOut = dispatch(actions.actionLogOut);
export const dispatchUserLogOut = dispatch(actions.actionUserLogOut);
export const dispatchRemoveLogIn = dispatch(actions.actionRemoveLogIn);
export const dispatchRouteLoggedIn = dispatch(actions.actionRouteLoggedIn);
export const dispatchRouteLogOut = dispatch(actions.actionRouteLogOut);
export const dispatchUpdateUserProfile = dispatch(actions.actionUpdateUserProfile);
export const dispatchRemoveNotification = dispatch(actions.removeNotification);
export const dispatchPasswordRecovery = dispatch(actions.passwordRecovery);
export const dispatchResetPassword = dispatch(actions.resetPassword);
