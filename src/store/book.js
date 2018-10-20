import request from "axios";
import { BOOKS, BOOKS_CATEGORIES, BOOKS_USER_ACTIONS } from "@/urls";
import {
  BOOK_LIST,
  BOOK_CATEGORY,
  BOOK_LIST_TODAY_RECOMMEND,
  BOOK_SEARCH_RESULT,
  BOOK_LIST_LATEST_POPU
} from "@/store/types";

import { formatDate } from "@/helpers/util";

const todayHotCategory = "今日必读";
const statusPassed = 2;
var currentKeyword = "";

const state = {
  book: {
    list: null,
    count: 0,
    categories: null,
    todayRecommend: null,
    latestPopu: null,
    searchResult: null
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
  if (list && list[offset]) {
    return;
  }
  const res = await request.get(BOOKS, {
    params
  });
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
  commit(BOOK_CATEGORY, res.data);
  return res;
};

const bookListTodayRecommend = async ({ commit }, { limit, field, order }) => {
  const params = {
    field,
    offset: 0,
    limit,
    order,
    category: todayHotCategory,
    status: statusPassed
  };
  const res = await request.get(BOOKS, {
    params
  });
  commit(BOOK_LIST_TODAY_RECOMMEND, res.data.books);
  return res;
};

const bookListLatestPopu = async ({ commit }, { limit, field, order }) => {
  const params = {
    field,
    offset: 0,
    limit,
    order,
    status: statusPassed
  };
  const res = await request.get(BOOKS, {
    params
  });
  commit(BOOK_LIST_LATEST_POPU, res.data.books);
  return res;
};

const bookUserAction = async (tmp, { id, type }) => {
  const url = BOOKS_USER_ACTIONS.replace(":id", id);
  const res = await request.post(url, {
    type
  });
  return res;
};

const bookSearch = async ({ commit }, { keyword, field, limit, order }) => {
  currentKeyword = keyword;
  const params = {
    field,
    offset: 0,
    limit,
    q: keyword,
    order,
    status: statusPassed
  };
  const res = await request.get(BOOKS, {
    params
  });
  if (keyword === currentKeyword) {
    commit(BOOK_SEARCH_RESULT, res.data.books);
  }
  return res;
};

const bookClearSearchResult = async ({ commit }) => {
  commit(BOOK_SEARCH_RESULT, null);
};

const actions = {
  bookList,
  bookCacheRemove,
  bookListTodayRecommend,
  bookListCategory,
  bookListLatestPopu,
  bookSearch,
  bookClearSearchResult,
  bookUserAction
};

const mutations = {
  [BOOK_LIST](state, data) {
    const stateData = state.book;
    // clear cache
    if (!data) {
      stateData.list = null;
      stateData.count = 0;
      return;
    }
    if (!stateData.list) {
      stateData.list = [];
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
  },
  [BOOK_LIST_TODAY_RECOMMEND](state, data) {
    state.book.todayRecommend = data;
  },
  [BOOK_LIST_LATEST_POPU](state, data) {
    state.book.latestPopu = data;
  },
  [BOOK_SEARCH_RESULT](state, data) {
    state.book.searchResult = data;
  }
};

export default {
  actions,
  state,
  mutations
};
