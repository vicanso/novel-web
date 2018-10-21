<template lang="pug">

mixin MainContent
  .content(
    v-if="detail"
  )
    .mainInfos
      .cover.pullLeft(
        v-if="cover"
      )
        ImageView(
          :src="cover"
        )
      .infos.font14
        span.font12(
          v-for="item in detail.category"
        ) {{item}}
        span.font12(
          v-if="detail.category && detail.category.length"
        ) | 
        span.font12 {{detail.author}}
        .wordCount {{wordCountDesc}}
        .latestChapter.font12(
          v-if="latestChapter"
        ) 最新章节：
          span {{latestChapter.title}}
    .brief.font14 {{detail.brief}}
    .chapters(
      v-if="chapterCount"
    ) 查看目录
      i.pullRight.mintui.mintui-back.rotate180.font14
      span.pullRight.font12.updatedAt 更新于
        span {{latestChapter.updatedAt.substring(5, 16)}} 
      span.mleft5.font12 连载至{{chapterCount}}章

mixin Recommends
  .recommends(
    v-if="recommendBooks"
  )
    h3 同类热门
    BookView.book(
      v-for="item in recommendBooks"
      :key="item.id"
      :id="item.id"
      :name="item.name"
      :author="item.author"
      :brief="item.brief"
      :cover="item.cover"
      :wordCount="item.wordCount"
    )

.detailWrapper.fullHeight
  mt-header.mainHeader(
    :title="(detail && detail.name) || '...'"
    fixed
  )
    a.mainHeaderBack(
      slot="left"
      @click="back"
    )
      i.mintui.mintui-back
  .contentWrapper.fullHeightScroll
    +MainContent
    +Recommends
  .functions
    a(
      href="javascript:;"
    )
      i.iconfont.icon-icondownload
      span 下载
    a.read(
      href="javascript:;"
    )
      i.iconfont.icon-office
      span 免费阅读
    a(
      href="javascript:;"
    )
      i.iconfont.icon-pin
      span 加入书架
</template>

<script src="./detail.js"></script>
<style lang="sass" src="./detail.sass" scoped></style>

