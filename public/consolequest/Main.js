function wrapper() {
  var aC = { // aC for all commands
    north: 'north',
    south: 'south',
    east: 'east',
    west: 'west',
    forward: 'north',
    left: 'west',
    right: 'east',
    use: 'use',
    help: 'help',
    save: 'save',
    take: 'grab',
    grab: 'grab',
    save: 'save',
    stop: 'terminate',
    inventory: 'inventory',
    soth: 'soth',
    load: 'load',
    reset: 'reset',
    exit: 'e',
    map: 'map',
    downloadit: 'dload',
    loadmap: 'mapload',
    clear: 'clear',
    rem: 'rem',
    remember: 'rem',
    move: 'move'
  }
  var commandData = {
    hidden: [
      "soth"
    ],
    internal: [
      "_move"
    ],
    info: {
      north: 'Moves you north.',
      south: 'Moves you south.',
      east: 'Moves you east.',
      west: 'Moves you west.',
      forward: 'Moves you forwards (north).',
      left: 'Moves you left (west).',
      right: 'Moves you right (east).',
      move: 'Moves you in whatever direction you last went.',
      use: 'Uses any helpful items.',
      help: 'Tells you this!',
      save: 'Saves your game locally in the browser.',
      take: 'Same as grab.',
      grab: 'Grabs all accessable loot in an area and gives it to the player (You!).',
      stop: "Ends the program. Why you'd want to do that, I don't know.",
      inventory: "Opens your inventory, showing what you have. You can click on the little triangles next to each element to see more details.",
      soth: "If you see this message, talk to will; it's a bug. (Soth is a secret command)",
      load: "Loads a map file saved in your browser.",
      reset: "Resets your game. Useful in case of emergency.",
      exit: "Displays the exits of the room you're in. These are displayed by default, but this is handy in case you forget.",
      map: "Brings up the map. Currently, this doesn't work, but Will is working on it ;)",
      downloadit: "Downloads your current map as a file. This can be loaded in later by using the loadmap command, and is great because then your browser can't delete your save accidentally.",
      loadmap: "Loads a map from a file. You can select a file to load by click the file button on the webpage to the right.",
      clear: "Clears the console.",
      rem: "Short for remember",
      remember: "Tells you the description of a room. This is shown automatically the first time you enter a room, but it can be handy if you don't remember!"
    }
  }
  var message = { //Contains various messages throughout the game
    nothingToUse: "You don't have anything to use here. Not yet, anyway.",
    notUse: "There's nothing to use here.",
    grab: "There's nothing to grab in this area.",
    move: "You can't go that way!",
    saveAlert: 'Are you sure you want to save? It will erase all previous saves.',
    downloadAlert: "You sure you want to download all the map, item, AND player data for this map?",
    saveOverwriteAlert: "Loading a save will overwrite your current progress. Are you sure you want to?",
    notSave: "No? Well, you can always save later.",
    noSave: "Sorry, but I can't find your save and therefore cannot load it :(",
    saveSuccess: "Saved your game. Note that some things can erase this save, you can get a more permanant save file by typing downloadit.",
    help: "Type 1 word commands to tell me what to do. Which one word commands? I can tell you if you type help. To use an item just type use, I'll know which one you mean.\n\n",
    noMapAlert: "I don't have a map, you need to load one!",
    notstartnomap: "Not started, no map.",
    noMapDirections: "You can load a map by selecting a file using the file button over there and then typing loadmap.",
    mapOverwriteAlert: "I'm about to re-write your current map, so you'll lose all progress. This includes your save file. If you don't want that, push cancel and type downloadit to download your save.",
    mapLoadSuccess: "New map loaded. Saves have been cleared.",
    invalidMap: "Your file is not a valid map. :(",
    invalidFile: "I couldn't load the file, make sure you selected one.",
    terminateAlert: "Are you sure you want to stop this program? You will lose all unsaved progress!",
    cantTerminateAlert: "Your browser says I can't shut down. You'll just have to close this tab the old fashioned way.",
    resetAlert: "Do you REALLY want to reset all of you progress and save data!?",
    noMoveHistoryAlert: "Which way should I move again??",
    startMessage: "Started.",
    alreadyRunning: "Already running, haha lol"
  }
  var aI = {
    "debugStick": {
      "name": "Debug Stick",
      "desc": "A Debug Stick. Grants the power of debugging. Can also be used to whack things.", "pers": true
    }
  }
  var map = { "data": [[{ "desc": "You enter a test room. The test must have been successful.", "exit": ["south"] }, false], [{ "desc": "This test worked too!", "exit": ["south", "east", "north"] }, { "desc": "This test has a Debug Stick! Type grab to pick it up.", "exit": ["west"], "loot": ["debugStick"] }], [{ "desc": "You enter a room with a big bug in it. It seems to be blocking an exit. If only you had something to debug it with by typing use.", "exit": ["north"], "locked": { "onUnlock": "You whack the bug with the debug stick. Some code shifts around, and the bug poofs out of existance.", "move": "south", "use": "debugStick" } }, false], [{ "desc": "You have reached the end of this test map. If you poke will a lot, maybe he'll make another one.", "exit": [] }, false]], "startText": "This map was designed by Will Kam, and is just a test. To load a different map, download it, select the file by clicking the \"Choose File\" button, and type loadmap.\n", "directions": { "north": { "x": 0, "y": -1, "opp": "south" }, "south": { "x": 0, "y": 1, "opp": "north" }, "east": { "x": 1, "y": 0, "opp": "west" }, "west": { "x": -1, "y": 0, "opp": "east" } } }
  var textMap = 'Not Available '
  var player = {
    x: 0,
    y: 0,
    inventory: {},
    lastMove: 'not'
  }
  var originalMap = JSON.stringify(map);
  var originalPlayer = JSON.stringify(player);
  //var loadMessage = ['Loading...', 'Still Loading...', 'Working...', '...', 'Still not done...', 'Almost Kinda Halfway...', 'Processing...']
  var started = false;


  function startAll() { // starts the whole thing, triggered by start or init commands
    if (!started) {


      if (!map.data) {
        //If no map data, sound the alarm
        alert(message.noMapAlert);
        displayText(message.noMapDirections);
        return message.cantstartnomap

      } else {

        started = true;
        initCommands();
        createCompletionElements();
        displayText(map.startText + '\n' + message.help + '\n' + currentCell.desc);

        return message.startMessage
      }

    } else {
      //displayText("Already Running.", '', false)
      return message.alreadyRunning
    }
  }

  function initCommands() { // Very similar to code used in Google's Text Adventure, just wanted to give credit.
    var win = this; // "this" is window, var win is just the window object
    //this.commandExecute = {}; // whether a command was called or not is stored in this object
    var b = {}, command;       //All the b.num and d.num stuff is magic to me.
    for (command in aC) {
      b.num = command;
      //win.commandExecute[aC[b.num]] = false;
      Object.defineProperty(window, b.num, {
        get: function (d) {
          return function () {
            //win.commandExecute[aC[d.num]] = true;
            win.commands[aC[d.num]]()
            return d.num;
          }
        }(b)
      });
      b = { num: b.num } //I think this is to detach b from the properties defined in Obect.defineProperty
    }
  }
  Object.defineProperty(window, 'start', { get: function () { return startAll() } });
  Object.defineProperty(window, 'START', { get: function () { return startAll() } });
  Object.defineProperty(window, 'Start', { get: function () { return startAll() } });
  Object.defineProperty(window, 'init', { get: function () { return startAll() } });
  Object.defineProperty(this, 'currentCell', { get: function () { if (map.data) { return map.data[player.y][player.x] } } });

  function printInventory() { //Prints your inventory. 
    console.group('Inventory:')
    for (var item in player.inventory) {
      console.groupCollapsed(player.inventory[item].name)
      console.log(player.inventory[item].desc)
      console.groupEnd()
    }
    console.groupEnd()
  }

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function createCompletionElements() {
    if (!map.data[player.x][player.y].vis) {
      for (i = 0; i < map.data.length; i++) {
        for (j = 0; j < map.data[i].length; j++) {
          if (map.data[i][j]) {
            map.data[i][j].vis = false;
          }
          if (map.data[i][j].locked) {
            map.data[i][j].locked.comp = false;
          }
        }
      }
    }
  }

  var i = 0;

  commands = {
    terminate() {
      if (confirm(message.terminateAlert)) {
        window.close()
        displayText(message.cantTerminateAlert, '', false)
      }
    },
    help() {
      displayText('Accepted Commands: ', '', false);
      for (command in aC) {
        if (!(commandData.hidden.includes(command))) {
          console.log(`%c${command}%c:\n${commandData.info[command]}`, 'color:green', '');//had to use console.log here due to styling.
        }
      }
      displayText("To use an item just type use, I'll know which one you mean.", '', false)
    },
    save() {
      if (confirm(message.saveAlert)) {
        localStorage.clear();
        localStorage.setItem('map', JSON.stringify(map)); // Turns the 3 objects used in the game into text localStorage can store.
        localStorage.setItem('player', JSON.stringify(player));
        localStorage.setItem('items', JSON.stringify(aI));
        displayText(message.saveSuccess);
      }
      else {
        displayText(message.notSave);
      }
    },
    load() {
      if (confirm(message.saveOverwriteAlert)) {
        var savedMap = localStorage.getItem('map');
        var savedPlayer = localStorage.getItem('player');
        var savedItems = localStorage.getItem('items');
        if (savedMap && savedPlayer && savedItems) {
          map = JSON.parse(savedMap) // Turns the stringified object back into an actual object.
          player = JSON.parse(savedPlayer)
          aI = JSON.parse(savedItems)
          createCompletionElements()
          printInventory();
          displayText(currentCell.desc)
        } else {
          displayText(message.noSave, '', false)
        }
      }
    },
    grab() {
      if (currentCell.loot && !Array.isArray(currentCell.loot)) {
        currentCell.loot = [currentCell.loot]
      }
      if (currentCell.loot && currentCell.loot.length > 0) {
        for (i = 0; i < currentCell.loot.length; i++) {
          //console.log(i)
          loot = currentCell.loot.slice(i, i + 1);
          player.inventory[loot] = aI[loot] // puts the loot from the room into your inventory
        }
        currentCell.loot = []//Makes it so that the cell no longer has loot
        printInventory()
      } else {
        currentCell.loot = [];
        displayText(message.grab)
      }
    },
    inventory() {
      console.group('Inventory:')
      for (var item in player.inventory) {
        console.groupCollapsed(player.inventory[item].name)
        console.log(player.inventory[item].desc)
        console.groupEnd()
      }
      console.groupEnd()
    },
    use() {
      used = false
      if (currentCell.locked) {
        if (!Array.isArray(currentCell.locked.use)) {
          currentCell.locked.use = [currentCell.locked.use]
        }
        for (item in player.inventory) { // checks if you have something useful

          for (i = 0; i < currentCell.locked.use.length; i++) {

            if (currentCell.locked.use[i] == item) {
              used = true
              exitOpen = ''
              //If there is a move property...
              if (currentCell.locked.move) {
                exitOpen = '\nAn exit opens up to the '
                if (Array.isArray(currentCell.locked.move)) { //if the move property is an array, we need to add all the array elements
                  if (currentCell.locked.move.length == 1) { // if it's only one long I can't put an 'and' in so this is a thing
                    exitOpen = exitOpen + currentCell.locked.move[0] + '!'
                    //console.log("added one from array")
                    currentCell.exit.push(currentCell.locked.move[0])
                  } else {
                    for (i = 0; i < currentCell.locked.move.length; i++) {
                      currentCell.exit.push(currentCell.locked.move[i]) // add the unlocked exit to the exits list
                      if (i == currentCell.locked.move.length - 1) {
                        exitOpen = exitOpen + 'and ' + currentCell.locked.move[i] + '!'
                      } else {
                        exitOpen = exitOpen + currentCell.locked.move[i] + ', '
                      }
                    }
                    //console.log("added "+i+" from array")
                  }
                } else { // if the move property isnt an array run the old code
                  exitOpen = exitOpen + currentCell.locked.move + '!'
                  currentCell.exit.push(currentCell.locked.move)
                  //console.log("added string")
                }
              }
              //If there's loot...
              if (currentCell.locked.loot) {
                if (!currentCell.loot) {
                  currentCell.loot = [];
                }
                currentCell.loot.push(currentCell.locked.loot)
              }

              displayText(currentCell.locked.onUnlock + exitOpen)

              if (!player.inventory[item].persistant == true) {
                delete player.inventory[item] // if the item isn't persistant it is deleted after its use
              }
              break
            }


          }
          if (used) {// have to break out of both loops (this one gave me some real trouble)
            break
          }
        }
        if (!used) {
          displayText(message.nothingToUse) // you dont have anuything useful
        }
      } else {
        displayText(message.notUse)
      }
    },
    soth() {
      displayText('Something falls into your backpack but climbs out and grabs onto your head. Type inventory to see what it is.');
      player.inventory.soth = aI.soth;
    },
    reset() {
      if (confirm(message.resetAlert)) {
        localStorage.clear();
        map = JSON.parse(originalMap);
        player = JSON.parse(originalPlayer);
      }
    },
    e() {
      //Displays the exits of a room.
      displayText('', '', true);
    },
    map() { //WIP
      textmap = [];
      for (y = 0; y < map.data.length; y++) {
        textmap[y] = [];
        for (x = 0; x < map.data[y].length; x++) {
          if (!map.data[y][x]) {
            textmap[y][x] = " ";
          } else {
            textmap[y][x] = ".";
          }
        }
        textmap[y] = textmap[y].join("");;
        textmap[y] += "\n";
      }
      textmap = textmap.join("");
      displayText(textmap, '', false);
    },
    dload() {
      if (confirm(message.downloadAlert)) {
        data = JSON.stringify([JSON.parse(originalMap), JSON.parse(originalPlayer), aI]);
        download("data", data);
      } else {
        displayText(message.notSave);
      }
    },
    mapload() {
      const file = document.getElementById('file')
      if (file.files[0] && file.files[0].type == 'text/plain') {
        var reader = new FileReader();
        reader.readAsText(file.files[0]);
        reader.onload = function (e) {
          everything = e.target.result;
          try {
            finalFile = JSON.parse(everything);
          } catch (e) {
            console.log(message.invalidMap);
            return false;
          }
          if (confirm(message.mapOverwriteAlert)) {

            map = finalFile[0];
            player = finalFile[1];
            aI = finalFile[2];
            createCompletionElements();
            if (map.data[0][0].vis) {
              localStorage.clear();
            }
            console.clear();
            console.log(message.mapLoadSuccess);
            startText = map.startText;
            displayText(map.startText + '\n' + message.help + '\n' + currentCell.desc);
          }
        }
      } else {
        console.log(message.invalidFile);
      }
    },
    clear() {
      console.clear()
      displayText(message.help + currentCell.desc)
    },
    rem() {
      displayText('\nYou remember when you visited this area...\n%c' + currentCell.desc, 'font-style: italic;');
    },
    _move(direction) {
      if (typeof map.directions[direction] == "string") {
        //defreference to map object
        direction = map.directions[map.directions[direction]];
      }
      if (currentCell.exit.includes(aC[direction])) {
        player.lastMove = aC[direction];
        player.y += map.directions[direction].y;
        player.x += map.directions[direction].x;
        if (currentCell.vis) {
          if (currentCell.vdesc) {
            displayText('\nYou move ' + direction + " and enter a room you've already visited.\n" + currentCell.vdesc);
          } else {
            displayText('\nYou move ' + direction + " and enter a room you've already visited.\n%c" + currentCell.desc, 'font-style: italic;');
          }
        } else {
          displayText('\nYou move ' + direction + ' and enter a new area.\n' + currentCell.desc);
        }
        if (currentCell.locked && currentCell.locked.comp) {
          if (currentCell.locked.compText) {
            displayText('\nYou move ' + direction + " and enter a room you've completed.\n" + currentCell.locked.compText);
          } else {
            displayText("\nYou enter a room you've completed. Type remember (rem for short) to remember what happened here");
          }
        }
        currentCell.vis = true;
      }
      else {
        displayText(message.move);
      }
    },
    move() {
      if (player.lastMove != 'not') {
        this._move(player.lastMove)
      } else {
        displayText(message.noMoveHistoryAlert, '', false)
      }
    }
  }
  for (direction in map.directions) {
    //Sets up direction commands (north south etc)
    function makeDirection(d) { //Fancy Wrapper Function
      return function () {
        this._move(d)
      }
    }
    commands[direction] = makeDirection(direction);
  }

  //   Function that takes care of displaying text.
  //   txtras is short for text extras. 
  function displayText(text = '', txtras = '', displayExits = true) {
	if (txtras) {
		console.log(text, txtras);
	} else if (text) {
		console.log(text);
	}
	if (displayExits) {
		if (currentCell.exit.length > 0) {
		console.log(`\nPossible Exits: ${currentCell.exit.join(', ')}.`); //txtras);
		} else {
		console.log("Possible Exits: None.")
		}
	}
  }

  //Initializing
  //note: can't fully initialize because it doesn't start until you type start, so all the commands except start have to be
  //initiated after that.
  console.log(' _                         _                  \n/   _   _   _  _  |  _    / \\      _    _  _|_\n\\_ (_) | | _> (_) | (/_   \\_X |_| (/_  _>   | ')
  console.log('Game developed by Will Kam\n')
  console.log('Type START to continue.');

}; wrapper(); //Hides all the "global" vars, preventing hacking (somewhat)