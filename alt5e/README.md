![](https://img.shields.io/badge/Foundry-v9.269-informational)

![](https://img.shields.io/badge/D&D5e-v1.6.1-informational)

## Alt5e
* **Author**: Sky#9435
* **Version**: 1.7.5
* **Foundry VTT Compatibility**: 9.269
* **System Compatibility**: D&D 5th Edition 1.6.1

### Link(s) to Module
* [https://foundryvtt.com/packages/alt5e/](https://foundryvtt.com/packages/alt5e/)
* [https://github.com/Sky-Captain-13/foundry/tree/master/alt5e](https://github.com/Sky-Captain-13/foundry/tree/master/alt5e)

### Description
This module provides an alternate skin/layout of the default D&D 5th edition character sheet in Foundry.

![image](https://i.imgur.com/puHgzhE.png)
![image](https://i.imgur.com/ngzG3K7.png)

## Patch Notes
### Version 1.8.0
* Fixed spell components that were showing up as `[Object object]`
* Spell component icons right aligned instead of centered
* Adjusted css on spellcasting attribute dropdown, DC, and filters
* Fixed missing item attunement required/attuned icon in Inventory
* Adjusted CSS on currency (larger text, wider input box, bottom border returned)

### Version 1.7.5
* Compatibility update for Foundry v9.242

### Version 1.7.4
* Actually fixed deleting items this time.

### Version 1.7.3
* Confirmation dialog when deleting an item fixed. Was throwing an error due to stupid deprecated function bullshit.

### Version 1.7.2
* Corrects error thrown by Foundry v9.238 when attempting to edit an item from the Favorites section
* Fixed an issue that would send Known Languages to chat when editing your languages
* Adjusted css to clean up a few problems

### Version 1.7.1
* Removes an errant bit of code throwing an error when injecting passive skills into the sheet

### Version 1.7.0
* Added skill configuration options from core sheet

### Version 1.6.1
* Corrected currency labels

### Version 1.6.0
* Updated HTML for new automatic Armor Class calculation options

### Version 1.5.2
* Foundry version compatibility update to 0.7.9
* Minor css adjustments
* Sheet no longer forces itself to be the default sheet

### Version 1.5.1
* Restored display of passives in Traits
* Changed position and style of passives
* Changed position and style of Size dropdown
* Moved the Special Traits configuration button to the top of the Traits section

### Version 1.5.0
* Version compatibility update for D&D 1.2.0
* Adjusted to new configuration buttons setup
* Added new senses configuration

### Version 1.4.3
* Version compatibility update to 0.7.8

### Version 1.4.2
* Adds equip/unequip item toggles in the Favorites section
* Changes the sheet name in the chooser to a human readable format

### Version 1.4.1
* Updated to Foundry v077 and D&D v111
* Fixed death saves
* Added option to roll initiative from the character sheet
* Many css adjustments
* Drag and drop error in Favorites sorted
* Fixed compatibility with Inventory+ module

### Version 1.4.0
* Version update for compatibility
* Adds support for Active Effects tab
* Major fixes to CSS changed recently
* Update to new speed format

### Version 1.3.6
* Version update for compatibility

### Version 1.3.5
* CSS adjustment to TinyMCE editor
* Fixes the double button bug with Inventory+
* Foundry compatibility update

### Version 1.3.4 
* CSS adjustments due to font changes in D&D 0.94
* Added compatibility with Inventory+ module by Felix
* Added css compatibility with Luminous for prepared spells

### Version 1.3.3
* Minor CSS adjustments
* Added back the ability to click on Languages and send your known languages to chat

### Version 1.3.2
* Added height: -moz-fit-content to alt5e.css to fix firefox compatibility

## Installation
### Method 1
* Open the Foundry application and click **"Install Module"** in the **"Add-On Modules"** tab.
* Paste the following link: https://raw.githubusercontent.com/Sky-Captain-13/foundry/master/alt5e/alt5e/module.json
* Click "Install"
* Activate the module in your World using **Manage Modules** under the **Game Settings** tab.

### Method 2
Extract the alt5e.zip file to the public/modules directory. Use the `Manage Modules` in your World on the Settings tab of the sidebar on the right and then enable the `Sky's Alternate 5th Edition Dungeons & Dragons Sheet` module.

## License
This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
