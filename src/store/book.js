import request from "axios";
import { BOOKS, BOOKS_CATEGORIES } from "@/urls";
import { BOOK_LIST, BOOK_CATEGORY } from "@/store/types";

import { debug, formatDate } from "@/helpers/util";

const state = {
  book: {
    list: [],
    count: 0,
    categories: null
  }
};

const bookList = async (
  { commit },
  { field, order, offset, limit, q, category, status }
) => {
  const params = {
    field,
    order,
    offset,
    limit
  };
  if (q) {
    params.q = q;
  }
  if (category) {
    params.category = category;
  }
  if (Number.isInteger(status)) {
    params.status = status;
  }
  const { list } = state.book;
  if (list[offset]) {
    return;
  }
  debug(params);
  const res = await request.get(BOOKS, {
    params
  });
  debug(res);
  commit(
    BOOK_LIST,
    Object.assign(
      {
        offset
      },
      res.data
    )
  );
};

const bookCacheRemove = async ({ commit }) => {
  commit(BOOK_LIST, null);
};

const bookListCategory = async ({ commit }) => {
  const res = await request.get(BOOKS_CATEGORIES);
  debug(res);
  commit(BOOK_CATEGORY, res.data);
};

const actions = {
  bookList,
  bookCacheRemove,
  bookListCategory
};

const mutations = {
  [BOOK_LIST](state, data) {
    const stateData = state.book;
    // clear cache
    if (!data) {
      stateData.list = [];
      stateData.count = 0;
      return;
    }
    const { books, count, offset } = data;
    books.forEach(function(item, i) {
      if (item.updatedAt) {
        item.updatedAt = formatDate(item.updatedAt);
      }
      stateData.list[offset + i] = item;
    });
    if (count >= 0) {
      stateData.count = count;
    }
  },
  [BOOK_CATEGORY](state, { categories }) {
    state.book.categories = categories;
  }
};

export default {
  actions,
  state,
  mutations
};
