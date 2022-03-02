<template>
  <div class="video-interactive-container">
    <el-row style="height: 6%">
      <TopBar />
    </el-row>
    <el-row style="height: 59%">
      <el-col :span="5" class="video-list-wrapper">
        <div class="video-list-title">视频列表</div>
        <div class="video-list-content">
          <div
            :class="[
              'video-list-common video-content',
              { active: index == current_video.index },
            ]"
            v-for="(video, index) in video_list"
            :key="index"
            @click="setCurVideo(video.file, index)"
          >
            <div @click.stop="delfile(index)" class="del-icon">
              <i class="el-icon-delete"></i>
            </div>
            <video
              height="60"
              width="100"
              :poster="video.poster ? require('../../static/tempCache/' + video.poster + '/' + video.poster + '.jpg') : null"
              :src="videoURL(video.file)"
            ></video>
            <div class="thumbnail-title">
              <i class="el-icon-video-camera"></i>
              {{ video.name }}
            </div>
          </div>
          <div class="video-list-common video-add">
            <label for="addfile">
              <i class="el-icon-plus"></i>
            </label>
            <input type="file" id="addfile" accept=".mkv, video/*" @change="addFile" />
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="video-wrapper">
        <div class="video-content">
          <div id="player"></div>
          <!-- <video
            v-if="current_video.src"
            :src="current_video.src"
            ref="video"
            height="100%"
            width="100%"
            @canplay="canplay"
            @playing="playing"
            @pause="pause"
            @seeking="seeking"
            @timeupdate="timeupdate"
          ></video>-->
        </div>
      </el-col>
      <el-col :span="7" class="question-wrapper">
        <edit-question />
      </el-col>
    </el-row>
    <el-row type="flex" style="height: 66px">
      <el-col :span="24">
        <div class="video-control">
          <div>
            <button title="声音" @click="changeVolume" class="volume">
              <img
                :src="
                  this.cur_volume > 0
                    ? require('../assets/img/volume.png')
                    : require('../assets/img/mute.png')
                "
                style="margin-left: -1px; margin-top: 3px"
              />
            </button>
            <el-slider
              class="volume-slider"
              v-model="cur_volume"
              @input="handlerVolumeSlider"
              :show-tooltip="false"
              :min="0"
              :max="100"
            ></el-slider>
          </div>
          <button
            :disabled="!canPreviousFrame"
            :style="{
              filter: canPreviousFrame ? 'initial' : 'brightness(0.8)',
            }"
            :class="['btn control-btn', { disabled: !canPreviousFrame }]"
            title="上一帧"
            @click.stop="changeFrame('reduce')"
          >
            <img src="../assets/img/previous_frame.png" style="margin-left: -1px; margin-top: 3px" />
          </button>
          <button
            :disabled="!canNextFrame"
            :style="{
              filter: canNextFrame ? 'initial' : 'brightness(0.8)',
            }"
            :class="['btn control-btn', { disabled: !canNextFrame }]"
            title="下一帧"
            @click.stop="changeFrame('add')"
          >
            <img src="../assets/img/next_frame.png" style="margin-left: 2px; margin-top: 3px" />
          </button>
          <button
            :disabled="!current_video.src"
            :style="{
              filter: current_video.src ? 'initial' : 'brightness(0.8)',
            }"
            :class="['btn btn-play', { disabled: !current_video.src }]"
            :title="current_video.play ? '暂停' : '播放'"
            @click="btnplay"
          >
            <img
              v-show="current_video.play"
              style="margin-left: 0px; margin-top: 4px"
              src="../assets/img/pause.png"
            />
            <img
              v-show="!current_video.play"
              style="margin-left: 4px; margin-top: 4px"
              src="../assets/img/play.png"
            />
          </button>
          <button
            :disabled="!canPreviousMedia"
            :style="{
              filter: canPreviousMedia ? 'initial' : 'brightness(0.8)',
            }"
            :class="['btn control-btn', { disabled: !canPreviousMedia }]"
            title="上一媒体"
            @click.stop="changeMedia('previous')"
          >
            <img
              src="../assets/img/previous_video.png"
              style="
                margin-left: 0px;
                margin-top: 3px;
                width: 15px;
                height: 15px;
              "
            />
          </button>
          <button
            :disabled="!canNextMedia"
            :style="{
              filter: canNextMedia ? 'initial' : 'brightness(0.8)',
            }"
            :class="['btn control-btn', { disabled: !canNextMedia }]"
            title="下一媒体"
            @click.stop="changeMedia('next')"
          >
            <img
              src="../assets/img/next_video.png"
              style="
                margin-left: 0px;
                margin-top: 3px;
                height: 15px;
                width: 15px;
              "
            />
          </button>
          <el-slider
            class="progressSlider"
            v-model="current_video.cur_time"
            @input="changeVideoSlider"
            :show-tooltip="false"
            :min="0"
            :max="current_video.total_time"
          ></el-slider>
          <div class="time-wrapper">
            <span class="current_video_time">{{ secondsToTime(current_video.cur_time) }}</span>/
            <span class="video_total_time">{{ secondsToTime(current_video.total_time) }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row type="flex" style="height: calc(35% - 66px)">
      <el-col :span="24" class="frame-slider-wrapper">
        <div id="slider-wrapper">
          <div
            ref="contextMenu"
            class="context-menu"
            v-if="menuVisible"
            :style="menuStyle"
            @blur="closeMenu"
            @mouseleave="closeMenu"
          >
            <div @click="addVideoQuestion(current_video.cur_time)">将测验添加到时间线</div>
          </div>
          <div id="pips-range" ref="pipsRange">
            <div class="add-bg" @mouseenter="circleIsIn" @mouseleave="showAddCircle = false">
              <div class="add-circle" v-show="showAddCircle" v-slide>
                <img :src="require('../assets/img/add.png')" width="13" height="13" />
              </div>
            </div>
            <div
              v-for="(q, i) in question_arr"
              :key="i"
              v-drag:[i]="`${secondsToPixels(q.cur_time)}`"
              class="test-point"
              :data-title="q.q_title"
              :title="q.q_title"
              :style="{ '--bg': selectTest(i), background: selectTest(i) }"
            ></div>
          </div>
          <!-- <div id="wave-timeline"></div> -->
          <div id="wave-spectrogram" ref="wave-spectrogram"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import WaveSurfer from "wavesurfer.js";
// import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.js";
const { ipcRenderer } = require("electron");
import EditQuestion from "./EditQuestion.vue";
import TopBar from "./TopBar.vue";
import * as noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import WaveformPlaylist from "waveform-playlist";
let playlist = null;
let playlistEmitter = null;
let canvasObjArr = [];
import "xgplayer";
import Mp4Player from "xgplayer-mp4";
let player = null;
let service = null;
let weakMap = new WeakMap();
export default {
  name: "VideoInteractive",
  components: {
    EditQuestion,
    TopBar,
  },
  data() {
    return {
      video_list: [],
      last_volme: 0,
      cur_volume: 30,
      current_video: {
        video_path: "",
        fileName: "",
        index: -1,
        src: null,
        cur_time: 0,
        total_time: 0,
        play: false,
        isSelfTimeupdate: true,
        triggerName: null,
      },
      direction: "stop",
      direction_value: 0,
      cur_test_index: -1,
      menuVisible: false,
      menuStyle: {
        top: 0,
        left: 0,
      },
      showAddCircle: false,
      playlistLoaded: false,
    };
  },
  watch: {
    slideDirection(v) {
      this.slideDirFn(v);
    },
  },
  computed: {
    question_arr() {
      return this.$store.state.question_arr;
    },
    canPreviousFrame() {
      return !!this.current_video.src && this.current_video.cur_time > 0;
    },
    canNextFrame() {
      return (
        !!this.current_video.src &&
        this.current_video.cur_time < this.current_video.total_time
      );
    },
    canPreviousMedia() {
      return (
        !!this.current_video.src &&
        this.video_list.length > 1 &&
        this.current_video.index > 0
      );
    },
    canNextMedia() {
      return (
        !!this.current_video.src &&
        this.video_list.length > 1 &&
        this.current_video.index < this.video_list.length - 1
      );
    },
    slideDirection() {
      return this.direction;
    },
  },
  directives: {
    slide: {
      inserted: function (el, binding, vnode) {
        let pageX = 0;
        el.onmousedown = function () {
          let i = vnode.context.question_arr.length;
          vnode.context.addVideoQuestion(vnode.context.pixelsToSeconds(pageX));
          vnode.context.setCurQuestionIndex(i);
          vnode.context.cur_test_index = i;
        };
        const circleMove = function (e) {
          let event = e || window.event;
          pageX =
            event.clientX +
            document.getElementById("slider-wrapper").scrollLeft;
          el.style.left = pageX - 7 + "px";
        };
        weakMap.set(el, { circleMove });
        document
          .getElementById("slider-wrapper")
          .addEventListener("mousemove", circleMove);
      },
      unbind: function (el) {
        document
          .getElementById("slider-wrapper")
          .removeEventListener("mousemove", weakMap.get(el).circleMove);
      },
    },
    drag: {
      bind: function (el, binding) {
        el.style.left = binding.value + "px";
      },
      inserted: function (el, binding, vnode) {
        let mouse_is_down = false;
        let dx = 0; // 鼠标按下处在页面中的水平偏移
        let sx = 0; // div在页面中的水平偏移
        const move = function (e) {
          if (mouse_is_down) {
            let event = e || window.event;
            let pageX =
              event.pageX ||
              event.clientX +
                document.getElementById("slider-wrapper").scrollLeft;
            let left = pageX - (dx - sx);
            el.style.left = left + "px";
            vnode.context.$store.commit(
              "setQCurTime",
              vnode.context.pixelsToSeconds(left)
            );
          }
        };
        const up = function () {
          mouse_is_down = false;
          el.style.zIndex = 4;
        };
        weakMap.set(el, { move, up });
        el.onmousedown = function (e) {
          vnode.context.cur_test_index = binding.arg;
          vnode.context.setCurQuestionIndex(binding.arg);
          mouse_is_down = true;
          el.style.zIndex = 5;
          let event = e || window.event;
          let pageX =
            event.pageX ||
            event.clientX +
              document.getElementById("slider-wrapper").scrollLeft;
          dx = pageX;
          sx = el.offsetLeft;
        };
        document
          .getElementById("slider-wrapper")
          .addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
      },
      unbind: function (el) {
        document
          .getElementById("slider-wrapper")
          .removeEventListener("mousemove", weakMap.get(el).move);
        document.removeEventListener("mouseup", weakMap.get(el).up);
      },
    },
  },
  mounted() {
    this.sliderListener();
    this.initWavesurfer();
    this.initNoUiSlider();
    this.onWavesurferHeight();
    window.addEventListener("resize", this.onWavesurferHeight);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", this.onWavesurferHeight);
    });
  },
  methods: {
    initNoUiSlider() {
      noUiSlider.create(this.$refs.pipsRange, {
        range: {
          min: 0,
          max: this.current_video.total_time,
        },
        start: 0,
        tooltips: {
          from: Number,
          to: (v) => {
            return this.secondsToTime(v);
          },
        },
      });
      this.$refs.pipsRange.noUiSlider.on("slide", (values, handle) => {
        if (
          !(
            player &&
            playlist &&
            this.current_video.fileName
          )
        ) {
          return;
        }
        this.allPause();
        this.current_video.isSelfTimeupdate = false;
        this.current_video.triggerName = "slider";
        let cur_time = Number(values[handle]);
        playlistEmitter.emit("select", cur_time, cur_time);
      });
      this.$refs.pipsRange.noUiSlider.on("set", (values, handle) => {
        if (!(player && playlist)) {
          return;
        }
        if (this.current_video.triggerName === "slider") {
          return;
        }
        let cur_time = Number(values[handle]);
        // let targetRect = targetDom.getBoundingClientRect();
        // if (0 === targetRect.left) {
        //   this.direction = "left";
        // } else if (bodyDom.clientWidth < targetRect.right) {
        //   this.direction = "right";
        // } else {
        //   this.direction = "stop";
        // }
        this.direction_value = cur_time;
        document.querySelector(".noUi-tooltip").scrollIntoViewIfNeeded(true);
        if (player && playlist && !this.current_video.isSelfTimeupdate) {
          this.allPause();
        }
      });
      // this.$refs.pipsRange.noUiSlider.on("update", (values, handle) => { });
      this.$nextTick(() => {
        let targetDom = document.querySelector(
          ".noUi-handle.noUi-handle-lower"
        );
        targetDom.addEventListener("contextmenu", this.showMenu);
        this.$once("hook:beforeDestroy", () => {
          targetDom.removeEventListener("contextmenu", this.showMenu);
        });
      });
    },
    initWavesurfer() {
      // Promise.resolve().then(() => {
      //   if (wavesurfer) wavesurfer.destroy();
      //   wavesurfer = WaveSurfer.create({
      //     container: "#wave-spectrogram",
      //     backend: "MediaElement",
      //     // backgroundColor: "", // 波形容器的背景颜色
      //     // barGap: 1, // 波形条之间的可选间距（如果未提供）将以旧格式计算。
      //     // barHeight: 1, // 波形条的高度。大于 1 的数字将增加波形条的高度
      //     // barMinHeight: , // 绘制波形条的最小高度。默认行为是在静音期间不绘制条形图。
      //     // height: 128, // 波形的高度。以像素为单位。
      //     // partialRender: false, // 使用 PeakCache 提高大波形的渲染速度
      //     plugins: [
      //       //   WaveSurfer.spectrogram.create({
      //       //     wavesurfer: wavesurfer,
      //       //     container: "#wave-spectrogram",
      //       //     labels: true,
      //       //   }),
      //       TimelinePlugin.create({
      //         container: "#wave-timeline",
      //       }),
      //     ],
      //   });
      //   wavesurfer.load(videoUrl);
      // });
      playlist = WaveformPlaylist({
        ac: new (window.AudioContext || window.webkitAudioContext)(),
        container: document.getElementById("wave-spectrogram"),
        mono: true, // 单轨道
        waveHeight: (this.$refs["wave-spectrogram"]?.clientHeight - 59) * 2, // 波形高度
        samplesPerPixel: 5200, // 必须是zoomLevels中的一个值
        zoomLevels: [
          512, 1024, 2048, 4096, 5000, 5200, 9000, 10000, 15000, 20000, 30000,
        ], // 每个像素采样的缩放级数组。更小的数字有更大的放大效果。
        state: "cursor", // 播放列表的交互状态
        timescale: true, // 开启时间刻度
        isAutomaticScroll: false, // 播放时是否自动滚动波形
        colors: {
          waveOutlineColor: "#383e44", // 轨道背景颜色 #383e44
          timeColor: "grey",
          fadeColor: "black",
        },
        // 左侧的控制面板
        controls: {
          show: false,
          width: 150,
        },
        seekStyle: "line",
        exclSolo: true,
        barWidth: 1,
        barGap: 0, // 波形条之间的像素间距。
      });
      const audioStates = [
        "未初始化",
        "加载中...",
        "频谱解码中...",
        "解码完成",
      ];
      playlistEmitter = playlist.getEventEmitter();
      playlistEmitter.on("audiorequeststatechange", (state, src) => {
        // console.log("解析中", state);
        let name = this.current_video.fileName;
        if (src instanceof File) name = src.name;
        if (state === 1) {
          service = this.$loading.service({
            fullscreen: true,
            body: true,
            lock: true,
            background: "rgba(76, 76, 76, 0.80)",
            text: "视频文件" + name + audioStates[state],
          });
        }
        service.setText("视频文件" + name + audioStates[state]);
        if (audioStates[state] === "解码完成") {
          service.close();
        }
      });
      playlistEmitter.on("loadprogress", (percent, src) => {
        let name = this.current_video.fileName;
        if (src instanceof File) name = src.name;
        service.setText(
          "视频文件" + name + "已加载" + percent.toFixed(2) + "%"
        );
      });
      playlistEmitter.on("audiosourcesloaded", () => {
        // console.log("解码完成.");
      });
      playlistEmitter.on("audiosourcesrendered", () => {
        // console.log("渲染完成.");
        canvasObjArr = document.querySelectorAll(
          "#wave-spectrogram .channel canvas"
        );
        let channelWidth = document.querySelector(
          "#wave-spectrogram .channel"
        )?.clientWidth;
        if (!channelWidth) {
          return;
        }
        document.querySelector("#wave-spectrogram").style.width =
          document.querySelector("#pips-range .noUi-base").style.width =
          document.querySelector("#pips-range .add-bg").style.width =
            channelWidth + "px";
      });
      playlistEmitter.on("audiosourceserror", (e) => {
        // console.log("视频文件解码失败", e);
        this.$notification.error({
          title: "错误",
          message: "视频文件解码失败! " + e.message,
        });
      });
      playlistEmitter.on("timeupdate", (playbackPosition) => {
        if (
          !this.current_video.isSelfTimeupdate ||
          this.current_video.triggerName === "changeFrame" ||
          this.current_video.triggerName === "slider"
        ) {
          return playlistEmitter.emit("pause");
        }
        // 如果是视频自己自动更新
        this.current_video.cur_time = playbackPosition;
        this.$refs.pipsRange.noUiSlider.set(playbackPosition);
      });
      playlistEmitter.on("select", (start, end) => {
        // console.log("playlistEmitter.on[select]==>", start, end);
        let triggerName = this.current_video.triggerName;
        if (
          triggerName === "changeVideoSlider" ||
          triggerName === "changeFrame"
        ) {
          this.$refs.pipsRange.noUiSlider.set(end);
        } else if (triggerName === "slider") {
          player.currentTime = this.current_video.cur_time = end;
        }
      });
    },
    loadWavesurfer(videoUrl, filePath, fileName, videoIndex) {
      let isLoad = false;
      service = this.$loading.service({
        fullscreen: true,
        body: true,
        lock: true,
        background: "rgba(76, 76, 76, 0.80)",
        text: "视频文件" + fileName + "正在转换中...",
      });
      ipcRenderer.send("transform-mp3", filePath);
      ipcRenderer.on("transform-mp3-progress", (event, progress) => {
        if (progress > 95) {
          return service.close();
        }
        try {
          service.setText(
            "视频文件" + fileName + "正在转换中..." + progress.toFixed(2) + "%"
          );
        } catch (error) {
          console.error(error);
        }
      });
      ipcRenderer.on(
        "transform-mp3-reply",
        (event, { temp_mp3_url, imgName }) => {
          if (isLoad) return;
          isLoad = true;
          service.close();
          this.video_list[this.video_list.length - 1].poster = imgName;
          playlist
            .load([
              {
                src: temp_mp3_url ? this.videoURL(temp_mp3_url) : videoUrl,
                gain: 0, // 在[0-1]之间的轨道音量水平
                muted: true, // 音轨最初是否应该静音。
                states: {
                  cursor: false,
                  fadein: false,
                  fadeout: false,
                  select: false,
                  shift: false,
                },
              },
            ])
            .then(() => {
              this.playlistLoaded = true;
            });
        }
      );
      ipcRenderer.on("handle_error", () => {
        service.close();
        this.$notification.error({
          title: "视频解析错误",
        });
        this.video_list.splice(videoIndex, 1);
        this.$store.commit("initVideoStatus");
        this.current_video = {
          video_path: "",
          fileName: "",
          index: -1,
          src: null,
          cur_time: 0,
          total_time: 0,
          play: false,
          isSelfTimeupdate: true,
          triggerName: null,
        };
        canvasObjArr = [];
        this.destroyPlayer();
      });
    },
    /* 左侧视频列表 start */
    addFile(e) {
      if (this.video_list.some((v) => v.path == e.target.files[0].path)) {
        this.$notification.warning({
          title: "警告",
          message: e.target.files[0].name + "已存在！",
        });
        e.target.value = "";
        return;
      }
      this.video_list.push({
        name: e.target.files[0].name,
        file: e.target.files[0],
        path: e.target.files[0].path,
        poster: null,
      });
      e.target.value = "";
    },
    delfile(i) {
      this.video_list.splice(i, 1);
      this.$store.commit("initVideoStatus");
      ipcRenderer.send("del-cur-video", this.current_video.fileName);
      this.current_video = {
        video_path: "",
        fileName: "",
        index: -1,
        src: null,
        cur_time: 0,
        total_time: 0,
        play: false,
        isSelfTimeupdate: true,
        triggerName: null,
      };
      playlistEmitter.emit("clear");
      canvasObjArr = [];
      this.$refs.pipsRange.noUiSlider.set(0);
      this.destroyPlayer();
    },
    setCurVideo(file, index) {
      if (this.current_video.index == index) return;
      this.$store.commit("initVideoStatus");
      this.current_video = {
        video_path: file.path,
        fileName: file.name,
        index,
        src: this.videoURL(file),
        cur_time: 0,
        total_time: 0.01,
        play: false,
        isSelfTimeupdate: true,
        triggerName: null,
      };
      playlistEmitter.emit("clear");
      this.playlistLoaded = false;
      this.initPlayer();
      this.loadWavesurfer(
        this.current_video.src,
        file.path,
        this.current_video.fileName,
        index
      );
    },
    /* 左侧视频列表 end */

    /* TODO: xgplayer西瓜播放器相关 start */
    initPlayer() {
      player = new Mp4Player({
        id: "player",
        url: this.current_video.src,
        fluid: true,
        volume: this.cur_volume / 100,
        videoInit: true,
        controls: false,
      });
      player.on("canplay", this.canplay);
      player.on("play", this.play);
      player.on("playing", this.playing);
      player.on("seeking", this.seeking);
      player.on("pause", this.pause);
      player.on("timeupdate", this.timeupdate);
      this.$once("hook:beforeDestroy", () => {
        this.destroyPlayer();
      });
    },
    destroyPlayer() {
      const eventTable = [
        "canplay",
        "play",
        "playing",
        "seeking",
        "pause",
        "timeupdate",
      ];
      for (const it of eventTable) {
        player.off(it, this[it]);
      }
      player.destroy(true);
    },
    /* xgplayer相关 end */

    /* video控制条相关 start */
    changeVideoSlider(progress = 0) {
      if (
        this.current_video.isSelfTimeupdate ||
        this.current_video.triggerName === "changeFrame" ||
        this.current_video.triggerName === "slider"
      ) {
        return;
      }
      if (player && playlist) {
        this.allPause();
        this.current_video.triggerName = "changeVideoSlider";
        player.currentTime = progress;
        playlistEmitter.emit("select", progress, progress);
      }
    },
    changeFrame(type) {
      this.allPause();
      this.current_video.isSelfTimeupdate = false;
      this.current_video.triggerName = "changeFrame";
      if (type === "reduce" && this.canPreviousFrame) {
        player.currentTime = (this.current_video.cur_time -= 0.01).toFixed(2);
      } else if (type === "add" && this.canNextFrame) {
        player.currentTime = (this.current_video.cur_time += 0.01).toFixed(2);
      }
      playlistEmitter.emit("select", player.currentTime, player.currentTime);
    },
    changeMedia(type) {
      let ind = this.current_video.index;
      if (type === "previous" && player) {
        if (this.canPreviousMedia) {
          this.setCurVideo(this.video_list[ind - 1].file, ind - 1);
        } else {
          player.currentTime = 0;
          playlistEmitter.emit("rewind");
        }
      } else if (type === "next" && player) {
        if (this.canNextMedia) {
          this.setCurVideo(this.video_list[ind + 1].file, ind + 1);
        } else {
          player.currentTime = this.current_video.total_time;
          playlistEmitter.emit("fastforward");
        }
      }
    },
    btnplay() {
      this.current_video.play = !this.current_video.play;
      this.current_video.triggerName = null;
      if (this.current_video.play) {
        this.current_video.isSelfTimeupdate = true;
        this.allPlay();
      } else {
        this.current_video.isSelfTimeupdate = false;
        this.allPause();
      }
    },
    handlerVolumeSlider(volume) {
      if (player) {
        this.last_volme = player.volume = volume / 100;
      }
    },
    changeVolume() {
      if (this.cur_volume === 0 && this.last_volme === 0) return;
      if (this.cur_volume > 0) {
        this.cur_volume = 0;
      } else if (this.cur_volume == 0 && this.last_volme > 0) {
        this.cur_volume = this.last_volme;
      }
    },
    sliderListener() {
      const mousedown = () => {
        this.current_video.isSelfTimeupdate = false;
        this.current_video.triggerName = "changeVideoSlider";
      };
      const mouseUp = () => {
        this.current_video.isSelfTimeupdate = true;
        this.current_video.triggerName = null;
      };
      for (const btn of document.querySelectorAll(".btn.control-btn")) {
        btn.addEventListener("mousedown", mousedown);
        btn.addEventListener("mouseup", mouseUp);
      }
      document
        .querySelector(".progressSlider .el-slider__button-wrapper")
        ?.addEventListener("mousedown", mousedown);
      document
        .querySelector(".progressSlider .el-slider__button-wrapper")
        ?.addEventListener("mouseup", mouseUp);
      document.addEventListener("mouseup", mouseUp);
      this.$once("hook:beforeDestory", () => {
        for (const btn of document.querySelectorAll(".btn.control-btn")) {
          btn.removeEventListener("mousedown", mousedown);
          btn.removeEventListener("mouseup", mouseUp);
        }
        document
          .querySelector(".progressSlider .el-slider__button-wrapper")
          .removeEventListener("mousedown", mousedown);
        document
          .querySelector(".progressSlider .el-slider__button-wrapper")
          .removeEventListener("mouseup", mouseUp);
        document.removeEventListener("mouseup", mouseUp);
      });
    },
    canplay() {
      if (this.current_video.total_time < 1) {
        this.$store.commit("setVideoInfo", {
          video_path: this.current_video.video_path,
          video_title: this.current_video.fileName,
          video_w: player.config.width,
          video_h: player.config.height,
          video_total_time: player.duration,
        });
        this.current_video.total_time = player.duration;
        player.volume = this.cur_volume / 100;
        this.$refs.pipsRange.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: player.duration,
          },
        });
      }
    },
    play() {
      // console.log("🍉播放");
    },
    playing() {
      // console.log("🍉继续播放");
    },
    pause() {
      // console.log("🍉暂停");
    },
    seeking() {
      // console.log("🍉【seeking】");
    },
    timeupdate() {
      // console.log("🍉【timeupdate】");
    },
    allPlay() {
      this.current_video.play = true;
      player?.play();
      playlistEmitter?.emit("play");
    },
    allPause() {
      this.current_video.play = false;
      player?.pause();
      playlistEmitter?.emit("pause");
    },
    addVideoQuestion(cur_time = 0) {
      this.$store.commit("addVideoQuestion", {
        lastSelect: 3,
        cur_time,
        q_title: "测验 " + (this.question_arr.length + 1),
        q_score: true,
        q_can_watch_result: true,
        q_arr: [],
      });
      this.setCurQuestionIndex(this.question_arr.length - 1);
    },
    setCurQuestionIndex(i) {
      this.$store.commit("setCurQuestionIndex", i);
    },
    circleIsIn() {
      if (this.playlistLoaded) this.showAddCircle = true;
    },
    circleIsOut() {
      if (this.playlistLoaded) this.showAddCircle = false;
    },
    /* video控制条相关 end */

    /* 以下工具方法 start */
    videoURL(file) {
      return window.URL.createObjectURL(new Blob([file]));
    },
    secondsToTime(time = 0, forceHours) {
      try {
        isNaN(time) && (time = 0);
        let hours = Math.floor(time / 3600) % 24,
          minutes = Math.floor(time / 60) % 60,
          seconds = Math.floor(time % 60),
          frame = String(time.toFixed(2)).match(/(?<=\d+\.).*/)[0],
          result =
            (forceHours || hours > 0
              ? (hours < 10 ? "0" + hours : hours) + ":"
              : "00:") +
            (minutes < 10 ? "0" + minutes : minutes) +
            ":" +
            (seconds < 10 ? "0" + seconds : seconds) +
            ";" +
            frame.padStart(2, 0);
        return result;
      } catch (error) {
        console.error(error);
      }
    },
    onWavesurferHeight() {
      try {
        if (canvasObjArr.length > 0) {
          let canvasHeight =
            (this.$refs["wave-spectrogram"].clientHeight - 59) * 2;
          document.querySelector("#wave-spectrogram .channel").style.height =
            canvasHeight + "px";
          // playlist.setWaveHeight(canvasHeight);
          for (const canvasObj of canvasObjArr) {
            canvasObj.style.height = canvasHeight + "px";
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    slideDirFn(dir = "stop") {
      // let containerDom = document.querySelector(".slider-wrapper");
      // let timer = null;
      switch (dir) {
        case "left":
          console.log("go left");
          // containerDom.scrollBy(-1, 0);
          break;
        case "right":
          console.log("go right");
          // timer = setInterval(() => {
          //   containerDom.scrollBy(5, 0);
          //   this.$refs.pipsRange.noUiSlider.set(++this.direction_value);
          // }, 0);
          break;
        case "stop":
          // clearInterval(timer);
          break;
      }
    },
    selectTest(i) {
      return this.cur_test_index == i ? "#fffe5587" : "#62bc69";
    },
    pixelsToSeconds(pixels) {
      return (pixels * playlist.samplesPerPixel) / playlist.sampleRate;
    },
    secondsToPixels(time) {
      return (
        (Number(time.toFixed(2)) * playlist.sampleRate) /
        playlist.samplesPerPixel
      );
    },
    showMenu(event) {
      if (!(player && playlist)) {
        return;
      }
      this.menuVisible = true;
      this.$nextTick(() => {
        this.$refs.contextMenu.focus();
        this.setMenu(
          event.pageY,
          event.pageX + document.getElementById("slider-wrapper").scrollLeft
        );
      });
    },
    setMenu(top, left) {
      const el = this.$refs.contextMenu.parentNode;
      const elSize = el.getBoundingClientRect();
      const elY = window.pageYOffset + elSize.top;
      const elX = window.pageXOffset + elSize.left;
      let menuY = top - elY;
      let menuX = left - elX;
      this.menuStyle = {
        top: `${menuY}px`,
        left: `${menuX}px`,
      };
    },
    closeMenu() {
      this.menuVisible = false;
    },
    /* 以上工具方法 end */
  },
};
</script>
<style scoped lang="scss">
@import "../assets/scss/variables";

.video-interactive-container {
  width: 100vw;
  height: 100vh;
  background: $videoBg;
  color: $fontColor;

  .video-list-wrapper {
    height: 100%;
    position: relative;
    .video-list-title {
      font-size: 0.9rem;
      font-weight: 500;
      width: 100%;
      text-align: center;
      padding: 10px 0;
    }

    .video-list-content {
      box-sizing: border-box;
      width: 100%;
      height: calc(100% - 40px);
      padding: 12px;
      border-color: $contentBg;
      background: $contentBg;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 0;
      }

      .video-list-common {
        width: 120px;
        height: 90px;
        background: $queBg;
        border-radius: 5px;
        display: inline-block;
        margin-left: 10px;
        margin-right: 5px;
      }

      .video-content {
        position: relative;
        padding: 5px;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        margin-bottom: 10px;
        cursor: pointer;

        &.active {
          border: 1px solid yellowgreen;
        }

        .del-icon {
          width: 30px;
          height: 30px;
          position: absolute;
          right: 0px;
          top: 5px;
          box-sizing: border-box;
          z-index: 999;

          ::v-deep i.el-icon-delete {
            color: #e57471;
            display: none;
          }
        }

        &:hover {
          ::v-deep .del-icon i.el-icon-delete {
            display: block;
            animation: fadenum 0.5s ease-in-out;
          }
        }

        .thumbnail-title {
          white-space: nowrap;
          overflow: hidden;
          font-size: 0.8rem;
          text-overflow: ellipsis;
        }
      }

      .video-add {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        vertical-align: top;
        border: 1px solid $queBg;
        transition: border-color 0.3s;
        &:hover {
          border-color: #f0f8ff8c;
        }
        label {
          cursor: inherit;
          ::v-deep i.el-icon-plus {
            font-size: 3rem;
          }
        }
        #addfile {
          display: none;
        }
      }
    }
  }

  .video-wrapper {
    background: $videoBg;
    height: 100%;
    position: relative;
    padding: 15px 5px 2px 5px;
    .video-content {
      width: 100%;
      height: 100%;
      border: 1px solid $videoBorderColor;
      box-sizing: border-box;
      background: $videoColor;
      ::v-deep #player {
        padding-top: 0 !important;
        height: 100% !important;
        .xgplayer-start {
          display: none !important;
        }
      }
    }
  }

  .question-wrapper {
    height: 100%;
    position: relative;
  }
  .video-control {
    width: 100%;
    height: 63px;
    background: $contentBg;
    margin-top: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    .volume {
      background: 0;
      border: 0;
      filter: drop-shadow(2px 4px 6px black);
      cursor: pointer;
    }
    .el-slider.volume-slider {
      display: inline-block;
      vertical-align: bottom;
      margin: 0 10px 0 2px;
      width: 70px;
      ::v-deep .el-tooltip.el-slider__button {
        width: 10px !important;
        height: 10px !important;
      }
    }
    .btn {
      padding: 0;
      border: none;
      background: #373e44;
      border-radius: 50%;
      cursor: pointer;
      user-select: none;
      margin-right: 10px;
      &:active {
        filter: opacity(0.7) !important;
      }
    }

    .control-btn {
      width: 28px;
      height: 28px;
      img {
        width: 18px;
        height: 18px;
      }
    }

    .btn-play {
      width: 45px;
      height: 45px;

      img {
        width: 32px;
        height: 32px;
      }
    }

    ::v-deep .el-slider {
      width: 370px;
      margin: 0 20px;
      .el-slider__runway {
        background-color: #464f53;
        .el-slider__bar {
          background-color: #409eff4d;
        }
        .el-tooltip.el-slider__button {
          border: none;
          width: 15px;
          height: 15px;
        }
      }
    }

    .time-wrapper {
      font-size: 16px;
      font-weight: 600;
      font-family: cursive;
      width: 200px;
      user-select: none;
    }
  }
  .frame-slider-wrapper {
    height: 100%;
    position: relative;
    #slider-wrapper {
      overflow-x: auto;
      overflow-y: hidden;
      height: 100%;
      position: relative;
      &::-webkit-scrollbar {
        height: 8px;
        // height: 0px;
      }
      &::-webkit-scrollbar-track {
        background-color: #000000;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #8e959c;
        border-radius: 5px;
      }
      .context-menu {
        position: absolute;
        z-index: 9997;
        background: #2f3034;
        border-radius: 5px;
        border: 1px solid #585a5d;
        width: 125px;
        height: 20px;
        font-size: 13px;
        line-height: 20px;
        padding: 7px 5px;
        font-weight: 500;
        div {
          padding: 1px 3px;
          border-radius: 5px;
          cursor: pointer;
          &:hover {
            background: #2c59b9;
          }
        }
      }
      #pips-range {
        background: #15191a;
        border: 1px solid #161a1c;
        box-shadow: 1px 1px inset #161a1c;
        height: 15px;
        margin-left: -3px;
        position: relative;
        .add-bg {
          position: absolute;
          top: 64px;
          left: 0;
          width: 100%;
          height: 15px;
          background: transparent;
          z-index: 1;
          .add-circle {
            position: absolute;
            background: #61ba69;
            width: 15px;
            height: 15px;
            left: 500px;
            top: 0;
            z-index: 9999;
            border-radius: 50%;
            line-height: 18px;
            text-align: center;
            user-select: none;
            transform-style: preserve-3d;
            &::before {
              position: absolute;
              content: "";
              display: block;
              width: 1px;
              left: 7px;
              top: -50px;
              z-index: -1;
              transform: translateZ(-1px);
              height: 400px;
              background: #436d4d;
            }
          }
        }
        .test-point {
          position: absolute;
          width: 1px;
          bottom: 0;
          top: 14px;
          z-index: 4;
          height: 400px;
          background: #62bc69;
          color: #ffffff;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          -webkit-font-smoothing: none;
          &::before {
            cursor: pointer;
            content: attr(data-title);
            box-sizing: border-box;
            padding: 0 4px;
            display: block;
            position: absolute;
            left: 0;
            top: 50px;
            width: fit-content;
            min-width: 15px;
            max-width: 80px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 14px;
            line-height: 14px;
            z-index: 4;
            background: var(--bg);
            border-top-left-radius: 5px;
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(0, 0, 0, 0.04);
          }
          &::after {
            cursor: pointer;
            content: "";
            display: block;
            position: absolute;
            left: 0;
            top: 64px;
            width: 0;
            height: 0;
            z-index: 4;
            border-top: 7px solid var(--bg);
            border-right: 10px solid transparent;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(0, 0, 0, 0.04);
          }
        }
        ::v-deep .noUi-base {
          .noUi-connects {
            box-shadow: 0px 0px 10px 2px rgba(238, 238, 238, 0.1) inset;
          }
          .noUi-origin {
            .noUi-handle {
              background: #5b7b80;
              border: 1px solid #89a6ad;
              border-bottom-color: #5b7b80;
              box-shadow: none;
              // clip-path: polygon(100% 0, 100% 50%, 50% 100%, 0 50%, 0 0);
              width: 30px;
              top: -1px;
              height: 13px;
              border-radius: 0;
              .noUi-tooltip {
                bottom: -9px;
                left: 25px;
                transform: none;
                background: transparent;
                border: none;
                color: #d1d1d1;
                font-size: 13px;
              }
              &::before {
                // left: 12px;
                // top: 3px;
                // display: none;
                content: "";
                position: absolute;
                top: 12px;
                left: -1px;
                width: 0;
                height: 0;
                border-style: solid;
                border-color: #89a6ad transparent transparent transparent;
                border-width: 11px 15px 0 15px;
                background: transparent;
              }
              &::after {
                // left: 15px;
                // top: 3px;
                content: "";
                position: absolute;
                top: 12px;
                left: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-color: #5b7b80 transparent transparent transparent;
                border-width: 10px 14px 0 14px;
                background: transparent;
              }
              .noUi-touch-area {
                &::after {
                  content: "";
                  display: block;
                  position: absolute;
                  height: 388px;
                  width: 1px;
                  background: #e8e7e6;
                  left: 14px;
                  top: 20px;
                }
              }
            }
          }
        }
        // 以下废弃
        ::v-deep .noUi-pips.noUi-pips-horizontal {
          background: #24282e;
          height: 50px;
          padding: 0;
          .noUi-marker.noUi-marker-horizontal.noUi-marker-large {
            background: #343b40;
            height: 13px;
            width: 3px;
          }
          .noUi-marker.noUi-marker-horizontal.noUi-marker-normal {
            background: #343b40;
            height: 10px;
          }
          .noUi-value.noUi-value-horizontal.noUi-value-large {
            color: #d9dee2;
            font-size: 0.9rem;
            top: 10%;
          }
        }
      }
      ::v-deep #wave-spectrogram {
        // margin-top: 60px;
        // height: calc(100% - 74px);
        // background: #373e44;
        height: calc(100% - 15px);
        background: #202329;
        position: relative;
        min-width: 100%;
        width: fit-content;
        .playlist {
          height: 100%;
          overflow: initial;
          .playlist-time-scale {
            // height: 30px;
            background: #24282e;
            height: 50px;
            margin-bottom: 15px;
            .time {
              margin-top: 10px;
              font-family: monospace;
            }
            canvas {
              transform: rotateX(180deg);
            }
          }
          .playlist-tracks {
            // background: #383e44;
            height: calc(100% - 65px);
            overflow-x: auto !important;
            overflow-y: hidden !important;
            &::-webkit-scrollbar {
              height: 8px;
            }
            &::-webkit-scrollbar-track {
              background-color: #14161a;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #8e959c;
              border-radius: 5px;
            }
            .waveform {
              // &::-webkit-scrollbar {
              //   width: 0px;
              // }
              .cursor {
                background: #d1d1d1;
                display: none;
              }
              .channel {
                background: #808080;
                z-index: 0 !important;
                // top: 64px !important;
              }
              // .playlist-overlay.state-cursor {
              //   background: #383e44;
              // }
              .selection.point {
                background: #d1d1d1;
                display: none;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes fadenum {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}
</style>
