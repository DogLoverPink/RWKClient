# Features

## File Menu
### Import File
Here, you can import a file from your device into RWK's file database. Files could be anything from a .kitty file, a save file (.sav), or if you just want to override settings.txt with your own version, go ahead!
When you select a file from your device, you will be met with a popup that looks like this:
![image](https://github.com/user-attachments/assets/c4a8b21a-02e8-4391-9967-9907bb5721b9)
Either, you can enter in a file path yourself (like `/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/test.kitty` for a level file for example), or you can choose to override an existing file from the dropdown. 
It's an either/or situation, you don't need to fill in both, and the program will use the manually typed input only if the dropdown is set to "Write Path Manually." There's also a button that will copy over the dropdown contents into the manual input box.  
Also, if you import a file and you notice your game no longer boots, look at the [guide on how to fix it](https://github.com/DogLoverPink/RWKClient/new/main#help-my-screens-black-after-i-deletedimported-a-file)

### Export File
Here, you can export a file from the RWK file database. This is for if you want to enter the path manually, which unless you know what you're doing, is probably a no, use **Export File (List)** for a better experience
### Export File (List)
Here, you can choose a file to export from the whole list of available files. For reference, your makermall levels are stored like `/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/test.kitty`, and level save file are stored like `/RAPTISOFT_SANDBOX/RWK/MMRESUME-99999.sav
`, where "99999" is the ID of the level you were playing. (Obtained by right clicking the level icon, and doing "Get a Link to This Level," and noting the 5 digits at the end of the URL)

### Delete File (List)
Here, you can delete files from the RWK file database. I personally wouldn't recomend deleting level files this way unless the level is undeletable normally (like in the case of where a level contains a swear word).  
**In general, deleting random RWK files is risky, please only delete if you know what you're doing!**

## Level Menu
### Duplicate Level
Here, you can duplicate a level that you have saved in your makermall. If you just created level recently, make sure to do, Level -> Refresh Known Levels so that the client can know about it. (Or restart the program).  

### Download Current Level
Here, you can download the current level that you are playing to your makermall. Once the page refreshes, check the "My Levels" tab in your makermall, and you should see the level listed there (it may or may not be at the top).  
##### NOTE: For technical reasons, you need a level saved in your makermall before you can use this feature. It doesn't need to have any content, or be uploaded, it just needs to exist. If you just made your first level, make sure to Level -> Refresh Known Levels

### Refresh Known Levels
Using this will just allow the client the refresh what levels it thinks you have. This should only be needed if you're one of the 2 above features.

## Editor Menu
These tools are primarily for use with [mrmasterplan's 3rd party editor plugin](https://github.com/mrmasterplan/rwklevelfiles).
### Copy Current Level Base64 to Clipboard
Honestly, This feature probably doesn't need to exist, I just implemented it in early development, and never removed it. All this does is copy the contents of the current level you're playing to Base64, and puts it on your clipboard.
You could in theory put this in a .kitty.b64 file and use it with mrmasterplan's editor, but it's probably easier to just use the export file tool.
### Set Currently Edited .kitty File
This allows you to tell the client what .kitty file you're currently working on, for use with the next tool, "Upload current .kitty file."  The idea with this tool is that if you're working on a level, you can save it in the format .kitty, 
and then modify and save like normal, with crtl + s or whatever, in the tiled editor. Then you (only need to 1 time per level), can select that .kitty file with this tool. (continued explanation in the next tool explanation)
### Upload Current .kitty File
Once you have told the client what file you're currently editing, you can just use this tool to automatically put it into your maker mall, without having to go through the process of opening the console and pasting the the .kitty.js script.
The good thing about this is that you only have to set .kitty file once. Once you set it, you can use this tool, and it will know what file you last chose, even if you close and reopen the client. Once you finally finish your level, or if you just 
want to upload a different one, you can just select a new .kitty file and repeat.

## Practice
Practice mode is basically just glorified save-scumming. The point of the tool is that you can get to point in a level that may take you multiple attempts to beat, and you can click "Start Practice" to create a save point, which you can easily go back to later.  
  
However, this tool is not intended for cheating! The point of this tool is that after you feel like you've practiced that hard jump enough times, you can click end your practice and try for real (via Practice -> End Practice).
Any time after you start a practice, you can reset time back to the last saved checkpoint (or start of the practice), by clicking "Restart from last checkpoint." This will not just set your robot position back, but also reset the entirety of the level back to that point,
including mobs, destroyed blocks, powerups you have, and everything else.  

Also, during a practice, you can create a new checkpoint. That just means that your robot's current position is going to be the point that you respawn at when you "restart from the last checkpoint." This will obviously not affect your real save file in any way.
  
**VERY IMPORTANT!!!: Any time you either A) start a new practice, or B) create a new checkpoint, MAKE SURE YOU QUIT AND REJOIN THE LEVEL BEFORE DOING SO!! This will ensure that the point you're starting from is actually your current robot position, instead of a position from 10-30 seconds ago*** 
  
*By, "quit and rejoin", I mean just the RWK level, you don't have to restart the client or anything

## View
I dunno man, it seems pretty self explanatory to me, just read the options and I'm sure you'll know what's up.
 


## HELP MY SCREEN'S BLACK AFTER I DELETED/IMPORTED A FILE
If you just did an import or delete operation, and you notice that your RWK no longer boots and just gets stuck on a black screen, don't worry, it is probably fixable. Well, I didn't actually test all the cases for accidently deleting, 
so you may be out of luck there, but if you accidently imported something and it broke, do the following. <br>
 I. Firstly, just try closing and reopening the program. It probably won't do much, but who knows.  
 II. Try to delete the file you just imported via the "Delete File (List)" option, you __might__ be able to see it in the list. If you do, just try to do delete it, then either go to view -> force reload, or just close and reupload the program.  
 II. If you don't see the file that you just imported in the list, then you're going to have to delete it from the web browser's developer tools. Here's how you can do it  
 1. Click on the menubar item "View"
 2. Click on "Toggle Developer Tools"
 3. Click the tab that say "Application" (You might have to make the window bigger
 4. On the left, under the thing that says "Storage," click on and expand "IndexedDB"
 5. Click on "/RAPISOFT_SANDBOX'
 6. Click on "FILE_DATA"
 7. Find the file that you just imported. It is likely near the top, but it might not be. Make sure to check the whole list until you find it (might have to scroll down)
 8. Click on the trashcan icon near the top
 9. Soon after doing step 8, either reload the page via "View" -> "Force Reload," or close and reopen the program 
  <img width="1280" alt="Screenshot 2025-06-30 164017" src="https://github.com/user-attachments/assets/58ccbc7a-38f3-400c-9609-9b505aad05b7" />
