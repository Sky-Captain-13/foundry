![](https://img.shields.io/badge/Foundry-v0.5.5-informational)
## Deselection

* **Author**: Sky#9435
* **Version**: 0.0.4
* **Foundry VTT Compatibility**: 0.5.5
* **System Compatibility**: Universal

### Link(s) to Module
* [https://github.com/Sky-Captain-13/foundry/tree/master/query](https://github.com/Sky-Captain-13/foundry/tree/master/query)

### Description
A very basic module to implement roll queries (like Roll20's) into macros and chat. It does **NOT** work in any rolls processed from the character sheet.

## Installation
### Method 1
* Open the Foundry application and click **"Install Module"** in the **"Add-On Modules"** tab.
* Paste the following link: https://raw.githubusercontent.com/Sky-Captain-13/foundry/master/query/query/module.json
* Click "Install"
* Activate the module in your World using **Manage Modules** under the **Game Settings** tab.

### Method 2
Extract the query.zip file to the public/modules directory. Use the `Manage Modules` in your World on the Settings tab of the sidebar on the right and then enable the `Query` module.

## Query 0.0.2 Update Notes
* Fixed download url in module.json, replacing qeury with query
* Uploaded query.zip

## Query 0.0.1 Update Notes
* Initial commit to github for release
* Uses the same format as Roll20 roll queries. You **MUST** use the format below.
 * **Input Box**
    * ?{Label|Option}
 * **Drop Down Selection Box**
     * ?{Label|Option 1,value1|Option 2,value2|Option 3,value3}

## Example Macro for Spike Growth
```
<div style="font-size: 1.25em; font-family: 'Signika'; font-weight: bold; margin: 0px; padding: 0px;">Spike Growth</div><hr>
<div style="margin-bottom: 7px;"><b>Damage:</b> [[ ?{Distance Traveled|5 ft,2|10 ft,4|15 ft,6|20 ft,8|25 ft,10|30 ft,12|35 ft,14|40 ft,16}d4 ]] piercing</div>
```
![image](https://i.imgur.com/E6h31R1.png)

## License
This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
