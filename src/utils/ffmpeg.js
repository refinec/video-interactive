const os = require("os");
const path = require("path");
let platform = os.platform();
if (platform == "darwin") {
  platform = "mac";
} else if (platform == "win32") {
  platform = "win";
}
if (
  platform !== "linux" &&
  platform !== "mac" &&
  platform !== "win" &&
  platform !== "browser"
) {
  process.exit(1);
}

const arch = os.arch();
if (platform === "mac" && arch !== "x64" && arch !== "arm64") {
  process.exit(1);
}
const ffmpegPath = path.join(
  __dirname,
  "../static/bin",
  platform,
  arch,
  platform === "win" ? "ffmpeg.exe" : "ffmpeg"
);
var ffprobePath = path.join(
  __dirname,
  "../static/bin",
  platform,
  arch,
  platform === "win" ? "ffprobe.exe" : "ffprobe"
);
exports.ffmpegPath = ffmpegPath;
exports.ffprobePath = ffprobePath;
