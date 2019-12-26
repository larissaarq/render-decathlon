<template>
  <article class="hello-world">
    <h1 class="hello-world__title">Hello World!</h1>
  </article>
</template>

<script>
export default {
  name: "app"
}
</script>

<style lang="scss">
  .hello-world {
    &__title {
      color: #000;
      font-size: 20px;
      text-transform: uppercase;
    }
  }
</style>
