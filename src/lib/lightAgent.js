//
//  lightAgent.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 22/10/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//
const cp = require('child_process')
const path = require('path')

const LightAgent = class {

  constructor() {
    this.cachedAddress = {}
    this.pollingInterval = 20 * 1000
    this.logger = null
    this.hasDiscoveryStarted = false
  }

  startDiscovery() {
    if (!this.hasDiscoveryStarted) {
      this.hasDiscoveryStarted = true
      this.getDevices()
    }
  }

  setLogger(logger) {
    this.logger = logger
  }

  log(message) {
    if (this.logger) {
      this.logger(message)
    }
  }

  parseDevices(res) {
    if (!res) {
      return {}
    }
    if (res.length > 0) {
      var devices = {}
      const lines = res.split('\n')
      // Format Response
      lines.splice(0, 1)
      lines.splice(-1, 1)
      lines.forEach((element) => {
        const mappedAddr = element.split('=')
        devices[mappedAddr[0]] = mappedAddr[1]
        devices[mappedAddr[1]] = mappedAddr[1]
      })
      return devices
    }
    return {}
  }

  getCachedDevice(addr) {
    var address = ''
    if (this.cachedAddress[addr]) {
      address = this.cachedAddress[addr]
    } else {
      address = addr
    }
    return address + ' '
  }

  getDevices() {
    const exec = cp.exec
    const self = this
    const cmd = path.join(__dirname, '../flux_led.py -s')
    self.log('Discovering Devices')
    exec(cmd, (err, stdOut) => {
      if (err) {
        self.log(err)
      } else {
        self.log(stdOut)
        self.cachedAddress = self.parseDevices(stdOut)
      }
      setTimeout(self.getDevices.bind(self), self.pollingInterval)
    })
  }

  getAddress(address) {
    var ips = ''
    if (typeof address === 'string') {
      ips = address + ' '
    } else if (address.length > 0) {
      address.forEach((addr) => {
        ips += this.getCachedDevice(addr)
      })
    }
    return ips
  }
}

const agent = new LightAgent()

module.exports = agent
