const IconSetter = (() => {
  // VERSION INFORMATION
  const IconSetter_Author = "Sky#9453";
  const IconSetter_Version = "0.0.1";
  const IconSetter_LastUpdated = 1603546352;
  
  // FUNCTIONS
  const handleInput = function(message, chatData) {
    if (chatData.includes("!icon")) {
      // ERROR NOTIFICATIONS
      if (!game.user.isGM && !game.user.targets.size) {
        ui.notifications.warn('You must have one or more tokens targeted to use this command.');
        return false;
      }
      if (game.user.isGM && !canvas.tokens.controlled.length) {
        ui.notifications.warn('You must have one or more tokens selected to use this command.');
        return false;
      }
      if (chatData.replace("!icon", "").trim() === "") {
        ui.notifications.warn('Your command is missing an icon name.');
        return false;
      }
      
      // DATA PREPARATION
      let activeGM = game.users.find(a => a.active && a.isGM)._id || false;
      let icon = chatData.replace("!icon", "").trim();
      let selected = (game.user.isGM) ? canvas.tokens.controlled.map(a => a.data._id) : [];
      let targeted = selected.concat(Array.from(game.user.targets).map(a => a.data._id));
      let targets = targeted.filter((item, pos) => targeted.indexOf(item) === pos);
      let data = { activeGM: activeGM, icon: icon, targets: targets };
      if (game.user.isGM) processCommand(data);
      else game.socket.emit("module.icon-setter", data);
      return false;
    }
  };
  
  // SET THE ICON USING THE FIRST ACTIVE GM FOUND
  const processCommand = function(data) {
    if (game.user.id == data.activeGM) {
      for ( let target of data.targets ) {
        canvas.tokens.get(target).toggleEffect(`../../icons/svg/${data.icon}.svg`);
      }
    }
  }
  
  // HOOKS
  Hooks.on("ready", function() {
    Hooks.on("chatMessage", handleInput);
    game.socket.on("module.icon-setter", processCommand);
    console.log("-=> IconSetter v" + IconSetter_Version + " <=- [" + (new Date(IconSetter_LastUpdated * 1000)) + "]");
    //console.log(Date.now().toString().substr(0, 10));
  });
})();