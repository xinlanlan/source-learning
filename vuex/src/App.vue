<template>
  <div id="app">
    {{$store.state.age}}<br/>
    {{$store.getters.myAge}}<br/>
    {{$store.state.a.age}}<br/>
    {{$store.state.b.age}}<br/>
    {{$store.state.b.c.age}}<br/>
    {{$store.state.d.age}}<br/>
    <button @click="syncChange">同步更改</button><br/>
    <button @click="asyncChange">异步更改</button><br/>
  </div>
</template>

<script>
// import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'


export default {
  methods: {
    syncChange() {
      this.$store.commit('syncChange', 10)
    },
    asyncChange() {
      this.$store.dispatch('asyncChange', 5)
    }
  }
}
</script>

<style>
</style>
