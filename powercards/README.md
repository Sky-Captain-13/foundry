This is an abso-bally-lutely super, duper basic alpha version that has almost no frilly features other than making a pretty card in chat. 
```yaml
Do NOT ask me for help making powercards. Figure it out on your own for now.
```
## Sample Powercard
Spelling and capitalization matters when using an attribute call such as @{Mouse|dex}.
```yaml
!power {{
--emote|Mouse stabs viciously at her foe with a jagged shortsword.
--title|Shortsword
--title_txcolor|#FFFFFF
--title_bgcolor|#004400
--subtitle|« Melee Weapon Attack • Reach (5 ft) »
--Attack:|[[1d20 + @{Mouse|pb} + @{Mouse|dex} ]] | [[1d20 + @{Mouse|pb} + @{Mouse|dex} ]] vs @{Goblin|ac} AC
--Damage:|[[1d6 + @{Mouse|dex} ]] piercing
--Critical Hit:|[[1d6]] additional damage
}}
```
![image](https://i.imgur.com/jhC4yIc.png)

## Attribute Setup on Simple Worldbuilding System
![image](https://i.imgur.com/dM1izU3.png)

## Patch Notes
### Version 1.0.1
* Fixes powercard use by players with attribute calls. Any attribute call would cause powercards to crash and not work for players.
* Minor refactor of code to prepare for further updates

### Version 1.0.0
* Major refactor for further updates
* Added attribute calls @{Actor Name|Attribute}
