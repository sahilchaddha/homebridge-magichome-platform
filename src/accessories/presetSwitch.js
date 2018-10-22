//
//  presetSwitch.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 13/10/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//

const Accessory = require('./base')
const preset = require('../presets')
const emitter = require('../lib/emitter')

const PresetSwitch = class extends Accessory {
  constructor(config, log, homebridge) {
    super(config, log, homebridge)
    this.isOn = false
    this.name = config.name || 'LED Controller Presets'
    this.ips = Object.keys(config.ips)
    this.preset = config.preset || 'seven_color_cross_fade'
    this.sceneValue = preset[this.preset]
    if (this.sceneValue == null) {
      log('Present Not Found... Try Different Preset')
      this.sceneValue = 37
    }
    this.speed = config.speed || 40
    // Should Turn Off Light When Turn Off Preset
    this.shouldTurnOff = config.shouldTurnOff || true
    this.bindEmitter()
  }

  bindEmitter() {
    const self = this
    emitter.on('MagicHomePresetTurnedOn', (presetName) => {
      if (presetName !== self.name) {
        self.updateState(false)
      }
    })
  }

  getAccessoryServices() {
    const switchService = new this.homebridge.Service.Switch(this.name)
    switchService
      .getCharacteristic(this.homebridge.Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.switchStateChanged.bind(this))
    return [switchService]
  }

  sendCommand(command, callback) {
    this.executeCommand(this.ips, command, callback)
  }

  switchStateChanged(newState, callback) {
    this.isOn = newState
    const self = this
    if (newState === true) {
      // Turn Off Other Running Scenes
      emitter.emit('MagicHomePresetTurnedOn', self.name)
      self.sendCommand('--on', () => {
        setTimeout(() => {
          self.sendCommand('-p ' + self.sceneValue + ' ' + self.speed, () => {
            callback()
          })
        }, 3000)
      })
    } else {
      // Turning OFF
      var promiseArray = []
      Object.keys(self.config.ips).forEach((ip) => {
        const newPromise = new Promise((resolve) => {
          self.executeCommand(ip, ' -c ' + self.config.ips[ip], () => {
            resolve()
          })
        })
        promiseArray.push(newPromise)
      })

      Promise.all(promiseArray)
        .then(() => {
          if (self.shouldTurnOff) {
            setTimeout(() => {
              self.sendCommand('--off', () => {
                callback()
              })
            }, 3000)
          } else {
            callback()
          }
        })
    }
  }

  updateState(newValue) {
    this.isOn = newValue
    this.services[0]
      .getCharacteristic(this.homebridge.Characteristic.On)
      .updateValue(this.isOn)
  }

  getState(callback) {
    callback(null, this.isOn)
  }

  getModelName() {
    return 'Preset Switch'
  }

  getSerialNumber() {
    return '00-001-PresetSwitch'
  }
}

module.exports = PresetSwitch
