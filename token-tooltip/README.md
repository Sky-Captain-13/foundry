![](https://img.shields.io/badge/Foundry-v0.4.4-informational)
## Token Tooltips

* **Author**: Sky#9453, @solfolango77#0880  (Discord)
* **Version**: 1.2.4
* **Foundry VTT Compatibility**: 0.4.4 to 0.5.5
* **System Compatibility**: D&D 5e
* **Module Requirement(s)**: None
* **Module Conflicts**: VTTA Party (Disable tooltips in VTTA Party)

### Link(s) to Module
* [https://github.com/Sky-Captain-13/foundry/tree/master/token-tooltip](https://github.com/Sky-Captain-13/foundry/tree/master/token-tooltip)

### Description
This module adds a tooltip that displays vital stats when hovering over a token.

## Installation
### Method 1
* Open the Foundry application and click **"Install Module"** in the **"Add-On Modules"** tab.
* Paste the following link: https://raw.githubusercontent.com/Sky-Captain-13/foundry/master/token-tooltip/token-tooltip/module.json
* Click "Install"
* Activate the module in your World using **Manage Modules** under the **Game Settings** tab.

### Method 2
Extract the deselection.zip file to the public/modules directory. Use the `Manage Modules` in your World on the Settings tab of the sidebar on the right and then enable the `Token Tooltip` module.

## Foundry 0.4.4 Update
As of January 10th 2020, the module.json includes a minimumCoreVersion 0.4.4 and will cease to work for earlier installs.

## Token Tooltip Update Notes
**Version**: 1.2.4
* Corrected error in module.json that prevented the module from being installed

**Version**: 1.2.3
* Added coreCompatibilityVersion to module.json to get rid of the yellow compatibility risk box

**Version**: 1.2.2
* Added support for the Observant feat. Simply include a feature named Observant on your character sheet, and token tooltip will automatically add +5 to your passive perception and investigation scores in the tooltip.

**Version**: 1.2.1
* Fixed temphp showing up as NaN after being deleted from the character sheet.

**Version**: 1.2.0
* Removed listeners to prevent lag from excessive polling of mouse movements, particularly while panning the map.
* Adjusted the method by which tooltips are created and removed, making it much less likely to get a tooltip stuck on the screen.
* Tooltip properly shows hp with +temphp and +maxhp added.

**Version**: 1.1.1
* Corrected CSS conflict with VTTA Party
* Added a three second timeout to remove the tooltip. Helps clear up issues where the tooltip would get stuck.

## License
This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
