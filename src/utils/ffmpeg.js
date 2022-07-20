const path = require("path");
const os = require("os");
const arch = os.arch();
let platform = os.platform();
const commonPath = "../static/bin";

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
if (platform === "mac" && arch !== "x64" && arch !== "arm64") {
  process.exit(1);
}

exports.ffmpegPath = path.join(
  __dirname,
  commonPath,
  platform,
  arch,
  platform === "win" ? "ffmpeg.exe" : "ffmpeg"
);
exports.ffprobePath = path.join(
  __dirname,
  commonPath,
  platform,
  arch,
  platform === "win" ? "ffprobe.exe" : "ffprobe"
);