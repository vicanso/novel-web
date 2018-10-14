<template lang="pug">
mixin MainNav
  .mainNav
    a(
      href="javascript:;"
      v-for="item in navigation"
      :class="currentNav === item.id? 'active': ''"
      :key="item.name"
      @click="activeNav(item)"
    )
      .iconfont(
        :class="item.cls"
      )
      | {{item.name}}

mixin Banner
  .bannerWrapper
    Banner(
      :ids="banners"
    )
mixin BookHot
  .hotWrapper(
    v-show="currentNav === functions.hot"
  )
    +Banner

mixin BookGallery
  .galleryWrapper.fullHeight(
    v-show="currentNav === functions.gallery"
  )
    ul.fullHeight
      li(
        v-for="item, index in bookCategories"
        :class="currentCatgory === index ? 'active': ''"
      ): a(
        href="javascript:;"
        @click="changeCatgeory(index)"
      ) {{item}}

.homeWrapper.fullHeight
  +MainNav
  +BookHot
  +BookGallery
</template>

<style lang="sass" src="./home.sass" scoped></style>
<script src="./home.js">
</script>
