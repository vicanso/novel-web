<template lang="pug">
mixin Loading
  p.tac.font12 加载中...
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
  .hotWrapper.fullHeightScroll(
    v-show="currentNav === functions.hot"
  )
    +Banner
    .hotList(
      v-intersecting-show="listTodayRecommend"
    )
      h3 今日必读
      .loading(
        v-if="!bookTodayRecommend"
      ) 正在加载中...
      BookView.booView(
        v-for="item in bookTodayRecommend"
        :key="item.id"
        :name="item.name"
        :author="item.author"
        :brief="item.brief"
        :cover="item.cover"
        :wordCount="item.wordCount"
        :category="item.category" 
      )
    //- 加载完今日必读再加载
    .hotList(
      v-if="bookTodayRecommend"
      v-intersecting-show="listLatestPopu"
    ) 
      h3 最新热门
      .loading(
        v-if="!bookLatestPopu"
      ) 正在加载中...
      BookView.booView(
        v-for="item in bookLatestPopu"
        :key="item.id"
        :name="item.name"
        :author="item.author"
        :brief="item.brief"
        :cover="item.cover"
        :wordCount="item.wordCount"
        :category="item.category" 
      )

mixin BookGallery
  .galleryWrapper.fullHeight(
    v-show="currentNav === functions.gallery"
  )
    ul.fullHeightScroll.categories.pullLeft
      li(
        v-for="item, index in bookCategories"
        :class="currentCatgory === index ? 'active': ''"
      ): a(
        href="javascript:;"
        @click="changeCatgeory(index)"
      ) {{item}}
    .fullHeightScroll.books
      ul(
        v-if="books"
      )
        li(
          v-for="item in books"
          :key="item.id"
        )
          BookView(
            :name="item.name"
            :author="item.author"
            :brief="item.brief"
            :cover="item.cover"
            :wordCount="item.wordCount"
            :category="item.category"
          )
        p.tac.font12(
          v-if="books.length === 0"
        ) 很抱歉，该分类为空
      div(
        v-show='!loadDone'
        ref="loadingMore"
      )
        +Loading

mixin BookSearch
  .fullHeight.searchWrapper(
    v-show="currentNav === functions.find"
  )
    p.tac.searching(
      v-if="keyword && !bookSearchResult"
    ) 搜索中...
    mt-search.search(
      v-model="keyword"
      autofocus
    )
      mt-cell(
        v-for="item in bookSearchResult"
        :key="item.name"
        :title="item.name"
        :value="item.author"
      )
      div(
        v-if="bookSearchResult && bookSearchResult.length === 0"
      )
        mt-cell.tac(
          title="无符合条件的书籍"
        )

.homeWrapper.fullHeight
  +MainNav
  +BookHot
  +BookGallery
  +BookSearch
</template>

<style lang="sass" src="./home.sass" scoped></style>
<script src="./home.js">
</script>
