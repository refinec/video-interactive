import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    question_len: 0,
    cur_question_arr_index: 0,
    videoInfo: {
      video_path: "",
      video_title: "",
      video_w: 0,
      video_h: 0,
      video_total_time: 0,
    },
    question_arr: [],
  },
  mutations: {
    addVideoQuestion(state, payload) {
      state.question_arr.push(payload);
      state.question_len++;
    },
    delVideoQuestion(state, index) {
      state.cur_question_arr_index = 0;
      state.question_arr.splice(index, 1);
    },
    setVideoInfo(state, payload = {}) {
      const {
        video_path = "",
        video_title = "",
        video_w = 0,
        video_h = 0,
        video_total_time = 0,
      } = payload;
      state.videoInfo.video_path = video_path;
      state.videoInfo.video_title = video_title;
      state.videoInfo.video_w = video_w;
      state.videoInfo.video_h = video_h;
      state.videoInfo.video_total_time = video_total_time;
    },
    setCurQuestionIndex(state, i) {
      state.cur_question_arr_index = i;
    },
    setLastSelect(state, n) {
      state.question_arr[state.cur_question_arr_index].lastSelect = n;
    },
    setQCurTime(state, time) {
      state.question_arr[state.cur_question_arr_index].cur_time = time;
    },
    setQTitle(state, t) {
      state.question_arr[state.cur_question_arr_index].q_title = t;
    },
    setQScore(state, bol) {
      state.question_arr[state.cur_question_arr_index].q_score = bol;
    },
    setQCanWatchResult(state, bol) {
      state.question_arr[state.cur_question_arr_index].q_can_watch_result = bol;
    },
    delQuestion(state, i) {
      state.question_arr[state.cur_question_arr_index].q_arr.splice(i, 1);
    },
    replaceQuestion(state, {
      index,
      obj
    }) {
      state.question_arr[state.cur_question_arr_index].q_arr.splice(
        index,
        1,
        obj
      );
    },
    addQuestion(state, payload) {
      state.question_arr[state.cur_question_arr_index].q_arr.push(payload);
    },
    swapQArr(state, {
      p_i,
      l_i
    }) {
      const q_arr = state.question_arr[state.cur_question_arr_index].q_arr;
      q_arr[p_i] = q_arr.splice(l_i, 1, q_arr[p_i])[0];
    },
    initVideoStatus(state) {
      state.videoInfo = {
        video_title: "",
        video_w: 0,
        video_h: 0,
        video_total_time: 0,
      };
      state.cur_question_arr_index = 0;
      state.question_arr = [];
    },
  },
});
