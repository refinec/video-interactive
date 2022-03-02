const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { ffmpegPath, ffprobePath } = require("./ffmpeg");
const { ipcMain, dialog, Notification } = require("electron");
const saveFile = {
  firstFrame: "FirstFrame.png",
  xmpFile: "xmpFile.xml",
  configXml: "config_xml.js",
};
const TEMPDIR = "../static/tempCache";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
// ffmpeg.setFfmpegPath(ffmpegPath.replace("app.asar", "app.asar.unpacked"));
// ffmpeg.setFfprobePath(ffprobePath.replace("app.asar", "app.asar.unpacked"));
ipcMain.on("open-save-dialog", (event, arg) => {
  dialog
    .showSaveDialog({
      title: `请选择${arg.video_info.video_title}的配置文件保存路径`,
      showsTagField: true,
      defaultPath: path.join(
        path.dirname(arg.video_info.video_path),
        path.basename(
          arg.video_info.video_title,
          path.extname(arg.video_info.video_title)
        )
      ),
      properties: [
        "showHiddenFiles",
        "createDirectory",
        "showOverwriteConfirmation",
      ],
    })
    .then(({ canceled, filePath }) => {
      if (!canceled) {
        writeFiile({
          savePath: filePath,
          xml: arg.xml,
          videoPath: arg.video_info.video_path,
          v_w: arg.video_info.video_w,
          v_h: arg.video_info.video_h,
        }, event);
      }
    });
});
ipcMain.on("del-cur-video", (event, video_name) => {
  fs.rm(path.join(__dirname, TEMPDIR, path.basename(video_name, path.extname(video_name))), {
        recursive: true
      }, (err) => {
    if (err) {
      return console.error('err', err);
    }
  })
})
ipcMain.on("transform-mp3", (event, videoUrl) => {
  const video_name = path.basename(videoUrl, path.extname(videoUrl));
  fs.readFile(
    path.join(__dirname, TEMPDIR, video_name, video_name + ".mp3"),
    (err, data) => {
      if (err) {
        return video2mp3(path.join(videoUrl), video_name, event);
      }
      event.reply("transform-mp3-reply", {
        temp_mp3_url: data,
        imgName: video_name
      });
    }
  );
});
function writeFiile({ savePath, xml, videoPath, v_w, v_h }, event) {
  try {
    let saveArr = [];
    for (const type in saveFile) {
      if (Object.hasOwnProperty.call(saveFile, type)) {
        const targetPath = path.join(savePath, saveFile[type]);
        if (type == "xmpFile") {
          saveArr.push(fs.outputFile(targetPath, xml));
        } else if (type == "configXml") {
          let xmljs = `var TSC = TSC || {}; TSC.embedded_config_xml = '${xml}'`;
          saveArr.push(fs.outputFile(targetPath, xmljs));
        } else if (type == "firstFrame") {
          video2jpg(videoPath, savePath, saveFile[type], v_w, v_h);
        }
      }
    }
    Promise.all(saveArr)
      .then(() => {
        new Notification({ title: "导出成功!" });
        event.reply("open-save-result", true);
      })
      .catch(() => {
        event.reply("open-save-result", false);
        new Notification({
          title: "导出失败!",
        });
      });
  } catch (error) {
    console.error(error);
  }
}
function video2mp3(source_video_path, video_name, event) {
  const mp3SavePath = path.join(__dirname, TEMPDIR, video_name, video_name + ".mp3");
  try {
    ffmpeg(source_video_path)
      .screenshots({
        timestamps: ["00:01"],
        filename: video_name + ".jpg",
        folder: path.join(__dirname, TEMPDIR, video_name),
        size: "300x200",
      })
      .noVideo()
      .audioBitrate("8k")
      .on("progress", function (progress) {
        event.reply("transform-mp3-progress", progress.percent);
        // console.log(
        //   "frames",
        //   progress.frames,
        //   "currentFps",
        //   progress.currentFps,
        //   "currentKbps",
        //   progress.currentKbps,
        //   "targetSize",
        //   progress.targetSize,
        //   "timemark",
        //   progress.timemark,
        //   "percent",
        //   progress.percent
        // );
      })
      .on("end", function (stdout, stderr) {
        console.log("解析完成!", stdout, stderr, " !!");
        try {
          let data = fs.readFileSync(mp3SavePath);
          event.reply("transform-mp3-reply", {
            temp_mp3_url: data,
            imgName: video_name
          });
        } catch (error) {
          event.reply("transform-mp3-reply", {
            temp_mp3_url: null,
            imgName: video_name
          });
        }
      })
      .save(mp3SavePath);
    // new ffmpeg(source_video_path).then(
    //   function (video) {
    //     // let target_audio_path = "";
    //     video.fnExtractSoundToMP3(
    //       "/path/to/your_audio_file.mp3",
    //       function (error, file) {
    //         if (!error) console.log("Audio file: " + file);
    //       }
    //     );
    //   },
    //   function (err) {
    //     console.log("Error: " + err);
    //   }
    // );
  } catch (err) {
    console.error(err.code, err.msg);
  }
}

function video2jpg(video_path, destinationFolder, file_name, v_w, v_h) {
  try {
    ffmpeg(video_path).screenshots({
      timestamps: ["00:01"],
      filename: file_name,
      folder: destinationFolder,
      size: v_w.toFixed() + "x" + v_h.toFixed(),
    });
  } catch (error) {
    console.error(error);
  }
}
