# homebridge-magichome-platform

[![NPM](https://nodei.co/npm/homebridge-magichome-platform.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/homebridge-magichome-platform/)

[![npm](https://img.shields.io/npm/dm/homebridge-magichome-platform.svg)](https://www.npmjs.com/package/homebridge-magichome-platform)
[![npm](https://img.shields.io/npm/v/homebridge-magichome-platform.svg)](https://www.npmjs.com/package/homebridge-magichome-platform)
[![CircleCI](https://circleci.com/gh/sahilchaddha/homebridge-magichome-platform.svg?style=svg)](https://circleci.com/gh/sahilchaddha/homebridge-magichome-platform)


**A Homebridge plugin for devices running fade/strobe effects on the Magic Home Wi-Fi system.**

## Description

This plugin will create LightBulbs in Homekit capable of turning on/off, change color, change hue, change saturation.

This plugin can also create preset patterns Switches (color cycle, fade, strobe).

Its a great utility tool to set house mood to party/soothing with custom music.

Can cycle through colors, sync all lights to strobe/fade.

## Installation

```shell
    $ npm install -g --unsafe-perm homebridge
    $ npm install -g --unsafe-perm homebridge-magichome-platform
```

Edit config.json. Refer to `config-sample.json`.

## Available Presets Scenes

```
	seven_color_cross_fade
	red_gradual_change
	green_gradual_change
	blue_gradual_change
	yellow_gradual_change
	cyan_gradual_change
	purple_gradual_change
	white_gradual_change
	red_green_cross_fade
	red_blue_cross_fade
	green_blue_cross_fade
	seven_color_strobe_flash
	red_strobe_flash
	green_strobe_flash
	blue_stobe_flash
	yellow_strobe_flash
	cyan_strobe_flash
	purple_strobe_flash
	white_strobe_flash
	seven_color_jumping
```

### Demo

![Demo](https://raw.githubusercontent.com/sahilchaddha/homebridge-magichome-platform/master/demo.gif)

## Compatible Devices

Any devices created by Zengge and running on the Magic Home Wi-Fi (or other apps by the same developer such as LED Magic Color) app should work with this plugin. Some examples of compatible devices are:

- [5 Channel Controller for RGB LED Strip](http://amzn.to/2eAljEV) `RGBWW`
- [Magic UFO RGBW LED Strip controller](http://amzn.to/2eyoRdE)
- [SuperLegends Wi-Fi smart bulb](http://amzn.to/2eCxq6a) `RGBW`
- [Victorstar Wi-Fi Smart Light Bulb](http://amzn.to/2eCCM13)
- [Flux Wi-Fi Light Bulb](http://amzn.to/2eCx3IC)
- [Fen-Yi Light Bulb](http://amzn.to/2ehjP3s)
- [Waterproof RGB LED Strips WIFI Controller](http://amzn.to/2eoDQZx) `RGBW`
- [Eastlion RGB Wi-Fi Strip Controller](http://amzn.to/2eCF8wV)


## Sample Config : 

```json
{
    "platforms": [
        {
            "platform": "MagicHome-Platform",
            "debug": true,
            "lights": [
                {
                    "name": "Kitchen LED Strip",
                    "ip": "192.168.1.111",
                    "setup": "RGBW",
                    "purewhite": false,
                    "timeout": 10000
                },
                {
                    "name": "Living Room LED Strip",
                    "ip": "DC4F22C5XXXX",
                    "setup": "RGBWW",
                    "purewhite": true
                }
            ],
            "presetSwitches": [
                {
                    "name": "Kitchen Color Strobe Flash (Party)",
                    "ips": {
                        "192.168.1.111": "255,255,255"
                    },
                    "preset": "seven_color_strobe_flash",
                    "speed": 60
                },
                {
                    "name": "All Lights Cross Fade (Soothing)",
                    "ips": {
                        "192.168.1.111": "0,150,255",
                        "DC4F22C5XXXX": "102, 255, 102"

                    },
                    "preset": "seven_color_cross_fade",
                    "speed": 40,
                    "shouldTurnOff": true
                },
                {
                    "name": "Jungle Mood (Soothing)",
                    "ips": {
                        "192.168.1.111": "0,150,255",
                        "DC4F22C5XXXX": "102, 255, 102"
                    },
                    "preset": "green_gradual_change",
                    "speed": 40,
                }
            ]
        }
    ]
}
```

Preset Switch Configuration

`ips` must be a key-value object where `key` is MagicHome LED IP Address e.g. `192.168.1.11` or `DC4F22C5XXXX` MAC Address & `value` is default rgb color of the light. e.g. `"255,255,255" (White)`.
Turning off Preset Pattern Switch , all lights will be reset to this color.

You can use MAC Address instead of IP Address as well. Please note format of MAC Address. It should be in capital letters and `:` should not be present. e.g. `DC4F22C5XXXX`

Do note : While using MACS : This plugin auto discover connected lights on the network and map IP's to their corresponding MAC. Initially it can take time to discover all devices. All devices should be discovered and mapped in 60-120s. Once mapped IP & MACs are cached, and gets rediscovered every 30s to map new IP to the light. This feature is useful for people unable to assign Static IP to their lights.

Default Discovery Interval => 5 Minutes
Default Device Status Update Interval => 1 Minute

Setting Device `timeout` to 0, will disable polling device for status update.

## Lint

```shell
    $ npm run lint
```

## Need Help ?

Get Slack Invite => `https://slackin-znyruquwmv.now.sh/`

Slack Channel => `https://homebridgeteam.slack.com/messages/homebridge-magichome`

Slack User => `@sahilchaddha`

### Author

Sahil Chaddha

mail@sahilchaddha.com
