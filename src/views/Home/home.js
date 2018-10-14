import { mapActions, mapState } from "vuex";
import Banner from "@/components/Banner";

const functions = {
  shelf: 'shelf',
  hot: 'hot',
  gallery: 'gallery',
  find: 'find',
};

export default {
  name: 'home',
  components: {
    Banner,
  },
  computed: {
    ...mapState({
      books: ({ book }) => book.list,
      bookCount: ({ book }) => book.count,
      bookCategories: ({ book }) => {
        if (!book || !book.categories) {
          return null;
        }
        const {
          categories,
        } = book;
        const result = Object.keys(categories);
        return result.sort((k1, k2) => {
          return categories[k2] - categories[k1];
        });
      }
    })
  },
  data() {
    return {
      banners: [
        '01CSRYT09Z31MXY7GG640T9PR2',
        '01CSRYSFXRB7T6W7NPMM2MF478'
      ],
      functions,
      currentNav: functions.hot,
      currentCatgory: 0,
      navigation: [
        {
          id: functions.shelf,
          name: '书架',
          cls: 'icon-all',
        },
        {
          id: functions.hot,
          name: '精选',
          cls: 'icon-creditlevel',
        },
        {
          id: functions.gallery,
          name: '书库',
          cls: 'icon-viewgallery',
        },
        {
          id: functions.find,
          name: '发现',
          cls: 'icon-originalimage',
        }
      ],
      field: [
        "id",
        "name",
        "author",
        "brief",
        "cover",
      ].join(","),
      currentPage: 1,
      order: "-updatedAt",
      offset: 0,
      limit: 10,
    };
  },
  methods: {
    ...mapActions([
      "bookList",
      "bookListCategory",
      "bookCacheRemove",
    ]),
    activeNav({id}) {
      this.currentNav = id;
    },
    reset() {
      this.bookCacheRemove();
      this.offset = 0;
      this.currentPage = 1;
    },
    async fetch() {
      const { field, order, offset, limit } = this;
      const close = this.xLoading();
      try {
        const params = {
          field,
          order,
          offset,
          limit,
          // status: 2,
        };
        await this.bookList(params);
      } catch (err) {
        this.xError(err);
      } finally {
        close();
      }
    },
    async changeCatgeory(index) {
      this.currentCatgory = index;
    },
  },
  async beforeMount() {
    const close = this.xLoading();
    try {
      await this.bookListCategory();
      await this.fetch();
    } catch (err) {
      this.xError(err);
    } finally {
      close();
    }
  },
};