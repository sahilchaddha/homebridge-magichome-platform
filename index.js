
// MagicHome Platform
const MagicHome = require('./src/magichome')

module.exports = (homebridge) => {
  var homebridgeGlobals = {
    Service: homebridge.hap.Service,
    Characteristic: homebridge.hap.Characteristic,
    Accessory: homebridge.platformAccessory,
    UUIDGen: homebridge.hap.uuid,
    PersistPath: homebridge.user.storagePath(),
  }
  MagicHome.globals.setHomebridge(homebridgeGlobals)
  homebridge.registerPlatform(MagicHome.pluginName, MagicHome.platformName, MagicHome.platform, true)
}
