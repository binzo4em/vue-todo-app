<template>
  <div>
    <router-link
        to="/"
        class="to-home">
        <i class="material-icons">home</i>
    </router-link>

    <router-view/>
  </div>
</template>

<script>
export default {
  created () {
    console.log('Router:', this.$router)
    console.log('Route:', this.$route)
  }
}
</script>

<style lang="scss">
  /* 메인 페이지에서는 홈버튼이 필요없기 때문에
  rotuer-link-exact-active class가 있는 경우 display를 nonoe으로 설정 */
  .to-home.router-link-exact-active {
    display: none;
  }
</style>
