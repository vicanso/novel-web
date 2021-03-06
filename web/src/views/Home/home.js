import { mapActions, mapState } from "vuex";
import Banner from "@/components/Banner";
import BookView from "@/components/BookView";
import BookFavView from "@/components/BookFavView";
import { routeLogin, routeRegister, routeDetail } from "@/routes";
import { scrollTop } from "@/helpers/util";
import cordova from "@/helpers/cordova";

const functions = {
  shelf: "shelf",
  hot: "hot",
  gallery: "gallery",
  find: "find"
};

export default {
  name: "home",
  components: {
    Banner,
    BookView,
    BookFavView
  },
  computed: {
    ...mapState({
      bookBanners: ({ book }) => book.banners,
      bookBannerImages: ({ book }) => {
        if (!book.banners) {
          return null;
        }
        return book.banners.map(item => item.img);
      },
      books: ({ book }) => book.list,
      bookCount: ({ book }) => book.count,
      bookCategories: ({ book }) => {
        if (!book || !book.categories) {
          return null;
        }
        const { categories } = book;
        const result = Object.keys(categories);
        return result.sort((k1, k2) => {
          return categories[k2] - categories[k1];
        });
      },
      bookTodayRecommend: ({ book }) => book.todayRecommend,
      bookLatestPopu: ({ book }) => book.latestPopu,
      bookSearchResult: ({ book }) => book.searchResult,
      userInfo: ({ user }) => user.info,
      bookFavs: ({ book }) => book.favs
    })
  },
  data() {
    return {
      functions,
      currentNav: functions.hot,
      currentCatgory: 0,
      navigation: [
        {
          id: functions.shelf,
          name: "书架",
          cls: "icon-all"
        },
        {
          id: functions.hot,
          name: "精选",
          cls: "icon-creditlevel"
        },
        {
          id: functions.gallery,
          name: "书库",
          cls: "icon-viewgallery"
        },
        {
          id: functions.find,
          name: "发现",
          cls: "icon-originalimage"
        }
      ],
      field: ["id", "name", "author", "brief", "cover", "wordCount"].join(","),
      hotFields: [
        "id",
        "name",
        "author",
        "brief",
        "cover",
        "wordCount",
        "category"
      ].join(","),
      order: "-updatedAt,-createdAt",
      offset: 0,
      limit: 10,
      loadDone: false,
      loading: false,
      keyword: "",
      searchBooks: null,
      // 正在拉取收藏列表
      fetchingUserFavas: false
    };
  },
  methods: {
    ...mapActions([
      "bookListBanner",
      "bookList",
      "bookListCategory",
      "bookListTodayRecommend",
      "bookListLatestPopu",
      "bookCacheRemove",
      "bookClearSearchResult",
      "bookSearch",
      "bookUserAction",
      "bookGetUserFavs"
    ]),
    showDetail(id) {
      this.$router.push({
        name: routeDetail,
        params: {
          id
        }
      });
    },
    showSearchDetail({ id, published }) {
      if (published) {
        this.showDetail(id);
        return;
      }
      this.xToast("很抱歉该书籍尚未上架，请耐心等待...");
      this.bookUserAction({
        id,
        type: "wantToRead"
      });
    },
    activeNav({ id }) {
      if (id === functions.find) {
        this.keyword = "";
      }
      this.currentNav = id;
    },
    reset() {
      this.bookCacheRemove();
      this.loadDone = false;
      this.offset = 0;
    },
    async fetch() {
      const { field, order, offset, limit } = this;
      this.loading = true;
      try {
        const params = {
          field,
          order,
          offset,
          limit,
          status: 2
        };
        const category = this.bookCategories[this.currentCatgory];
        if (!category) {
          throw new Error("获取失败分类");
        }
        params.category = category;
        await this.bookList(params);
        this.offset = offset + limit;
        if (this.books.length >= this.bookCount) {
          this.loadDone = true;
        }
      } catch (err) {
        this.xError(err);
      } finally {
        this.loading = false;
      }
    },
    async changeCatgeory(index) {
      this.currentCatgory = index;
      this.reset();
      await this.fetch();
    },
    initLoadmoreEvent() {
      const { loadingMore } = this.$refs;
      const io = new IntersectionObserver(entries => {
        if (this.loading) {
          return;
        }
        const target = entries[0];
        // 在元素可见时加载图标，并做diconnect
        if (target.isIntersecting) {
          this.fetch();
        }
      });
      io.observe(loadingMore);
    },
    async listTodayRecommend() {
      const { order, hotFields } = this;
      try {
        await this.bookListTodayRecommend({
          limit: 5,
          order,
          field: hotFields
        });
      } catch (err) {
        this.xError(err);
      }
    },
    async listLatestPopu() {
      const { hotFields } = this;
      try {
        await this.bookListLatestPopu({
          limit: 10,
          order: "latestViewCount",
          field: hotFields
        });
      } catch (err) {
        this.xError(err);
      }
    },
    login() {
      this.$router.push({
        name: routeLogin
      });
    },
    register() {
      this.$router.push({
        name: routeRegister
      });
    },
    backToTop() {
      const domMap = {};
      domMap[functions.hot] = "hotWrapper";
      domMap[functions.shelf] = "shelfWrapper";
      domMap[functions.gallery] = "galleryWrapper";

      const { $refs, currentNav } = this;
      const dom = $refs[domMap[currentNav]];
      if (!dom) {
        return;
      }
      scrollTop(dom, 0);
    },
    // 显示广告推荐
    showBanner(index) {
      const item = this.bookBanners[index];
      if (!item) {
        return;
      }
      this.showDetail(item.id);
    }
  },
  watch: {
    async keyword(v) {
      if (!v) {
        this.bookClearSearchResult();
        return;
      }
      try {
        this.bookSearch({
          field: "name,author,id",
          limit: 10,
          keyword: v,
          order: this.order
        });
      } catch (err) {
        this.xError(err);
      }
    },
    async currentNav(v) {
      const { userInfo } = this;
      // 如果未登录，不需要加载收藏
      if (!userInfo || userInfo.anonymous) {
        return;
      }
      if (v === functions.shelf) {
        this.fetchingUserFavas = true;
        try {
          await this.bookGetUserFavs();
        } catch (err) {
          this.xError(err);
        } finally {
          this.fetchingUserFavas = false;
        }
      }
    }
  },
  async mounted() {
    const close = this.xLoading();
    try {
      await this.bookListCategory();
      this.fetch();
      this.initLoadmoreEvent();
      this.bookListBanner();
      // home页面一直都存在，不需要删除事件
      cordova.onStatusTap(() => {
        this.backToTop();
      });
    } catch (err) {
      this.xError(err);
    } finally {
      close();
    }
  }
};
