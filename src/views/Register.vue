<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>{{appName}} | Register</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <v-form @keyup.enter="submit" ref="form">
                <v-text-field v-model="fullName" data-vv-name="full_name" v-validate="'required'" :error-messages="errors.collect('full_name')" prepend-icon="person" name="fullName" label="Full Name" type="text" required></v-text-field>
                <v-text-field v-model="email" data-vv-name="email" v-validate="'required|email'" :error-messages="errors.collect('email')" prepend-icon="mail" name="login" label="Email" type="email" required></v-text-field>
                <v-text-field type="password" ref="password" label="Set Password" prepend-icon="lock" data-vv-name="password" data-vv-delay="100" v-validate="{required: true}" v-model="password" :error-messages="errors.first('password')"></v-text-field>
                <v-text-field type="password" label="Confirm Password" prepend-icon="lock" data-vv-name="password_confirmation" data-vv-delay="100" data-vv-as="password" v-validate="{required: true, confirmed: 'password'}" v-model="vPassword" :error-messages="errors.first('password_confirmation')">
                </v-text-field>
              </v-form>
              <div v-if="registerError">
                <v-alert :value="registerError" transition="fade-transition" type="error">
                  Make sure all required values are provided.
                </v-alert>
              </div>
              <v-flex class="caption text-xs-right">Have an account? <router-link to="/login">Login</router-link></v-flex>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click.prevent="submit" :loading="loading" :disabled="loading" color="primary">Register</v-btn>
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
import {IUserRegisterCreate} from '@/interfaces'
import {readRegisterError} from '@/store/main/getters'
import {dispatchRegisterNewUser} from '@/store/main/actions'

@Component
export default class Signup extends Vue {
  public appName: string = appName;
  public fullName: string = '';
  public email: string = '';
  public password: string = '';
  public vPassword: string = '';
  public isActive: boolean = false;
  public isSuperuser: boolean = false;
  public loading: boolean = false;

  public get registerError(){
    return readRegisterError(this.$store);
  }

  public async submit(){
    if(this.$validator.validateAll()){
      const newUser: IUserRegisterCreate = {
        email: this.email,
        password: this.password,
        is_active: this.isActive
      };
      if(this.fullName){
        newUser.full_name = this.fullName;
      }
      if(this.email){
        newUser.email = this.email;
      }
      if(this.password){
        newUser.password = this.password;
      }
      newUser.is_active = this.isActive;
      newUser.is_superuser = this.isSuperuser;

      this.loading = true;
      dispatchRegisterNewUser(this.$store, newUser).then(()=> this.loading = false);
    }

  }
}
</script>
