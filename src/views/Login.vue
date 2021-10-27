<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>{{appName}} | Signup</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <v-form @keyup.enter="submit">
                <v-text-field @keyup.enter="submit" v-model="email" prepend-icon="person" name="login" label="Login" type="text"></v-text-field>
                <v-text-field @keyup.enter="submit" v-model="password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
              </v-form>
              <div v-if="loginError">
                <v-alert :value="loginError" transition="fade-transition" type="error">
                  Incorrect email or password
                </v-alert>
              </div>
              <v-flex class="caption text-xs-right">
                <router-link to="/register">Signup</router-link> | 
                <router-link to="/recover-password">Forgot your password?</router-link>
              </v-flex>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click.prevent="submit" :loading="loading" :disabled="loading" color="primary">Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appName } from '@/env';
import { readLoginError } from '@/store/main/getters';
import { dispatchLogIn } from '@/store/main/actions';

@Component
export default class Login extends Vue {
  public email: string = '';
  public password: string = '';
  public appName = appName;
  public loading:boolean = false;

  public get loginError() {
    return readLoginError(this.$store);
  }

  public async submit() {
    console.log('Initial login submit..');
    console.log(this.$store.state.main.isLoggedIn);
    this.loading = true;
    dispatchLogIn(this.$store, {username: this.email, password: this.password}).then(()=>this.loading = false);
  }
}
</script>

<style>
</style>
