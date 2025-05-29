---
title: 'Software Input Switching for the LG 28MQ780 on Windows'
description: ''
pubDate: 2025-07-31
---

My **LG 28MQ780** is connected to two computers and I want to toggle its input with a single keyboard shortcut.

I installed **OnScreen Control** and **Dual Controller** from [LG’s site](https://www.lg.com/cn/support/software-firmware); neither exposes a hotkey to switch inputs.

Previously I used **Dell Display and Peripheral Manager** on a Dell monitor, which works perfectly but is limited to Dell hardware.

[ControlMyMonitor](https://www.nirsoft.net/utils/control_my_monitor.html) does **not** work — the 28MQ780 does **not** respond to the standard VCP code `0x60` for input selection [^1].

## Solution

Thankfully, I can use [kaleb422/NVapi-write-value-to-monitor: Send commands to monitor over i2c using NVapi](https://github.com/kaleb422/NVapi-write-value-to-monitor) to control the monitor with commands.

For instance, `.\writeValueToDisplay.exe 0 0xD2 0xF4 0x50`, means sending command `oxF4`(Switch input) with value `0xD2`(MONITOR_USB_C) to the I²C address `0x50`, you can find more commands and values [here](https://github.com/rockowitz/ddcutil/wiki/Switching-input-source-on-LG-monitors#theoretically-supported).

## Resources

[^1]: [Switching input source on LG monitors · rockowitz/ddcutil Wiki](https://github.com/rockowitz/ddcutil/wiki/Switching-input-source-on-LG-monitors#:~:text=Some%20of%20these%20monitors%20might%20support%20an%20alternative%20and%20non%2Dstandard%20channel%20to%20switch%20the%20input%2C%20namely%20the%20service/factory/manufacturer%20sidechannel%20%22DDC2AB%22%20(0x50%20instead%20of%200x51).)
