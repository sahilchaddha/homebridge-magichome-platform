//
//  lightAgent.js
//  Sahil Chaddha
//
//  Created by Sahil Chaddha on 22/10/2018.
//  Copyright © 2018 sahilchaddha.com. All rights reserved.
//

const cp = require('child_process')
const path = require('path')

const cacheKey = 'magicHome_cache'
const spawn = cp.spawn

const LightAgent = class {

  constructor() {
    this.cachedAddress = {}
    this.pollingInterval = 300 * 1000 // 5 Minutes
    this.logger = null
    this.storage = null
    this.hasDiscoveryStarted = false
    this.isVerbose = false
    this.shouldDiscover = true
  }

  getCachedAddress() {
    if (!this.storage) {
      return {}
    }
    this.log('Getting Bulbs from Cache')
    return this.storage.getItem(cacheKey)
      .then((data) => {
        var devices = {}
        if (data) {
          try {
            devices = JSON.parse(data)
          } catch (error) {
            devices = {}
          }
        }
        this.log(' ** Fetched Lights from Cache **')
        this.log(devices)
        return devices
      })
  }

  saveAddress(res) {
    if (this.storage) {
      const data = JSON.stringify(res)
      this.log('Saving Lights')
      this.log(data)

      this.storage.setItem(cacheKey, data)
        .then(() => {
          this.log('Lights Saved.')
        })
    }
  }

  disableDiscovery() {
    this.shouldDiscover = false
  }

  startDiscovery() {
    if (!this.hasDiscoveryStarted && this.shouldDiscover) {
      this.hasDiscoveryStarted = true
      this.getDevices()
    }
  }

  setLogger(logger) {
    this.logger = logger
  }

  setVerbose() {
    this.isVerbose = true
  }

  setPersistPath(persistPath) {
    if (!this.storage) {
      this.storage = require('node-persist')
      const self = this
      this.storage.init({ dir: path.join(persistPath, 'magichome-platform'), forgiveParseErrors: true, ttl: false, logging: false })
        .then(() => {
          return self.getCachedAddress()
        })
        .then((devices) => {
          self.cachedAddress = devices
        })
    }
  }

  log(message) {
    if (this.logger && this.isVerbose) {
      this.logger(message)
    }
  }

  parseDevices(res) {
    if (!res) {
      return this.cachedAddress
    }
    if (res.length > 0) {
      const lines = res.split('\n')
      if (lines.length < 3) {
        return this.cachedAddress
      }
      // Format Response
      var devices = {}
      lines.splice(0, 1)
      lines.splice(-1, 1)
      lines.forEach((element) => {
        const mappedAddr = element.split('=')
        devices[mappedAddr[0]] = mappedAddr[1]
        devices[mappedAddr[1]] = mappedAddr[1]
      })
      var newDevices = this.cachedAddress
      Object.keys(devices).forEach((element) => {
        newDevices[element] = devices[element]
      })
      // Cache IPS
      this.saveAddress(newDevices)
      return newDevices
    }
    return this.cachedAddress
  }

  getCachedDevice(addr) {
    var address = ''
    if (this.cachedAddress[addr] && this.shouldDiscover) {
      address = this.cachedAddress[addr]
    } else {
      address = addr
    }
    return address + ' '
  }

  getDevices() {
    const self = this
    const cmd = path.join(__dirname, '../flux_led.py')
    self.log('Discovering Devices')
    this.proc = spawn(cmd, ['-s'])
    this.proc.stdout.on('data', (data) => {
      const newData = '' + data
      self.log(newData)
      self.cachedAddress = self.parseDevices(newData)
    })

    this.proc.stderr.on('data', (data) => {
      self.log('Error : ' + data)
    })

    this.proc.on('close', () => {
      self.log('Discovery Finished');
      self.rediscoverLights()
    })
  }

  rediscoverLights() {
    this.proc = null
    this.log(this.cachedAddress)
    setTimeout(this.getDevices.bind(this), this.pollingInterval)
  }

  getAddress(address) {
    var ips = ''
    if (typeof address === 'string') {
      ips = this.getCachedDevice(address)
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
