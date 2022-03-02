<template>
  <div class="question-content">
    <template v-if="question_arr.length > 0">
      <el-menu
        :default-active="activeIndex"
        class="que-conf-menu"
        mode="horizontal"
        @select.self="setMenuIndex"
      >
        <el-menu-item index="1" title="测验选项属性">
          <img
            src="../assets/img/option.png"
            class="item-img"
            width="25px"
            height="25px"
          />
        </el-menu-item>
        <el-menu-item index="2" title="测验问题属性">
          <img
            src="../assets/img/questionMark.png"
            class="item-img"
            width="20px"
            height="20px"
          />
        </el-menu-item>
      </el-menu>
      <div class="title-wrapper">
        <img
          src="../assets/img/option_title.png"
          width="22px"
          height="22px"
          class="item-img title-img"
        />
        <div class="title">
          <p class="inline-title">{{ q_title }}</p>
          -
          {{ activeIndex === "1" ? "选项" : "问题" }}
        </div>
      </div>
      <div class="title-content">
        <div class="question-option" v-show="activeIndex === '1'">
          <el-form label-width="50px" size="mini" @submit.native.prevent>
            <el-form-item label="名称:">
              <el-input v-model.trim="q_title"></el-input>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="q_score">测验分数</el-checkbox>
              <el-checkbox v-model="q_can_watch_result"
                >查看者可看到他们的结果</el-checkbox
              >
            </el-form-item>
          </el-form>
        </div>
        <div class="question-conf" v-show="activeIndex === '2'">
          <div
            class="question-wrapper"
            v-for="(que, i) in curcur_question_q_arr"
            :key="i"
          >
            <div class="question-title">
              <img
                class="close-img"
                src="../assets/img/close.png"
                width="14px"
                height="14px"
                @click.stop="delQuestion(i)"
              />
              <span class="main-title">{{ que.title }}</span>
              <div class="toggle-position">
                <button
                  :disabled="!canUp(curcur_question_q_arr, i)"
                  :class="[
                    'toggle-btn',
                    { disable: !canUp(curcur_question_q_arr, i) },
                  ]"
                  @click="swapArr(i - 1, i)"
                >
                  <img src="../assets/img/up.png" title="向上" />
                </button>
                <button
                  :disabled="!canDown(curcur_question_q_arr, i)"
                  :class="[
                    'toggle-btn',
                    { disable: !canDown(curcur_question_q_arr, i) },
                  ]"
                  @click="swapArr(i + 1, i)"
                >
                  <img src="../assets/img/down.png" title="向下" />
                </button>
              </div>
            </div>
            <el-form label-width="70px" size="mini" @submit.native.prevent>
              <el-form-item label="类型:">
                <el-select v-model="que.type" @change="curSelect($event, i)">
                  <el-option label="单项选择" :value="1"></el-option>
                  <el-option label="填空" :value="2"></el-option>
                  <el-option label="简答" :value="3"></el-option>
                  <el-option label="真/假" :value="4"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="问题:">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="请输入问题标题"
                  v-model="que.title"
                ></el-input>
              </el-form-item>
              <template v-if="que.type === 1">
                <el-form-item label="答案:">
                  <el-radio-group v-model="que.correctAnswer">
                    <el-radio
                      v-for="(an, i) in que.answer"
                      :key="i"
                      :label="i + 1"
                    >
                      <div class="answer">
                        <el-input
                          placeholder="添加答案"
                          v-model="an.q"
                          @blur="blurAnswerInput($event, i, que.answer)"
                          @input="addAnswerInput($event, i, que.answer)"
                        ></el-input>
                        <img
                          v-if="que.answer.length - 1 !== i"
                          src="../assets/img/close.png"
                          width="14px"
                          height="14px"
                          @click.stop="delAnswerInput(i, que.answer)"
                        />
                      </div>
                    </el-radio>
                  </el-radio-group>
                  <el-checkbox v-model="que.feedback">显示反馈</el-checkbox>
                </el-form-item>
                <template v-if="que.feedback">
                  <el-form-item label="如果正确:">
                    <el-input
                      class="feedback-input"
                      v-model="que.correct.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作:">
                    <el-select
                      v-model="que.correct.type"
                      @change="curFeedBackSelect($event, que.correct)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.correct.type === 'location'"
                      v-model="que.correct.location"
                      @change="URLChange($event, que.correct)"
                    ></el-input>
                    <div
                      v-if="que.correct.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input
                            size="mini"
                            v-model="que.correct.m"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.s"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.f"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="如果错误:">
                    <el-input
                      class="feedback-input"
                      v-model="que.incorrect.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作">
                    <el-select
                      v-model="que.incorrect.type"
                      @change="curFeedBackSelect($event, que.incorrect)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.incorrect.type === 'location'"
                      v-model="que.incorrect.location"
                      @change="URLChange($event, que.incorrect)"
                    ></el-input>
                    <div
                      v-if="que.incorrect.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input size="mini" v-model="que.incorrect.m" />:
                          <el-input size="mini" v-model="que.incorrect.s" />:
                          <el-input size="mini" v-model="que.incorrect.f" />
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </template>
              </template>
              <template v-if="que.type === 2">
                <el-form-item label class="tip">可接受答案列表:</el-form-item>
                <el-form-item label="答案:">
                  <div class="answer" v-for="(an, i) in que.answer" :key="i">
                    <el-input
                      placeholder="添加答案"
                      v-model="an.q"
                      @blur="blurAnswerInput($event, i, que.answer)"
                      @input="addAnswerInput($event, i, que.answer)"
                    ></el-input>
                    <img
                      v-if="que.answer.length - 1 !== i"
                      src="../assets/img/close.png"
                      width="14px"
                      height="14px"
                      @click.stop="delAnswerInput(i, que.answer)"
                    />
                  </div>
                  <el-checkbox v-model="que.feedback">显示反馈</el-checkbox>
                </el-form-item>
                <template v-if="que.feedback">
                  <el-form-item label="如果正确:">
                    <el-input
                      class="feedback-input"
                      v-model="que.correct.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作:">
                    <el-select
                      v-model="que.correct.type"
                      @change="curFeedBackSelect($event, que.correct)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.correct.type === 'location'"
                      v-model="que.correct.location"
                      @change="URLChange($event, que.correct)"
                    ></el-input>
                    <div
                      v-if="que.correct.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input
                            size="mini"
                            v-model="que.correct.m"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.s"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.f"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="如果错误:">
                    <el-input
                      class="feedback-input"
                      v-model="que.incorrect.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作">
                    <el-select
                      v-model="que.incorrect.type"
                      @change="curFeedBackSelect($event, que.incorrect)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.incorrect.type === 'location'"
                      v-model="que.incorrect.location"
                      @change="URLChange($event, que.incorrect)"
                    ></el-input>
                    <div
                      v-if="que.incorrect.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input size="mini" v-model="que.incorrect.m" />:
                          <el-input size="mini" v-model="que.incorrect.s" />:
                          <el-input size="mini" v-model="que.incorrect.f" />
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </template>
              </template>
              <template v-if="que.type === 4">
                <el-form-item label="答案:">
                  <el-radio-group
                    v-model="que.correctAnswer"
                    style="margin-top: 10px"
                  >
                    <el-radio :label="true">真</el-radio>
                    <el-radio :label="false">假</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="que.feedback">显示反馈</el-checkbox>
                </el-form-item>
                <template v-if="que.feedback">
                  <el-form-item label="如果正确:">
                    <el-input
                      class="feedback-input"
                      v-model="que.correct.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作:">
                    <el-select
                      v-model="que.correct.type"
                      @change="curFeedBackSelect($event, que.correct)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.correct.type === 'location'"
                      v-model="que.correct.location"
                      @change="URLChange($event, que.correct)"
                    ></el-input>
                    <div
                      v-if="que.correct.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input
                            size="mini"
                            v-model="que.correct.m"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.s"
                          ></el-input
                          >:
                          <el-input
                            size="mini"
                            v-model="que.correct.f"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="如果错误:">
                    <el-input
                      class="feedback-input"
                      v-model="que.incorrect.name"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="操作">
                    <el-select
                      v-model="que.incorrect.type"
                      @change="curFeedBackSelect($event, que.incorrect)"
                    >
                      <el-option label="继续" value="continue"></el-option>
                      <el-option label="转到 URL" value="location"></el-option>
                      <el-option
                        label="跳转到时间"
                        value="jumpToTime"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      class="feedback-input"
                      v-if="que.incorrect.type === 'location'"
                      v-model="que.incorrect.location"
                      @change="URLChange($event, que.incorrect)"
                    ></el-input>
                    <div
                      v-if="que.incorrect.type === 'jumpToTime'"
                      class="jumpToTime"
                    >
                      <span>时间</span>
                      <div>
                        <span class="tag">(MMM:SS:FF)</span>
                        <div>
                          <el-input size="mini" v-model="que.incorrect.m" />:
                          <el-input size="mini" v-model="que.incorrect.s" />:
                          <el-input size="mini" v-model="que.incorrect.f" />
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </template>
              </template>
            </el-form>
          </div>
          <div class="plus-question" @click="addQuestion">
            <i class="el-icon-plus"></i> 添加问题
          </div>
        </div>
      </div>
    </template>
    <el-empty
      v-else
      description="当前视频暂无测验题"
      :image="require('../assets/img/test.png')"
    ></el-empty>
  </div>
</template>
<script>
/* 单选 */
const SingleChoice = {
  type: 1,
  title: "默认问题文本",
  answer: [
    {
      q: "默认答案文本",
    },
    {
      q: "",
    },
  ],
  correctAnswer: 1,
  feedback: false, // 显示反馈， 问答没有该选项
  correct: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
  incorrect: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
};
/* 填空 */
const Pack = {
  type: 2,
  title: "默认问题文本",
  answer: [
    {
      q: "默认答案文本",
    },
    {
      q: "",
    },
  ],
  feedback: false,
  correct: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
  incorrect: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
};
/* 简答 */
const QA = {
  type: 3,
  title: "默认问题文本",
};
/* 真/假题 */
const TrueOrFalse = {
  type: 4,
  title: "默认问题文本",
  correctAnswer: true,
  feedback: false, // 显示反馈， 问答没有该选项
  correct: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
  incorrect: {
    name: "",
    type: "continue",
    location: "",
    jumpToTime: 0,
    m: null,
    s: null,
    f: null,
  },
};
const concat = {
  1: SingleChoice,
  2: Pack,
  3: QA,
  4: TrueOrFalse,
};
export default {
  name: "EditQuestion",
  data() {
    return {
      activeIndex: "2",
    };
  },
  computed: {
    question_arr() {
      return this.$store.state.question_arr;
    },
    cur_question_arr_index() {
      return this.$store.state.cur_question_arr_index;
    },
    cur_question_arr() {
      return this.question_arr[this.cur_question_arr_index];
    },
    curcur_question_q_arr() {
      return this.cur_question_arr?.q_arr;
    },
    videoInfo() {
      return this.$store.state.videoInfo;
    },
    q_title: {
      get() {
        return this.cur_question_arr?.q_title;
      },
      set(t) {
        this.$store.commit("setQTitle", t);
      },
    },
    q_score: {
      get() {
        return this.cur_question_arr?.q_score;
      },
      set(bol) {
        this.$store.commit("setQScore", bol);
      },
    },
    q_can_watch_result: {
      get() {
        return this.cur_question_arr?.q_can_watch_result;
      },
      set(bol) {
        this.$store.commit("setQCanWatchResult", bol);
      },
    },
  },
  methods: {
    setMenuIndex(key) {
      this.activeIndex = key;
    },
    curSelect(type, index) {
      this.$store.commit("setLastSelect", type);
      this.$store.commit("replaceQuestion", {
        index,
        obj: JSON.parse(JSON.stringify(concat[type])),
      });
    },
    curFeedBackSelect(type, fd_obj) {
      if (type === "location") {
        fd_obj[type];
      } else if (type === "jumpToTime") {
        fd_obj[type];
      }
    },
    blurAnswerInput(e, index, answerArr) {
      if (!e.target.value) {
        if (index === answerArr.length - 1) return;
        if (index == 0 && answerArr.length === 2) {
          return (answerArr[index]["q"] = "默认答案文本");
        }
        this.delAnswerInput(index, answerArr);
      }
    },
    addAnswerInput(v, index, answerArr) {
      if (v && index == answerArr.length - 1) {
        answerArr.push({ q: "" });
      }
    },
    delAnswerInput(index, answerArr) {
      if (answerArr.length === 2) return;
      answerArr.splice(index, 1);
    },
    addQuestion() {
      this.$store.commit(
        "addQuestion",
        JSON.parse(JSON.stringify(concat[this.cur_question_arr.lastSelect]))
      );
    },
    delQuestion(i) {
      this.$store.commit("delQuestion", i);
    },
    swapArr(p_i, l_i) {
      this.$store.commit("swapQArr", { p_i, l_i });
    },
    canUp(q_arr, i) {
      if (0 < i && i <= q_arr.length - 1) {
        return true;
      }
      return false;
    },
    canDown(q_arr, i) {
      if (0 <= i && i < q_arr.length - 1) {
        return true;
      }
      return false;
    },
    URLChange(v, fd_obj) {
      if (!/:\/\//g.test(v)) {
        fd_obj.location = "http://" + v;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/scss/variables";
.item-img {
  object-fit: contain;
}
.question-content {
  height: 100%;
  box-sizing: border-box;
  border-left: 1px solid #383e44;
  .que-conf-menu {
    background: $areaBg;
    border-bottom: none;
    height: 40px;
    text-align: center;

    & > ::v-deep .el-menu-item:last-child {
      border-left: 1px solid #383e44;
      border-right: 1px solid #383e44;
    }
    ::v-deep .el-menu-item {
      height: inherit;
      line-height: 40px;
      color: $fontColor !important;
      width: 60px;
      padding: 0 0px;
      margin: 0;
      background: transparent !important;

      &.is-active {
        border-bottom-color: $btnBg;
      }
      &:hover {
        background: transparent !important;
        color: $fontColor !important;
      }
    }
  }
  .title-wrapper {
    padding: 10px;
    height: 35px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .title {
      width: 88%;
      position: relative;
      font-weight: bold;
      margin-right: 120px;
      text-align: center;
      white-space: nowrap;
      .inline-title {
        display: inline-block;
        margin: 0;
        min-width: 35%;
        max-width: 70%;
        text-align: end;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: bottom;
      }
    }
    .title-img {
      margin-right: 20px;
    }
  }
  .title-content {
    background: $areaBg;
    height: calc(100% - 75px);
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 7px;
    }
    &::-webkit-scrollbar-track {
      background-color: $queBg;
      box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #99a0a7;
      border-radius: 5px;
    }
    .question-option {
      padding: 24px 20px 0 40px;
      ::v-deep .el-form {
        .el-form-item {
          margin-bottom: 5px;
          .el-form-item__label {
            color: $fontColor;
            font-weight: bold;
          }
          .el-form-item__content {
            .el-input {
              .el-input__inner {
                font-size: 14px;
                background: $queContentBg;
                color: $fontColor;
                border-color: #383e44;
                height: 22px;
                line-height: 22px;
                border-radius: 2px;
                padding-left: 5px;
                &:focus {
                  border-color: #a9b1b6;
                }
              }
            }
            .el-checkbox__inner {
              background-color: #000000;
              border-color: #464f53;
            }
            .el-checkbox__label {
              color: $fontColor;
              font-size: 12px;
            }
          }
        }
      }
    }
    .question-conf {
      padding-top: 1px;
      .question-wrapper {
        position: relative;
        .question-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: $queBg;
          width: 100%;
          height: 30px;
          padding: 0 10px;
          box-sizing: border-box;
          margin-bottom: 10px;
          .close-img {
            cursor: pointer;
            -webkit-user-drag: none;
            &:active {
              filter: brightness(0.5);
            }
          }
          .main-title {
            color: $fontColor;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 8px;
          }
          .toggle-position {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            .toggle-btn {
              background: #383e44;
              border: #383e44;
              padding: 0;
              width: 10px;
              height: 10px;
              line-height: 10px;
              &:active {
                filter: sepia(1);
              }
              img {
                width: 10px;
                height: 10px;
                -webkit-user-drag: none;
                cursor: pointer;
              }
              &.disable {
                filter: opacity(0.5);
              }
            }
          }
        }
        ::v-deep .el-form {
          width: 80%;
          margin: 0 auto;
          .el-form-item.tip {
            margin: 0;
            height: 20px;
            .el-form-item__content {
              font-size: 12px;
              font-weight: bold;
            }
          }
          .el-form-item {
            margin-bottom: 5px;
            .el-form-item__label {
              color: $fontColor;
              font-weight: bold;
              font-size: 13px;
            }
            .el-form-item__content {
              .el-select {
                width: 100%;
              }
              .el-input {
                .el-input__inner {
                  height: 22px;
                  line-height: 22px;
                  border-radius: 2px;
                  background: #383e44;
                  border: 1px solid #383e44;
                  color: $fontColor;
                  padding-left: 10px;
                  font-size: 13px;
                }
              }
              .el-input.feedback-input {
                .el-input__inner {
                  background: $queContentBg;
                  border-color: #383e44;
                  &:focus {
                    border-color: $fontColor;
                  }
                }
              }
              .jumpToTime {
                display: flex;
                align-items: center;
                justify-content: space-between;
                & > span:first-child {
                  font-size: 13px;
                }
                .tag {
                  font-size: 11px;
                  margin-right: 5px;
                  & + div {
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-between;
                  }
                }
                .el-input {
                  .el-input__inner {
                    width: 30px;
                    background: transparent;
                    border: 1px solid #383e44;
                    padding: 0 2px;
                    font-size: 11px;
                    &:focus {
                      border-color: $fontColor;
                    }
                  }
                }
              }
              .el-textarea__inner {
                background: $queContentBg;
                border-color: $queBorderColor;
                padding: 5px;
                color: $fontColor;
                &:focus {
                  border-color: #a9b1b6;
                }
              }
              .answer {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                position: relative;
                .el-input__inner {
                  background: $queContentBg;
                  font-weight: bold;
                  &:focus {
                    border-color: $fontColor;
                  }
                }
                img {
                  cursor: pointer;
                  position: absolute;
                  right: -16px;
                  -webkit-user-drag: none;
                  &:active {
                    filter: brightness(0.5);
                  }
                }
              }
              .el-checkbox {
                display: block;
                .el-checkbox__inner {
                  background-color: #000000;
                  border-color: #464f53;
                }
                .el-checkbox__label {
                  color: $fontColor;
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
      ::v-deep .el-radio-group {
        width: 100%;
        .el-radio {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 5px;
          width: 100%;
          .el-radio__label {
            width: 100%;
          }
          .el-radio__inner {
            display: inline-block;
            border-color: #2b3137;
            background: $queBg;
            width: 12px;
            height: 12px;
            line-height: 12px;
            &::after {
              width: 8px;
              height: 8px;
              background-color: $fontColor;
            }
          }
        }
      }
      .plus-question {
        border: 1px dashed #383e44;
        text-align: center;
        cursor: pointer;
        height: 34px;
        line-height: 34px;
        font-size: 15px;
        font-weight: bold;
        user-select: none;
      }
    }
  }
}
</style>
<style lang="scss">
.el-select-dropdown.el-popper {
  background: #383e44;
  border-color: #58595c;
  .el-select-dropdown__item {
    color: #d9dee2;
    &.hover {
      background-color: #f5f7fa36;
      color: white;
    }
    &.selected {
      color: lightblue;
    }
  }
  .popper__arrow {
    border-bottom-color: #58595c !important;
    &::after {
      border-bottom-color: #383e44 !important;
    }
  }
}
</style>
