//
//  base.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 13/08/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//

const cp = require('child_process')
const path = require('path')
const lightAgent = require('../lib/lightAgent')

const Accessory = class {
  constructor(config, log, homebridge) {
    this.homebridge = homebridge
    this.log = log
    this.config = config
    this.name = config.name
    this.services = this.getAccessoryServices()
    this.services.push(this.getInformationService())
  }

  identify(callback) {
    callback()
  }

  getInformationService() {
    var informationService = new this.homebridge.Service.AccessoryInformation()
    informationService
      .setCharacteristic(this.homebridge.Characteristic.Manufacturer, 'MagicHome')
      .setCharacteristic(this.homebridge.Characteristic.Model, this.getModelName())
      .setCharacteristic(this.homebridge.Characteristic.SerialNumber, this.getSerialNumber())
    return informationService
  }

  executeCommand(address, command, callback) {
    const exec = cp.exec
    const self = this
    const cmd = path.join(__dirname, '../flux_led.py ' + lightAgent.getAddress(address) + command)
    if (self.homebridge.debug) {
      self.log(cmd)
    }
    exec(cmd, (err, stdOut) => {
      if (self.homebridge.debug) {
        self.log(stdOut)
      }
      if (callback) {
        callback(err, stdOut)
      }
    })
  }

  getAccessoryServices() {
    throw new Error('The getSystemServices method must be overridden.')
  }

  getModelName() {
    throw new Error('The getModelName method must be overridden.')
  }

  getSerialNumber() {
    throw new Error('The getSerialNumber method must be overridden.')
  }

  getServices() {
    return this.services
  }
}

module.exports = Accessory
