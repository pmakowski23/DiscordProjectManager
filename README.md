# Discord Project Managment Bot

### [Invite link for the bot](https://discord.com/api/oauth2/authorize?client_id=937356374038437938&permissions=8&scope=bot%20applications.commands)

## TODO
- [ ] Add integration with github webhooks ([octokit/webhooks.js](https://github.com/octokit/webhooks.js/))
  - [ ] command to create github integration with
    - github webhook secret
    - not reviewed PRs reminder intervals (in days)
    - role to mention with reminder
    - do you want checks error info
  - [ ] bot will send
    - [ ] custom messages on pull requests
    - [ ] add reactions based on actions connected with PR
      - ✅ on approval
      - ♻️ on requested changes
      - 📝 on added comment
      - ❌ on any of the checks result in error
    - [ ] send message on pull request merged
    - [ ] send reminders (based on interval)
- [ ] Add event creation
  - [ ] command to create event
    - Sends private message to user
      - Asks about the name of the channel to post event and reminders
      - Asks about description
      - Asks about the date (format 7 march 2022)
      - Asks about the time (format 17:00 - 18:00)
      - Asks if event is recurring
      - Asks about possible responses
        - user can choose default (Going, Tenative, Not going)
        - or before used (data from db)
        - if not can specify custom responses
          - icon
          - name
      - Asks about roles to mention
      - Asks about the reminder
        - when to send reminder (time relative to event)
        - who to mention (users who responded in specific way, guild roles)
    - After each question ask user if data is proper and give option to change it.
  - [ ] Google calendar sync
  - [ ] sends reminder before event
  - [ ] during event
    - Creates thread with event name
- [ ] Store data in database
  - [ ] Guild
    - Id
    - Name
  - [ ] Project has
    - Id 
    - Guild Id
    - Name
    - Shortname
    - Users (User[])
    - Github integration 
      - Github url
      - Github secret
  - [ ] User has
    - Id
    - Guild Id[]
    - Display Name
    - Username
    - Joined at (date)
    - Roles in project
    - Custom responses
      - Response Id
      - Guild Id
  - [ ] Event has
    - Id
    - Name
    - Created by (User Id)
    - Description
    - Date
    - Time
    - isRecurring
    - Responses
      - User Id[]
      - Response Id

## Commands

- `/new-project {name}` creates new category based on provided name and basic roles and channels connected with the project 
- `/clear` to clear all channels and roles with DW in them (for testing purposes)

## New project
for demonstration purposes:
- Project shortname: DW
- Project name: Dream work
- channel name is preceded with `#`

New project creates 1 category with the new project name and 4 channels in that category:
- Dream work
  - `#DW-general` - can be used for general conversation about a project
  - `#DW-frontend` - to be used only for frontend related topics
  - `#DW-backend` - to be used only for backend related topics
  - `#DW-devops` - to be used only for devops related topics

And also roles from that channel names with additional `DW-projectManager`

`DW-general`, `DW-frontend`, `DW-backend` and `DW-devops` roles have access only to `#DW-general` and role specific channels in the project. `DW-projectManager` role, on the other hand has access to every channel connected with the project.

After creation of the roles and channels, 2 messanges are sent:
- to the channel from where command was invoked with information, that new project is created and a button that gives you `DW-general` role so you can participate in that project.
- to `#DW-general` channel of the project with roles that user can have in the project (`DW-frontend`, `DW-backend`, `DW-devops`) and button that can assign proper roles
that are then pinned to the channels
