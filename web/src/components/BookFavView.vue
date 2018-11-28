<template lang="pug">
.bookFavView.clearfix(
  @click="showDetail"
)
  .cover.pullLeft
    ImageView(
      :src="coverUrl"
    )
  .content
    h5
      .updatedIcon.pullLeft(
        v-if="hasUpdated"
      )
      | {{name}}
      span.updatedAt.font12(
        v-if="latestUpdatedAt"
      ) (更新于:{{latestUpdatedAt}})
    .latestChapter(
      v-if="latestChapter"
    ) 最新章节：{{latestChapter.title}}
    .readingChapter(
      v-if="readingChapter"
    ) 上次阅读：{{readingChapter.title}}

</template>
<style lang="sass" scoped>
@import '@/styles/const.sass'
$coverWidth: 80px
.bookFavView
  padding: 10px
.cover
  width: $coverWidth
  height: 100%
  overflow: hidden
.content
  margin-left: $coverWidth + 10 
  $lineHeight: 20px
  line-height: $lineHeight 
  .updatedIcon
    padding: 4px
    margin: 13px 5px 0 0
    background-color: $COLOR_RED
  h5
    margin: 0
    padding: 0
    line-height: 2em
    font-size: 16px
  .readingChapter, .latestChapter
    font-size: 13px
    height: $lineHeight
    overflow: hidden
    color: $COLOR_DARK_GRAY
    text-overflow: ellipsis
    white-space: nowrap
  .readingChapter
    margin-bottom: 5px
  .updatedAt
    color: $COLOR_DARK_BLUE
    font-weight: 400
    margin-left: 5px

</style>

<script>
import ImageView from "@/components/ImageView";
import { routeDetail } from "@/routes";
import { getCover, getDurationDesc } from "@/helpers/util";

const coverHeight = 98;

export default {
  components: {
    ImageView
  },
  props: {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    cover: {
      type: String
    },
    latestChapter: {
      type: Object
    },
    readingChapter: {
      type: Object
    }
  },
  data() {
    return {
      coverUrl: ""
    };
  },
  computed: {
    latestUpdatedAt() {
      const { latestChapter } = this;
      if (!latestChapter || !latestChapter.updatedAt) {
        return;
      }
      return getDurationDesc(latestChapter.updatedAt);
    },
    hasUpdated() {
      const { latestChapter, readingChapter } = this;
      if (!latestChapter || !readingChapter) {
        return false;
      }
      return latestChapter.title !== readingChapter.title;
    }
  },
  mounted() {
    const { cover } = this;
    if (!cover) {
      return;
    }
    this.coverUrl = getCover(cover, coverHeight);
  },
  methods: {
    showDetail() {
      this.$router.push({
        name: routeDetail,
        params: {
          id: this.id
        }
      });
    }
  }
};
</script>
