import { mapActions } from "vuex";
import ImageView from "@/components/ImageView";
import BookView from "@/components/BookView";
import {
  getCover,
  formatDate,
} from "@/helpers/util";

export default {
  name: "detail",
  data() {
    return {
      cover: "",
      wordCountDesc: "",
      detail: null,
      chapterCount: 0,
      latestChapter: null,
      recommendBooks: null,
    };
  },
  components: {
    ImageView,
    BookView,
  },
  watch: {
    detail(v) {
      const {
        cover,
        wordCount,
      } = v;
      this.cover = getCover(cover, 100);
      const base = 10 * 1000;
      let wordCountDesc = "";
      if (wordCount >= base) {
        wordCountDesc = `${Math.floor(wordCount / base)}万字`;
      } else {
        wordCountDesc = `${wordCount}字`;
      }
      this.wordCountDesc = wordCountDesc;
    },
  },
  methods: {
    ...mapActions([
      "bookGetDetail",
      "bookGetRecommend",
    ]),
    async load(id) {
      const close = this.xLoading();
      try {
        const res = await this.bookGetDetail({
          id,
        });
        const {
          book,
          chapterCount,
          latestChapter,
        } = res.data;
        const {
          cover,
          wordCount,
        } = book;
        this.cover = getCover(cover, 100);
        const base = 10 * 1000;
        let wordCountDesc = "";
        if (wordCount >= base) {
          wordCountDesc = `${Math.floor(wordCount / base)}万字`;
        } else {
          wordCountDesc = `${wordCount}字`;
        }
        this.wordCountDesc = wordCountDesc;
        this.detail = book;
        this.chapterCount = chapterCount;
        if (latestChapter) {
          latestChapter.updatedAt = formatDate(latestChapter.updatedAt);
        }
        this.latestChapter = latestChapter;
      } catch (err) {
        this.xError(err);
      } finally {
        close();
      }
    },
    back() {
      this.$router.back();
    },
    async loadRecommend(id) {
      try {
        const res = await 
        this.bookGetRecommend({
          id,
          limit: 3,
          field: "id,name,author,brief,cover,wordCount",
          order: "-updatedAt",
        });
        this.recommendBooks = res.data.books;
      } catch (err) {
        this.xError(err);
      }
    }
  },
  beforeMount() {
    const {id} = this.$route.params;
    this.load(id);
    this.loadRecommend(id);
  },
}