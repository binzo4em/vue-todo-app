<template>
  <section class="home">
    <div>
      <h1>
        Binzo's Home page!
      </h1>
      <!-- 아래 2개는 동일하게 동작하는 코드이다. 2가지 방법중 1가지를 선택해서 사용하면 된다. -->
      <h2 v-on:click="$router.push('/about')">
        About
      </h2>
      <router-link to="/todos" tag="h2">
        Todo App
      </router-link>
    </div>
  </section>
</template>
