
const LightBulb = require('./accessories/lightBulb')
const PresetSwitch = require('./accessories/presetSwitch')

const pluginName = 'homebridge-magichome-platform'
const platformName = 'MagicHome-Platform'

// Available Accessories
var homebridge

function MagicHome(log, config = {}) {
  this.log = log
  this.config = config
  this.lights = []
  this.presetSwitches = []
}

MagicHome.prototype = {
  accessories: function (callback) {
    homebridge.debug = this.config.debug || false
    if (this.config.lights != null && this.config.lights.length > 0) {
      this.config.lights.forEach((lightConfig) => {
        this.lights.push(new LightBulb(lightConfig, this.log, homebridge))
      })
    }

    if (this.config.presetSwitches != null && this.config.presetSwitches.length > 0) {
      this.config.presetSwitches.forEach((switchConfig) => {
        this.presetSwitches.push(new PresetSwitch(switchConfig, this.log, homebridge))
      })
    }

    callback(this.lights.concat(this.presetSwitches))
  },
}

function MagicHomeGlobals() {}
MagicHomeGlobals.setHomebridge = (homebridgeRef) => {
  homebridge = homebridgeRef
}

module.exports = {
  platform: MagicHome,
  globals: MagicHomeGlobals,
  pluginName: pluginName,
  platformName: platformName,
}
