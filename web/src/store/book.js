import request from "axios";
import { sortBy, find } from "lodash-es";
import {
  BOOKS,
  BOOKS_RECOMMEND_BY_ID,
  BOOKS_CATEGORIES,
  BOOKS_CHAPTERS,
  BOOKS_USER_ACTIONS,
  BOOKS_USER_FAVS,
  BOOKS_DETAIL
} from "@/urls";
import {
  BOOK_LIST,
  BOOK_CATEGORY,
  BOOK_LIST_TODAY_RECOMMEND,
  BOOK_SEARCH_RESULT,
  BOOK_LIST_USER_FAV,
  BOOK_LIST_BANNER,
  BOOK_LIST_LATEST_POPU
} from "@/store/types";

import {
  ChapterCache,
  BookReadInfo,
  clearChapterStoreById,
  getStoreChapterIndexList
} from "@/helpers/storage";

import { formatDate } from "@/helpers/util";

const todayHotCategory = "今日必读";
const statusPassed = 2;
const statusPadding = 0;
var currentKeyword = "";

const state = {
  book: {
    banners: null,
    detail: null,
    list: null,
    count: 0,
    categories: null,
    todayRecommend: null,
    latestPopu: null,
    searchResult: null,
    favs: null
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
  let res = await request.get(BOOKS, {
    params
  });
  let books = [];
  res.data.books.forEach(item => {
    item.published = true;
    books.push(item);
  });
  if (books.length < limit) {
    params.status = statusPadding;
    res = await request.get(BOOKS, {
      params
    });
    res.data.books.forEach(item => {
      item.published = false;
      books.push(item);
    });
  }
  if (keyword === currentKeyword) {
    commit(BOOK_SEARCH_RESULT, books);
  }
  return res;
};

const bookClearSearchResult = async ({ commit }) => {
  commit(BOOK_SEARCH_RESULT, null);
};

const bookGetDetail = async (tmp, { id }) => {
  const res = await request.get(BOOKS_DETAIL.replace(":id", id));
  return res;
};

// bookGetRecommend get recommend
const bookGetRecommend = async (tmp, { id, limit, field, order }) => {
  const url = BOOKS_RECOMMEND_BY_ID.replace(":id", id);
  const res = await request.get(url, {
    params: {
      status: statusPassed,
      offset: 0,
      limit,
      field,
      order
    }
  });
  return res;
};

const bookGetChapters = async (tmp, { id, limit, offset, field, order }) => {
  const url = BOOKS_CHAPTERS.replace(":id", id);
  const res = await request.get(url, {
    params: {
      limit,
      offset,
      field,
      order
    }
  });
  return res;
};

const getChapters = async (id, offset, limit) => {
  const url = BOOKS_CHAPTERS.replace(":id", id);
  return request.get(url, {
    params: {
      limit,
      offset,
      field: "title,content,index",
      order: "index"
    }
  });
};

const bookGetChapterContent = async (tmp, { id, no, isPreload }) => {
  const c = new ChapterCache(id);
  const data = await c.get(no);
  const limit = 10;
  if (data) {
    // 如果不是预加载，提前做预加载
    if (!isPreload) {
      setTimeout(() => {
        bookGetChapterContent(null, {
          id,
          no: no + limit,
          isPreload: true
        });
      }, 3000);
    }
    return data;
  }
  let offset = Math.floor(no / limit) * limit;
  const res = await getChapters(id, offset, limit);
  const { chapters } = res.data;
  chapters.forEach((item, index) => {
    c.add(offset + index, item);
  });
  return chapters[no - offset];
};

const bookDownload = async (tmp, { id, max }) => {
  const limit = 20;
  const arr = [];
  for (let index = 0; index < Math.ceil(max / limit); index++) {
    arr.push(index);
  }
  const storeIndexList = await getStoreChapterIndexList(id);
  const dict = {};
  storeIndexList.forEach(v => {
    dict[v] = true;
  });
  const c = new ChapterCache(id);
  return Promise.map(
    arr,
    async i => {
      const offset = i * limit;
      let found = false;
      for (let index = 0; index < limit; index++) {
        if (found) {
          break;
        }
        const v = Math.min(index + offset, max - 1);
        // 如果发现有章节未下载
        if (!dict[v]) {
          found = true;
        }
      }
      // 如果未发现未下载章节，则无需下载
      if (!found) {
        return;
      }
      const res = await getChapters(id, offset, limit);
      const { chapters } = res.data;
      chapters.forEach((item, index) => {
        c.add(offset + index, item);
      });
    },
    {
      concurrency: 1
    }
  );
};

// 获取缓存的章节序号
const bookGetStoreChapterIndexes = async (tmp, { id }) => {
  return await getStoreChapterIndexList(id);
};

// bookGetReadInfo 获取当前阅读信息（阅读至第几章，开始阅读时间，最新阅读时间）
const bookGetReadInfo = async (tmp, { id }) => {
  const b = new BookReadInfo(id);
  const readInfos = [];
  const localReadInfo = await b.get();
  // 本地缓存的阅读信息
  let localNo = 0;
  if (localReadInfo) {
    localNo = localReadInfo.no;
    readInfos.push({
      no: localReadInfo.no,
      page: localReadInfo.page,
      updatedAt: localReadInfo.updatedAt
    });
  }
  // 服务器端缓存的阅读信息
  const serverReadInfo = find(state.book.favs, item => item.id === id);
  if (serverReadInfo && serverReadInfo.readingChapter) {
    const { no } = serverReadInfo.readingChapter;
    // 如果本地阅读记录与服务器相同，使用本地记录
    if (no !== localNo) {
      readInfos.push({
        no,
        page: 1,
        updatedAt: new Date(serverReadInfo.updatedAt).getTime()
      });
    }
  }
  const arr = sortBy(readInfos, item => -item.updatedAt);
  return arr[0];
};

// bookUpdateReadInfo 更新当前阅读信息
const bookUpdateReadInfo = async (tmp, { id, no, page }) => {
  const b = new BookReadInfo(id);
  await b.update(no, page);
};

// bookGetUserFavs 获取用户收藏
const bookGetUserFavs = async ({ commit }) => {
  const res = await request.get(BOOKS_USER_FAVS);
  commit(BOOK_LIST_USER_FAV, res.data);
};

const bookToggleFav = async ({ commit }, { id, category }) => {
  await request.post(BOOKS_USER_FAVS + "/" + id, {
    category
  });
  await bookGetUserFavs({
    commit
  });
  if (category === "remove") {
    // 清除本地缓存阅读记录
    clearChapterStoreById(id);
    const b = new BookReadInfo(id);
    b.destroy();
  } else if (category === "add") {
    bookUserAction(
      { commit },
      {
        id,
        type: "like"
      }
    );
  }
};

// 更新收藏信息
const bookFavUpdate = async (tmp, { id, readingChapter, readingChapterNo }) => {
  await request.patch(BOOKS_USER_FAVS + "/" + id, {
    readingChapterNo,
    readingChapter
  });
};

// bookListBanner 获取banner推荐书籍
const bookListBanner = async ({ commit }) => {
  commit(BOOK_LIST_BANNER, [
    {
      img: "01CW2P1JZF2AA34564TZWRXGJA",
      id: "80736"
    },
    {
      img: "01CW2P2SGK7QBPJVHWMT7D8B7X",
      id: "79675"
    }
  ]);
};

const actions = {
  bookListBanner,
  bookGetDetail,
  bookList,
  bookCacheRemove,
  bookListTodayRecommend,
  bookListCategory,
  bookListLatestPopu,
  bookSearch,
  bookClearSearchResult,
  bookGetRecommend,
  bookGetChapters,
  bookGetChapterContent,
  bookDownload,
  bookGetStoreChapterIndexes,
  bookGetReadInfo,
  bookUpdateReadInfo,
  bookGetUserFavs,
  bookToggleFav,
  bookFavUpdate,
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
    const list = stateData.list.slice(0);
    const { books, count, offset } = data;
    books.forEach(function(item, i) {
      if (item.updatedAt) {
        item.updatedAt = formatDate(item.updatedAt);
      }
      list[offset + i] = item;
    });
    stateData.list = list;
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
  },
  [BOOK_LIST_USER_FAV](state, data) {
    const { favs } = data;
    state.book.favs = sortBy(favs, item => {
      if (item.latestChapter) {
        return item.latestChapter.updatedAt;
      }
      return item.updatedAt;
    }).reverse();
  },
  [BOOK_LIST_BANNER](state, data) {
    state.book.banners = data;
  }
};

export default {
  actions,
  state,
  mutations
};
