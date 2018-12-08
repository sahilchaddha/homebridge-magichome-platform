
const LightBulb = require('./accessories/lightBulb')
const PresetSwitch = require('./accessories/presetSwitch')
const ResetSwitch = require('./accessories/resetSwitch')
const lightAgent = require('./lib/lightAgent')

const pluginName = 'homebridge-magichome-platform'
const platformName = 'MagicHome-Platform'

// Available Accessories
var homebridge

function MagicHome(log, config = {}) {
  this.log = log
  this.config = config
  this.lights = []
  this.presetSwitches = []
  this.resetSwitches = []
  lightAgent.setLogger(log)

  // Set Cache Storage Path
  if (homebridge) {
    lightAgent.setPersistPath(homebridge.PersistPath)
  }

  // Configure LightAgent
  if (config) {
    if (config.debug) {
      lightAgent.setVerbose()
    }
    if (config.disableDiscovery) {
      log('** DISABLED DISCOVERY **')
      lightAgent.disableDiscovery()
    }
  }

  lightAgent.startDiscovery()
}

MagicHome.prototype = {
  accessories: function (callback) {
    homebridge.debug = this.config.debug || false
    if (this.config.lights != null && this.config.lights.length > 0) {
      this.config.lights.forEach((lightConfig) => {
        var newLightConfig = lightConfig
        newLightConfig.debug = this.config.debug || false
        this.lights.push(new LightBulb(newLightConfig, this.log, homebridge))
      })
    }

    if (this.config.presetSwitches != null && this.config.presetSwitches.length > 0) {
      this.config.presetSwitches.forEach((switchConfig) => {
        this.presetSwitches.push(new PresetSwitch(switchConfig, this.log, homebridge))
      })
    }

    if (this.config.resetSwitch != null) {
      this.resetSwitches.push(new ResetSwitch(this.config.resetSwitch, this.log, homebridge))
    }
    const lightsSwitches = this.lights.concat(this.presetSwitches)
    const allSwitches = lightsSwitches.concat(this.resetSwitches)
    callback(allSwitches)
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
