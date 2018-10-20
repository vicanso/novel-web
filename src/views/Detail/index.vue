<template lang="pug">
.detailWrapper.fullHeightScroll
  mt-header.mainHeader(
    :title="(detail && detail.name) || '...'"
    fixed
  )
    a.mainHeaderBack(
      slot="left"
      @click="back"
    )
      i.mintui.mintui-back
  .content
    .cover.pullLeft(
      v-if="cover"
    )
      ImageView(
        :src="cover"
      )

</template>

<script src="./detail.js"></script>
<style lang="sass" src="./detail.sass" scoped></style>

