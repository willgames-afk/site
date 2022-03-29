import json, os, re
theMap = { "data": [[{ "desc": "You enter a test room. The test must have been successful.", "exit": ["south"] }, False], [{ "desc": "This test worked too!", "exit": ["south", "east", "north"] }, { "desc": "This test has a Debug Stick! Type grab to pick it up.", "exit": ["west"], "loot": ["debugStick"] }], [{ "desc": "You enter a room with a big bug in it. It seems to be blocking an exit. If only you had something to debug it with by typing use.", "exit": ["north"], "locked": { "onUnlock": "You whack the bug with the debug stick. Some code shifts around, and the bug poofs out of existance.", "move": "south", "use": "debugStick" } }, False], [{ "desc": "You have reached the end of this test map. If you poke will a lot, maybe he'll make another one.", "exit": [] }, False]], "startText": "This map was designed by will kam, and is just a test. To load a different map, download it, select the file by clicking the \"Choose File\" button, and type loadmap.\n", "directions": { "north": { "x": 0, "y": -1, "opp": "south" }, "south": { "x": 0, "y": 1, "opp": "north" }, "east": { "x": 1, "y": 0, "opp": "west" }, "west": { "x": -1, "y": 0, "opp": "east" } } }
aI = {
    "debugStick": {
        "name": "Debug Stick",
        "desc": "A Debug Stick. Grants the power of debugging. Can also be used to whack things.",
        "pers": True
    }
}
player = {
    'x': 0,
    'y': 0,
    'inventory': {},
    'lastMove': 'not'
}
#CONVIENIENCE FUNCTIONS
def currentCell():
    return theMap["data"][player['y']][player['x']]
def clear(): os.system('clear')

#GAME COMMANDS
def loadMap():
    input("I'm about to re-write your current map")
    path = 'maps/'+input('Please enter the map name:\n')+'.json'
    print('Loading file...')
    try:
        if (os.path.exists(path)):
            with open(path,'r') as json_file:
                data = json.load(json_file)
                json_file.close()
                print("Map Loaded")
        else:
            print("That map file doesn't exist. Or I can't see it. \nEither way, I wasn't able to load it. :(")
    except IOError:
        print("I couldn't read the map file. :(")
    
def save(): #NOT DONE!! WORK ON MEEEEEE
    if not os.path.exists('cqsaves'):
        os.mkdir('cqsaves')
    name = input('What would you like to call your save?\n')
    if not re.fullmatch("[a-zA-Z0-9]+"):
        print("Sorry, but you can only use letters and digits.")
    if os.path.exists('cqsaves/'+name):
        result = input('You already have a save with that name. Would you like me to overwrite it?')
    f = open(name,"w+")


def printDesc():
    print(currentCell()['desc'])

def printInventory():
    print('Inventory: ')
    for item in player['inventory']:
        print("\033[1m"+player['inventory'][item]['name']+'\033[0m')
        print(' '+player['inventory'][item]['desc'])

def printExits():
    string = 'Possible Exits: '
    for ext in currentCell()['exit']:
        string = string + ext + ', '
    l = list(string)
    l[len(l)-2] = '.'
    string = "".join(l)
    print(string)

def printCommands():
    num = 0
    string = '\033[1mCommands:\033[0m '
    for com in aC:
        num += 1
        if num == len(aC):
            string = string + 'and ' + com + '.'
        else:
            string = string + com + ', '
    print(string)

def move(direction = player['lastMove']):
    for d in currentCell()['exit']:
        if d == direction:
            player['lastMove'] = direction
            player['x'] += theMap['directions'][direction]['x']
            player['y'] += theMap['directions'][direction]['y']
            printDesc()
            printExits()
            return True
    print("You can't go that way!")
    return False

def exit():
    raise SystemExit

def grab():
    if not "loot" in currentCell():
        print("There's nothing to grab here.") 
        return
    if type(currentCell()['loot']) == 'string': #If currentCell.loot exists and is a string turn it into a list
        theMap['data'][player['x']][player['y']]['loot'] = [theMap['data'][player['x']][player['y']]['loot']]
    if len(currentCell()['loot']) > 0:
        for i in range(len(currentCell()['loot'])):
            loot = currentCell()['loot'][i]
            player['inventory'][loot] = aI[loot] # puts the loot from the room into your inventory
        theMap['data'][player['x']][player['y']]['loot'] = [] #Makes it so that the cell no longer has loot
        printInventory()
    else:
        theMap['data'][player['x']][player['y']]['loot'] = []
        print("There's nothing to grab in this area.")


aC = {
    'north': (lambda: move('north')),
    'east': (lambda: move('east')),
    'south': (lambda: move('south')),
    'west': (lambda: move('west')),
    'grab': grab,
    'currentCell': (lambda: print(currentCell())),
    'quit': exit,

}

def runCommand(n):
    return aC.get(n, (lambda: print("I don't know how to do that!")))

#MAIN LOOP
def loop():
    txt = input("   ")
    runCommand(txt)()
    loop()


#RUN ON STARTUP
def start():
    print(' _                         _                  ')
    print('/   _   _   _  _  |  _    / \      _    _  _|_')
    print('\_ (_) | | _> (_) | (/_   \_X |_| (/_  _>   | ') 
    print('Developed by Will Kam\n')
    print("Type 'loadmap' to load a map file or type 'start' to begin.")
    startloop()
def startloop():
    txt = input('   ')
    if txt == 'start':
        print(theMap['startText'])
        print("Type 1 word commands to tell me what to do. Which one word commands? I can tell you if you type help. To use an item just type use, I'll know which one you mean.\n")
        printCommands()
        print(currentCell()['desc'])
        printExits()
        loop()
    elif txt == 'loadmap':
        loadMap()
    else:
        startloop()


start()