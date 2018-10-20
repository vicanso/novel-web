import { mapActions, mapState } from "vuex";
import ImageView from "@/components/ImageView";
import {
  getCover,
} from "@/helpers/util";

export default {
  name: "detail",
  data() {
    return {
      cover: "",
    };
  },
  components: {
    ImageView,
  },
  computed: {
    ...mapState({
      detail: ({ book }) => book.detail,
    }),
  },
  watch: {
    detail(v) {
      this.cover = getCover(v.cover, 100);
    },
  },
  methods: {
    ...mapActions([
      "bookGetDetail",
    ]),
    async load(id) {
      const close = this.xLoading();
      try {
        await this.bookGetDetail({
          id,
        });
      } catch (err) {
        this.xError(err);
      } finally {
        close();
      }
    },
    back() {
      this.$router.back();
    }
  },
  beforeMount() {
    const {id} = this.$route.params;
    this.load(id);
  },
}