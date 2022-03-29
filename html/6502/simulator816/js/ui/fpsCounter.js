var prevFPS = 0;
/** Updates the FPS Ticker
 * 
 * @param {Number} dt The time since the last frame, **in seconds**.
 */
function updateFPS(dt) {
    var fps = 1/dt;
    prevFPS = (prevFPS + fps) /2; //PrevFPS keeps a running average so small fluctuations don't cause big changes
}