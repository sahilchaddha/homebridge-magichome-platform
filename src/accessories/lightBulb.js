//
//  clearDirSwitch.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 26/08/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//

const convert = require('color-convert')
const Accessory = require('./base')

const LightBulb = class extends Accessory {
  constructor(config, log, homebridge) {
    super(config, log, homebridge)
    this.name = config.name || 'LED Controller'
    this.ip = config.ip
    this.setup = config.setup || 'RGBW'
    this.color = { H: 255, S: 100, L: 50 }
    this.brightness = 100
    this.purewhite = config.purewhite || false
    this.timeout = config.timeout || 5000
    this.getInitialColor()
    this.updateState()
  }

  getAccessoryServices() {
    var lightbulbService = new this.homebridge.Service.Lightbulb(this.name)

    lightbulbService
      .getCharacteristic(this.homebridge.Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this))

    lightbulbService
      .addCharacteristic(new this.homebridge.Characteristic.Hue())
      .on('get', this.getHue.bind(this))
      .on('set', this.setHue.bind(this))

    lightbulbService
      .addCharacteristic(new this.homebridge.Characteristic.Saturation())
      .on('get', this.getSaturation.bind(this))
      .on('set', this.setSaturation.bind(this))

    lightbulbService
      .addCharacteristic(new this.homebridge.Characteristic.Brightness())
      .on('get', this.getBrightness.bind(this))
      .on('set', this.setBrightness.bind(this))

    return [lightbulbService]
  }

  sendCommand(command, callback) {
    this.executeCommand(this.ip + ' ' + command, callback)
  }

  getModelName() {
    return 'Light Bulb'
  }

  getSerialNumber() {
    return '00-001-LightBulb'
  }

  getInitialColor() {
    const self = this
    self.getState((settings) => {
      self.color = settings.color
    })
  }

  updateState() {
    const self = this
    setInterval(() => {
      self.getState((settings) => {
        self.isOn = settings.on
        self.services[0]
          .getCharacteristic(this.homebridge.Characteristic.On)
          .updateValue(this.isOn)
      })
    }, self.timeout)
  }

  getState(callback) {
    this.sendCommand('-i', (error, stdout) => {
      var settings = {
        on: false,
        color: { H: 255, S: 100, L: 50 },
      }

      var colors = stdout.match(/\(\d{3}\, \d{3}, \d{3}\)/g)
      var isOn = stdout.match(/\] ON /g)

      if (isOn && isOn.length > 0) {
        settings.on = true
      }
      if (colors && colors.length > 0) {
        var converted = convert.rgb.hsl(stdout.match(/\d{3}/g))
        settings.color = {
          H: converted[0],
          S: converted[1],
          L: converted[2],
        }
      }
      callback(settings)
    })
  }

  getPowerState(callback) {
    this.getState((settings) => {
      callback(null, settings.on)
    })
  }

  setPowerState(value, callback) {
    this.sendCommand(value ? '--on' : '--off', () => {
      callback()
    })
  }

  getHue(callback) {
    callback(null, this.color.H)
  }

  setHue(value, callback) {
    this.color.H = value
    this.setToCurrentColor()
    callback()
  }

  getBrightness(callback) {
    callback(null, this.brightness)
  }

  setBrightness(value, callback) {
    this.brightness = value
    this.setToCurrentColor()
    callback()
  }

  getSaturation(callback) {
    callback(null, this.color.S)
  }

  setSaturation(value, callback) {
    this.color.S = value
    this.setToCurrentColor()
    callback()
  }

  setToWarmWhite() {
    this.sendCommand('-w ' + this.brightness)
  }

  setToCurrentColor() {
    var color = this.color
    if (color.S === 0 && color.H === 0 && this.purewhite) {
      this.setToWarmWhite()
      return
    }

    var brightness = this.brightness
    var converted = convert.hsl.rgb([color.H, color.S, color.L])

    var base = '-x ' + this.setup + ' -c'
    this.sendCommand(base + Math.round((converted[0] / 100) * brightness) + ',' + Math.round((converted[1] / 100) * brightness) + ',' + Math.round((converted[2] / 100) * brightness))
  }
}

module.exports = LightBulb
