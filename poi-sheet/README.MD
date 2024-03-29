![](https://img.shields.io/badge/Foundry-v9.269-informational)
![](https://img.shields.io/badge/D&D5e-v1.6.1-informational)

## Points of Interest Actor Sheet

* **Author**: Sky#9435
* **Version**: 0.1.3
* **Foundry VTT Compatibility**: 9.269
* **System Compatibility**: D&D 5e 1.6.1

### Link(s) to Module
* [https://github.com/Sky-Captain-13/foundry/tree/master/poi-sheet](https://github.com/Sky-Captain-13/foundry/tree/master/poi-sheet)

### Description
The Points of Interest Actor Sheet adds a new Actor Sheet for the D&D 5e System that allows you to create points of interest on a world map using an actor sheet and token instead of using a Journal and making a map note. There are several benefits to making points of interest this way, but it has the potential to add "bloat" to your Actor directory in the sidebar.

1. You are not limited to a specific set of icons for map notes. You can use any image for your point of interest on the map, the same way you would change an actor's token.
2. You can right click and hide or reveal a point of interest token on the map.
3. The selection border matches the grid shape (square or hex). Yay for OCD.
4. The sheet could potentially be expanded to include stats for points of interest for strategic gameplay like Pathfinder Kingmaker.

To use the PoI Sheet, create a new Actor using the Character type and then edit the actor's Sheet at the top of the character sheet window and change it to `dnd5e.PoISheet`

## Patch Notes
### Version 0.1.3
* CSS Fix for the `Type` and `Status` input boxes

### Version 0.1.2
* Compatibility update for Foundry v9.242

### Version 0.1.1
* Compatibility update to Foundry v9.238

### Version 0.1.0
* Update to Foundry 0.8.7
* Fixed data display issue
* Data _should_ be there still... _should_ display properly, but I can't be 100% sure since I don't have a way to test it easily. MAKE BACKUPS OF YOUR WORLD.

### Version 0.0.8
* Version compatibility update to 0.7.8

## Installation
### Method 1
* Open the Foundry application and click **"Install Module"** in the **"Add-On Modules"** tab.
* Paste the following link: https://raw.githubusercontent.com/Sky-Captain-13/foundry/master/poi-sheet/poi-sheet/module.json
* Click "Install"
* Activate the module in your World using **Manage Modules** under the **Game Settings** tab.

### Method 2
Extract the poi-sheet.zip file to the public/modules directory. Use the `Manage Modules` in your World on the Settings tab of the sidebar on the right and then enable the `Point of Interest Character Sheet` module.

## License
This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
