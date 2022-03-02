<template>
  <el-col :span="24" class="export-wrapper">
    <button
      class="export-btn"
      @click="exportConfig"
      ref="exportBtn"
      :disabled="!video_info.video_title"
      :style="{
        filter: video_info.video_title ? 'initial' : 'brightness(0.5)',
        cursor: video_info.video_title ? 'pointer' : 'no-drop',
      }"
    >
      <img src="../assets/img/export.png" /> 导出
    </button>
  </el-col>
</template>
<script>
import { XMLBuilder } from "fast-xml-parser";
const { ipcRenderer } = require("electron");
export default {
  name: "TopBar",
  computed: {
    video_info() {
      return this.$store.state.videoInfo;
    },
  },
  methods: {
    exportConfig() {
      ipcRenderer.send("open-save-dialog", {
        video_info: this.video_info,
        xml: this.json2xml(),
      });
      ipcRenderer.on("open-save-result", (event, result) => {
        if (result) {
          this.$notification.success({
            title: "导出成功!"
          })
        } else {
          this.$notification.success({
            title: "导出失败!"
          })
        }
      })
    },
    json2xml() {
      function type(obj) {
        if (obj.type === "jumpToTime") {
          return {
            "-tscIQ:jumpToTime":
              Number(obj.m) * 60 * 100 + Number(obj.s) * 100 + Number(obj.f),
          };
        } else if (obj.type === "location") {
          return {
            "-tscIQ:location": obj.location,
          };
        } else {
          return {};
        }
      }
      function feedback(correct, incorrect) {
        return {
          "rdf:Bag": {
            "rdf:li": [
              {
                "rdf:Description": {
                  "-tscIQ:reason": "correct",
                  ...type(correct),
                  "xmpDM:name": {
                    "rdf:Alt": {
                      "rdf:li": {
                        "-xml:lang": "de-DE",
                        "#text": correct.name,
                      },
                    },
                  },
                },
              },
              {
                "rdf:Description": {
                  "-tscIQ:reason": "incorrect",
                  ...type(incorrect),
                  "xmpDM:name": {
                    "rdf:Alt": {
                      "rdf:li": {
                        "-xml:lang": "de-DE",
                        "#text": incorrect.name,
                      },
                    },
                  },
                },
              },
            ],
          },
        };
      }
      const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "-",
      };
      const concatType = {
        1: "MC", // 单选
        2: "FITB", // 填空
        3: "SHORT", // 简答
        4: "MC", // 真假题
      };
      let builder = new XMLBuilder(options);
      let allQuestionObj = [];
      for (const obj of this.$store.state.question_arr) {
        let index = 0;
        let cur_obj = {
          "rdf:Description": {
            "-xmpDM:startTime": obj.cur_time.toFixed(),
            "-tscIQ:feedback": "1",
            "-tscIQ:questionSetName": obj.q_title,
            "tscIQ:questions": {
              "rdf:Seq": {
                "rdf:li": obj.q_arr.map((v) => {
                  let result = null;
                  switch (v.type) {
                    case 1:
                      result = {
                        "rdf:Description": {
                          "-tscIQ:type": concatType[v.type],
                          "-tscIQ:id": index++,
                          "tscIQ:question": v.title,
                          "tscIQ:correctAnswer": v.correctAnswer,
                          "tscIQ:answerArray": {
                            "rdf:Seq": {
                              "rdf:li": v.answer.map((v, i) => {
                                return {
                                  "rdf:Description": {
                                    "-tscIQ:orderId": i,
                                    "tscIQ:answer": v.q,
                                  },
                                };
                              }),
                            },
                          },
                          "tscIQ:feedback": v.feedback
                            ? feedback(v.correct, v.incorrect)
                            : {},
                        },
                      };
                      break;
                    case 2:
                      result = {
                        "rdf:Description": {
                          "-tscIQ:type": concatType[v.type],
                          "-tscIQ:id": index++,
                          "tscIQ:question": v.title,
                          "tscIQ:answerArray": {
                            "rdf:Seq": {
                              "rdf:li": v.answer.map((v, i) => {
                                return {
                                  "rdf:Description": {
                                    "-tscIQ:orderId": i,
                                    "tscIQ:answer": v.q,
                                  },
                                };
                              }),
                            },
                          },
                          "tscIQ:feedback": v.feedback
                            ? feedback(v.correct, v.incorrect)
                            : {},
                        },
                      };
                      break;
                    case 3:
                      result = {
                        "rdf:Description": {
                          "-tscIQ:type": concatType[v.type],
                          "-tscIQ:id": index++,
                          "tscIQ:question": v.title,
                        },
                      };
                      break;
                    case 4:
                      result = {
                        "rdf:Description": {
                          "-tscIQ:type": concatType[v.type],
                          "-tscIQ:id": index++,
                          "tscIQ:question": v.title,
                          "tscIQ:correctAnswer": v.correctAnswer ? "0" : "1",
                          "tscIQ:answerArray": {
                            "rdf:Seq": {
                              "rdf:li": [
                                {
                                  "rdf:Description": {
                                    "-tscIQ:orderId": "0",
                                    "tscIQ:answer": "真",
                                  },
                                },
                                {
                                  "rdf:Description": {
                                    "-tscIQ:orderId": "1",
                                    "tscIQ:answer": "假",
                                  },
                                },
                              ],
                            },
                          },
                          "tscIQ:feedback": v.feedback
                            ? feedback(v.correct, v.incorrect)
                            : {},
                        },
                      };
                      break;
                  }
                  return result;
                }),
              },
            },
          },
        };
        allQuestionObj.push(cur_obj);
      }
      let xmlObj = {
        "x:xmpmeta": {
          "-xmlns:x": "adobe:ns:meta/",
          "-xmlns:tsc": "http://www.techsmith.com/xmp/tsc/",
          "rdf:RDF": {
            "-xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "-xmlns:xmp": "http://ns.adobe.com/xap/1.0/",
            "-xmlns:xmpDM": "http://ns.adobe.com/xmp/1.0/DynamicMedia/",
            "-xmlns:xmpG": "http://ns.adobe.com/xap/1.0/g/",
            "-xmlns:xmpMM": "http://ns.adobe.com/xap/1.0/mm/",
            "-xmlns:tscDM": "http://www.techsmith.com/xmp/tscDM/",
            "-xmlns:tscIQ": "http://www.techsmith.com/xmp/tscIQ/",
            "-xmlns:tscHS": "http://www.techsmith.com/xmp/tscHS/",
            "-xmlns:stDim": "http://ns.adobe.com/xap/1.0/sType/Dimensions#",
            "-xmlns:stFnt": "http://ns.adobe.com/xap/1.0/sType/Font#",
            "-xmlns:exif": "http://ns.adobe.com/exif/1.0",
            "-xmlns:dc": "http://purl.org/dc/elements/1.1/",
            "rdf:Description": {
              "-tsc:version": "2.1.0",
              "-dc:title": this.video_info.video_title.replace(/\..*/, ""),
              "-dc:source": "Camtasia Mac - 2021.0.8",
              "-dc:date": new Date().toISOString(),
              "-tscDM:originId": "DF8E15DD-D578-4599-9C24-910BE0421D46",
              "xmpDM:duration": {
                "-xmpDM:scale": "1/1000",
                "-xmpDM:value": this.video_info.video_total_time,
              },
              "xmpDM:videoFrameSize": {
                "-stDim:unit": "pixel",
                "-stDim:w": this.video_info.video_w,
                "-stDim:h": this.video_info.video_h,
              },
              "tsc:langName": {
                "rdf:Bag": {
                  "rdf:li": {
                    "-xml:lang": "en-US",
                    "#text": "English",
                  },
                },
              },
              "xmpDM:Tracks": {
                "rdf:Bag": {
                  "rdf:li": {
                    "rdf:Description": {
                      "-xmpDM:trackType": "Quiz",
                      "-xmpDM:frameRate": "f1000",
                      "-xmpDM:trackName": "Quiz",
                      "-tscIQ:quizGuid": "DACAB6E0-1D3E-492E-AF0D-2248F3DFB922",
                      "-tscIQ:requireUserId": "0",
                      "-tscIQ:locale": "de-DE",
                      "-tscIQ:reportMethod": "NONE",
                      "-tscIQ:clientId": "MrvuTJp9dgCyBjL79zfnNAxvD6DUYUD1",
                      "-tscIQ:hideReplay": "1",
                      "-tscIQ:allowSkipQuiz": "0",
                      "-tscIQ:quizHash": "7DC05C55ECFB920540C5BD4FB481F0C0",
                      "xmpDM:markers": {
                        "rdf:Seq": {
                          "rdf:li": allQuestionObj,
                        },
                      },
                      "tscIQ:QuizParams": {},
                    },
                  },
                },
              },
              "tscDM:controller": {
                "rdf:Description": {
                  "-xmpDM:name": "tscplayer",
                  "tscDM:parameters": {
                    "rdf:Bag": {
                      "rdf:li": [
                        {
                          "-xmpDM:name": "autohide",
                          "-xmpDM:value": "true",
                        },
                        {
                          "-xmpDM:name": "autoplay",
                          "-xmpDM:value": "false",
                        },
                        {
                          "-xmpDM:name": "backgroundcolor",
                          "-xmpDM:value": "000000",
                        },
                        {
                          "-xmpDM:name": "captionsenabled",
                          "-xmpDM:value": "false",
                        },
                        {
                          "-xmpDM:name": "endaction",
                          "-xmpDM:value": "stop",
                        },
                        {
                          "-xmpDM:name": "endactionparam",
                          "-xmpDM:value": "true",
                        },
                        {
                          "-xmpDM:name": "locale",
                          "-xmpDM:value": "en-US",
                        },
                        {
                          "-xmpDM:name": "searchable",
                          "-xmpDM:value": "true",
                        },
                        {
                          "-xmpDM:name": "sidebarenabled",
                          "-xmpDM:value": "false",
                        },
                        {
                          "-xmpDM:name": "sidebarlocation",
                          "-xmpDM:value": "left",
                        },
                        {
                          "-xmpDM:name": "unicodeenabled",
                          "-xmpDM:value": "false",
                        },
                      ],
                    },
                  },
                  "tscDM:controllerText": {
                    "rdf:Bag": {
                      "rdf:li": [
                        {
                          "rdf:Description": {
                            "-xmp:label": "localSecurityError",
                            "tscDM:localizedText": {
                              "rdf:Alt": {
                                "rdf:li": {
                                  "-xml:lang": "en-US",
                                  "#text":
                                    "由于本地网络安全，您视频中的某些功能当前已被禁用。从网站或服务器播放此视频时，这些功能正常工作。",
                                },
                              },
                            },
                          },
                        },
                        {
                          "rdf:Description": {
                            "-xmp:label": "replayButtonText",
                            "tscDM:localizedText": {
                              "rdf:Alt": {
                                "rdf:li": {
                                  "-xml:lang": "en-US",
                                  "#text": "重播",
                                },
                              },
                            },
                          },
                        },
                        {
                          "rdf:Description": {
                            "-xmp:label": "resultText",
                            "tscDM:localizedText": {
                              "rdf:Alt": {
                                "rdf:li": {
                                  "-xml:lang": "en-US",
                                  "#text": "找到结果",
                                },
                              },
                            },
                          },
                        },
                        {
                          "rdf:Description": {
                            "-xmp:label": "searchFullscreenText",
                            "tscDM:localizedText": {
                              "rdf:Alt": {
                                "rdf:li": {
                                  "-xml:lang": "en-US",
                                  "#text": "在全屏模式下已禁用搜索",
                                },
                              },
                            },
                          },
                        },
                        {
                          "rdf:Description": {
                            "-xmp:label": "searchText",
                            "tscDM:localizedText": {
                              "rdf:Alt": {
                                "rdf:li": {
                                  "-xml:lang": "en-US",
                                  "#text": "搜索",
                                },
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
              "tscDM:contentList": {
                "rdf:Description": {
                  "tscDM:files": {
                    "rdf:Seq": {
                      "rdf:li": {
                        "-xmpDM:name": "1",
                        "-xmpDM:value": this.video_info.video_title,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      //   let parser = new XMLParser(options);
      //   parser.parse("");
      return builder.build(xmlObj);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/scss/variables";
.export-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid #a2c84c;
  .export-btn {
    width: 78px;
    height: 26px;
    background: $btnBg;
    color: #ffffff;
    border: none;
    border-radius: 2px;
    margin-right: 13px;
    cursor: pointer;
    img {
      vertical-align: top;
    }
    &:active {
      filter: brightness(0.7) !important;
    }
  }
}
</style>
